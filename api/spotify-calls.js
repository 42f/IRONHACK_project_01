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


function fabricateRedirectUrl(state) {
	const scopes = 'user-read-private user-read-email user-library-read';
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

async function getSpotifyToken(userCode) {
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
		likedTracks.forEach(item => {
			const existingTrack = existingTracks.find(track => track.isrc === item.isrc);
			if (existingTrack) {
				item._id = existingTrack._id
			}
		})

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

async function getLikedSongsFromSpotifyApi(authToken) {
	let likedSpotifyTracks = [];
	let url = 'https://api.spotify.com/v1/me/tracks';
	do {
		const fetchedSongs = await fetchEndpoint(authToken, url);
		url = fetchedSongs.next;
		const tracks = fetchedSongs.items.map(item => item.track);
		likedSpotifyTracks = [...likedSpotifyTracks, ...tracks];
	} while (url);

	return transformSpotifySongsInTracks(likedSpotifyTracks);
}

// function extractSongsFromPlaylist(playlists, userFormData)

async function importPlaylistSongs(currentUser, userFormData, authToken) {
	let allPlaylists = [];
	// let url = 'https://api.spotify.com/v1/me/playlists';
	let url = 'https://api.spotify.com/v1/users/312oyc5t2usdzxrlokhjgz2vsq4m/playlists?offset=0&limit=20';
	// do {
		const fetchedPlaylists = await fetchEndpoint(authToken, url);
		url = fetchedPlaylists.next;
		console.log('OUTPUT ------------',fetchedPlaylists);
		// const playlists = fetchedPlaylists.items.map(item => item.track);
		// allPlaylists = [...allPlaylists, ...playlists];
	// } while (url);


	// return transformSpotifySongsInTracks(likedSpotifyTracks);
}

async function importFromSpotify(currentUser, userFormData, authToken) {
	try {
		let tracksObjectToAdd;
		if (userFormData.mySongs === 'on') {
			tracksObjectToAdd = await getLikedSongsFromSpotifyApi(authToken);
		}
		// if (userFormData.myPlaylists === 'on' || userFormData.spotifyPlaylist === 'on') {
			// await importPlaylistSongs(currentUser, userFormData, authToken);
			// const playlistsTracks = await importPlaylistSongs(currentUser, userFormData, authToken);
			// tracksObjectToAdd = [...tracksObjectToAdd, ...playlistsTracks];
		// }
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
//mySongs, myPlaylists, spotifyPlaylist
