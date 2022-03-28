const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/spotify-app";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URI;

module.exports = {
	MONGO_URI,
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URL,
};
