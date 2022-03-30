const {
	CLIENT_ID,
	SPOTIFY_TOKEN_URL,
	CLIENT_SECRET,
	REDIRECT_URL,
	SPOTIFY_AUTH_URL,
} = require('../utils/consts')
const { convertMsToString } = require('../utils/convertMsToString')
const generateRandomString = require('../utils/random-generator')
const axios = require('axios')
const qs = require('qs');
const Track = require('../models/Track.model');
const Link = require('../models/Link.model');
const User = require('../models/User.model');
const { all } = require('../routes/settings.routes');


function fabricateRedirectUrl(state) {
	const scopes = 'user-read-private user-library-read playlist-modify-private playlist-read-collaborative playlist-read-private playlist-modify-public user-top-read';
	console.log('REDIRECT_URL', REDIRECT_URL);
	const url = new URL(SPOTIFY_AUTH_URL);
	url.searchParams.append('response_type', 'code');
	url.searchParams.append('client_id', CLIENT_ID);
	url.searchParams.append('scope', scopes);
	url.searchParams.append('redirect_uri', REDIRECT_URL);
	url.searchParams.append('state', state);
	return url;
}

function redirectSpotifyLogin(req, res, next) {
	const state = generateRandomString(32);
	req.session.state = state;
	const url = fabricateRedirectUrl(state)
	res.redirect(url.href);
}

async function getSpotifyToken(currentUser, userCode) {
	const data = {
		code: userCode,
		redirect_uri: REDIRECT_URL,
		grant_type: 'authorization_code'
	};

	const headers = {
		'content-type': 'application/x-www-form-urlencoded',
		'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
	}

	try {
		const authResp = await axios({
			method: 'POST',
			headers,
			data: qs.stringify(data),
			url: SPOTIFY_TOKEN_URL,
		});
		return authResp.data.access_token;
	} catch (error) {
		return error.data;
	}
}

async function fetchEndpoint(authToken, url) {
	const headers = {
		'Authorization': 'Bearer ' + authToken
	}
	const { status, data } = await axios({
		method: 'GET',
		headers,
		url
	});
	if (status != 200) {
		throw new Error(data);
	}
	return data;
}

async function insertLinks(currentUser, trackIds) {
	const userLinks = await currentUser.getLinks();
	trackIds = trackIds.filter(id => {
		return !userLinks.find(link => link.trackId._id.toString() === id.toString())
	});
	if (trackIds.length) {
		const linksToInsert = trackIds.map(item => {
			return {
				trackId: item,
				userId: currentUser._id
			}
		});
		await Link.insertMany(linksToInsert, { ordered: false });
	}
}

async function insertTracks(likedTracks) {
	let insertedTracksIds;
	try {
		const existingTracks = await Track.find();
		const start = Date.now();

		likedTracks.forEach(item => {
			const existingTrack = existingTracks.some(track => track.isrc === item.isrc);
			if (existingTrack) {
				item._id = existingTrack._id
			}
		})
		console.log('clearning took ', (Date.now() - start) /1000 );
		const alreadyInsertedTracks = likedTracks.filter(track => track._id);
		const newTracksToInsert = likedTracks.filter(track => !track._id);

		const insertedTracks = await Track.insertMany(newTracksToInsert, { ordered: false });
		insertedTracksIds = [
			...insertedTracks.map(track => track._id),
			...alreadyInsertedTracks.map(track => track._id)
		]
	} catch (error) {
		console.error('ERROR CODE -> ', error.code)
		if (error.code === 11000) {
			console.error('--------DUPLICATED ERROR ', JSON.stringify(error, null, 4));
			insertedTracksIds = [];
		} else {
			console.error('ERROR -> ', error)
			throw new Error(error);
		}
	}
	return insertedTracksIds;
}

