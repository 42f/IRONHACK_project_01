const {
	postToEndpoint,
	getUserSpotifyId,
} = require('./spotify-api-calls');
const getFullDate = require('../utils/getFullDate');

async function exportOwnTracks(currentUser, authToken) {
	try {
		const userLib = (await currentUser.getLibrary()).map(track => track?.importId?.spotifyUri);
		console.log('userLib', userLib);
		const userId = await getUserSpotifyId(authToken);

		const { data } = await postToEndpoint(
			authToken,
			`https://api.spotify.com/v1/users/${userId}/playlists`,
			{
				name: `MyTracks_${getFullDate()}`,
				public: false,
			}
		);
		const playlistId = data?.id;
		if (playlistId) {
			console.log('playlistId------------- ', playlistId);
			do {
				const uploadTracks = userLib.splice(0, 99);
				await postToEndpoint(
					authToken,
					`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
					{
						uris: uploadTracks,
					},
				);
			} while (userLib.length);
		} else {
			throw new Error('no playlist id');
		}
	} catch (error) {
		console.error('error', error);
	}
}

async function createPlaylist(currentUser, originGroup, authToken) {
	console.log('CREATE PLAYLIST function', originGroup);
	try {
		if (originGroup === 'test') {
			await exportOwnTracks(currentUser, authToken);
		}
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	createPlaylist,

}
