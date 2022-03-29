const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/spotify-app";

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const SPOTIFY_AUTH_URL = process.env.SPOTIFY_AUTH_URL;
const SPOTIFY_TOKEN_URL = process.env.SPOTIFY_TOKEN_URL;

module.exports = {
	MONGO_URI,
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URL,
	SPOTIFY_AUTH_URL,
	SPOTIFY_TOKEN_URL,
};
