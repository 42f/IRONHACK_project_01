const {
	postToEndpoint,
	getUserSpotifyId,
} = require('./spotify-api-calls');

// const {
// 	CLIENT_ID,
// 	SPOTIFY_TOKEN_URL,
// 	CLIENT_SECRET,
// 	REDIRECT_URL,
// 	SPOTIFY_AUTH_URL,
// } = require('../utils/consts')
// const { convertMsToString } = require('../utils/convertMsToString')
// const generateRandomString = require('../utils/random-generator')
// const axios = require('axios')
// const qs = require('qs');
// const Track = require('../models/Track.model');
// const Link = require('../models/Link.model');
// const User = require('../models/User.model');

async function createPlaylist(currentUser, originGroup, authToken) {
	console.log('CREATE PLAYLIST function', originGroup);
	try {
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	createPlaylist,

}