function transformSpotifySongsInTracks(spotifySongs) {
	return spotifySongs.map(item => {
		return {
			isrc: item.external_ids.isrc,
			title: item.name,
			artist: item.artists.map(artist => artist.name),
			album: item.album.name,
			album_id: item.album.id,
			duration: convertMsToString(item.duration_ms),
			year: item.album.release_date.split('-')[0],
			img: item.album.images[0]?.url,
			importId: {
				spotifyId: item.id,
			}
		}
	});
}

async function getUserSpotifyId(authToken) {
	console.log('FETCH ME INFOS');
	let url = 'https://api.spotify.com/v1/me';
	try {
		const meData = await fetchEndpoint(authToken, url);
		return meData.id;
	} catch (err) {
		console.error(err);
	}
}

async function fetchSongsFromSpotify(url, authToken) {
	if (authToken && url) {
		let likedSpotifyTracks = [];
		do {
			const fetchedSongs = await fetchEndpoint(authToken, url);
			url = fetchedSongs.next;
			const tracks = fetchedSongs?.items.map(item => item.track);
			likedSpotifyTracks = [...likedSpotifyTracks, ...tracks];
		} while (url);

		return transformSpotifySongsInTracks(likedSpotifyTracks);
	}
}

function isOwned(spotifyUserId, item) {
	return spotifyUserId === item.owner.id
}

async function getAllPlaylistUrls(spotifyUserId, userFormData, authToken) {
	try {
		let allPlaylistsUrl = [];
		let url = 'https://api.spotify.com/v1/me/playlists';

		do {
			const fetchedPlaylists = await fetchEndpoint(authToken, url);
			url = fetchedPlaylists.next;
			let playlists;

			if (userFormData.myPlaylists && userFormData.spotifyPlaylists) {
				playlists = fetchedPlaylists?.items
					.map(item => item.tracks.href);
			} else if (userFormData.myPlaylists) {
				playlists = fetchedPlaylists?.items
					.filter(item => isOwned(spotifyUserId, item))
					.map(item => item.tracks.href);
			} else {
				playlists = fetchedPlaylists?.items
					.filter(item => !isOwned(spotifyUserId, item))
					.map(item => item.tracks.href);
			}
			allPlaylistsUrl = [...allPlaylistsUrl, ...playlists];
		} while (url);
		return allPlaylistsUrl;
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function importPlaylistSongs(spotifyUserId, userFormData, authToken) {
	try {
		const allPlaylistsUrl = await getAllPlaylistUrls(spotifyUserId, userFormData, authToken);
		let playlistsTracks = [];
		for (let i = 0; i < allPlaylistsUrl.length; i++) {
			const playlistTracks = await fetchSongsFromSpotify(allPlaylistsUrl[i], authToken);
			playlistsTracks = [...playlistsTracks, ...playlistTracks];
		}
		return transformSpotifySongsInTracks(likedSpotifyTracks);
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function importFromSpotify(currentUser, userFormData, authToken) {
	console.log(userFormData);
	try {
		let tracksObjectToAdd = [];
		if (userFormData.mySongs) {
			let url = 'https://api.spotify.com/v1/me/tracks';
			tracksObjectToAdd = await fetchSongsFromSpotify(url, authToken);
		}
		if (userFormData.myPlaylists || userFormData.spotifyPlaylists) {
			const spotifyUserId = await getUserSpotifyId(authToken);
			console.log('USER ID ---------', spotifyUserId);
			await importPlaylistSongs(spotifyUserId, userFormData, authToken);
			const playlistsTracks = await importPlaylistSongs(currentUser, userFormData, authToken);
			tracksObjectToAdd = [...tracksObjectToAdd, ...playlistsTracks];
		}

		console.log('Adding to db: ', tracksObjectToAdd.length);

		const likedTracksIdAfterInsert = await insertTracks(tracksObjectToAdd);
		if (likedTracksIdAfterInsert?.length) {
			await insertLinks(currentUser, likedTracksIdAfterInsert);
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
}

module.exports = {
	redirectSpotifyLogin,
	importFromSpotify,
	getSpotifyToken
}
//mySongs, myPlaylists, spotifyPlaylisst
