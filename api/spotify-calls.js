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


function fabricateRedirectUrl(state) {
	const scopes = 'user-read-private user-library-read playlist-modify-private playlist-read-collaborative playlist-read-private playlist-modify-public user-top-read';
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

async function getExistingTracks(candidateTracks) {
	try {
		const start = Date.now()
		const existingTracks = await Track.find();
		candidateTracks.forEach(item => {
			const existingTrack = existingTracks.find(track => track.isrc === item.isrc);
			if (existingTrack) {
				item._id = existingTrack._id
			}
		})
		const alreadyInsertedTracks = candidateTracks.filter(track => track._id);
		const newTracksToInsert = candidateTracks.filter(track => !track._id);
		return { alreadyInsertedTracks, newTracksToInsert };
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function insertTracks(candidateTracks) {
	let tracksInDbIds = [];
	try {
		const { alreadyInsertedTracks, newTracksToInsert } = await getExistingTracks(candidateTracks);

		const insertedTracks = await Track.insertMany(newTracksToInsert, { ordered: false });

		tracksInDbIds = [
			...insertedTracks.map(track => track._id),
			...alreadyInsertedTracks.map(track => track._id)
		]

		return tracksInDbIds;
	} catch (error) {
		console.error('ERROR CODE -> ', error.code)
		if (error.code === 11000) {
			console.error('--------DUPLICATED ERROR ', JSON.stringify(error, null, 4));
			tracksInDbIds = [];
		} else {
			console.error('ERROR -> ', error)
			throw new Error(error);
		}
	}
}

function transformSpotifySongsInTracks(spotifySongs) {
	return spotifySongs.map(item => {
		return {
			isrc: item?.isrc || item?.external_ids?.isrc,
			title: item?.title || item?.name,
			artist: item?.artists?.map(artist => artist?.name) || item?.artist,
			album: item?.album?.name || item?.album,
			album_id: item?.album_id || item?.album?.id || '',
			duration: item?.duration_ms ? convertMsToString(item?.duration_ms) : item?.duration,
			year: item?.year || item?.album?.release_date?.split('-')[0],
			img: item?.img || item?.album?.images[0]?.url,
			importId: {
				spotifyId: item?.importId?.spotifyId || item?.id,
			}
		}
	});
}

async function getUserSpotifyId(authToken) {
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
		try {
			url += '?limit=50';
			let likedSpotifyTracks = [];
			do {
				const fetchedSongs = await fetchEndpoint(authToken, url);
				url = fetchedSongs.next;
				const tracks = fetchedSongs?.items.map(item => item.track);
				likedSpotifyTracks.push(...tracks);
			} while (url);
			return transformSpotifySongsInTracks(likedSpotifyTracks);
		} catch (err) {
			console.error(err);
			return [];
		}
	} else {
		console.error('Missing arguments');
	}
}

function isOwned(spotifyUserId, item) {
	return spotifyUserId === item.owner.id
}

async function getAllPlaylistUrls(spotifyUserId, userFormData, authToken) {
	try {
		let allPlaylistsUrl = [];
		let url = 'https://api.spotify.com/v1/me/playlists?limit=50';

		do {
			const fetchedPlaylists = await fetchEndpoint(authToken, url);
			url = fetchedPlaylists.next;

			let playlists;
			if (userFormData.myPlaylists && userFormData.spotifyPlaylists) {
				playlists = fetchedPlaylists?.items
					.filter(item => item.tracks.total > 0)
					.map(item => item.tracks.href);
			} else if (userFormData.myPlaylists) {
				playlists = fetchedPlaylists?.items
					.filter(item => isOwned(spotifyUserId, item) && item.tracks.total > 0)
					.map(item => item.tracks.href);
			} else {
				playlists = fetchedPlaylists?.items
					.filter(item => !isOwned(spotifyUserId, item) && item.tracks.total > 0)
					.map(item => item.tracks.href);
			}
			allPlaylistsUrl.push(...playlists);
		} while (url);
		return allPlaylistsUrl;
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function importPlaylistSongs(spotifyUserId, userFormData, authToken) {
	try {
		let start = Date.now();
		const allPlaylistsUrl = await getAllPlaylistUrls(spotifyUserId, userFormData, authToken);
		let allPlaylistsTracks = [];
		for (let i = 0; i < allPlaylistsUrl.length; i++) {
			const currentPlaylistTracks = await fetchSongsFromSpotify(allPlaylistsUrl[i], authToken);
			if (currentPlaylistTracks.length) {
				allPlaylistsTracks.push(...currentPlaylistTracks);
			}
		}
		console.log('time to fetch data from spotify API: ', Date.now() - start, 'ms');
		return allPlaylistsTracks;
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function importFromSpotify(currentUser, userFormData, authToken) {
	try {
		let tracksObjectToAdd = [];
		if (userFormData.mySongs) {
			let url = 'https://api.spotify.com/v1/me/tracks';
			tracksObjectToAdd = await fetchSongsFromSpotify(url, authToken);
		}
		if (userFormData.myPlaylists || userFormData.spotifyPlaylists) {
			const spotifyUserId = await getUserSpotifyId(authToken);
			const playlistsTracks = await importPlaylistSongs(spotifyUserId, userFormData, authToken);
			tracksObjectToAdd.push(...playlistsTracks);
		}


		const tracksAfterInsert = await insertTracks(tracksObjectToAdd);
		if (tracksAfterInsert.length) {
			await insertLinks(currentUser, tracksAfterInsert);
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
