const {
	CLIENT_ID,
	SPOTIFY_TOKEN_URL,
	CLIENT_SECRET,
	REDIRECT_URL,
	SPOTIFY_AUTH_URL,
} = require('../utils/consts')
const generateRandomString = require('../utils/random-generator')
const axios = require('axios')
const qs = require('qs');


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
	const { mySongs, myPlaylists, spotifyPlaylist } = req.body;
	console.log('IMPORT SONGS API ->');
	console.log("mySongs", mySongs);
	console.log("myPlaylists", myPlaylists);
	console.log("spotifyPlaylist", spotifyPlaylist);

	const state = generateRandomString(32);
	console.log('STATE', state);
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

async function fetchEndpoint(authToken, url, queryParams) {
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

async function doImportSongs(currentUser, playlistData, authToken) {

	try {
		const { id: userId } = await fetchEndpoint(authToken, 'https://api.spotify.com/v1/me');
		console.log('ID OF USER', userId);
		let likedTracks = [];
		let playlists = [];
		let keepFetching = true;

		if (playlistData.mySongs === 'on') {
			do {
				console.log('------------FETCHING------------------');
				const fetchedSongs = await fetchEndpoint(authToken, `https://api.spotify.com/v1/me/tracks`);
				console.log('LIKED ----------', fetchedSongs.items.map(item => item.track.name));
				likedTracks = [...likedTracks, fetchedSongs.items];
				keepFetching =  fetchedSongs.items.length ? true : false;
			}	while (keepFetching);
		}
		if (playlistData.myPlaylists === 'on' || playlistData.spotifyPlaylist === 'on') {
			playlists = await fetchEndpoint(authToken, `https://api.spotify.com/v1/users/${userId}/playlists`);
			console.log('PLAYLIST ----------', likedTracks.items.map(item => item));
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
}

module.exports = {
	redirectSpotifyLogin,
	doImportSongs,
	getSpotifyToken
}
