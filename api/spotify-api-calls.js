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
		console.error(`Got ${status} code from Spotify API.`);
		throw new Error(data);
	}
	return data;
}

async function postToEndpoint(authToken, url, sendData) {
	const headers = {
		'content-type': 'application/json',
		'Authorization': 'Bearer ' + authToken
	}
	const { status, data } = await axios({
		method: 'POST',
		headers,
		url,
		data: sendData
	});
	if (status != 200) {
		console.error(`Got ${status} code from Spotify API.`);
		// throw new Error(data);
	}
	return {status, data};
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

module.exports = {
	postToEndpoint,
	redirectSpotifyLogin,
	getSpotifyToken,
	fetchEndpoint,
	getUserSpotifyId,
}
