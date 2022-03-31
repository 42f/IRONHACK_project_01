const {
	postToEndpoint,
	getUserSpotifyId,
} = require('./spotify-api-calls');
const getFullDate = require('../utils/getFullDate');

async function addTracksToPlaylist(playlistId, tracks, authToken) {
	do {
		const uploadTracks = tracks.splice(0, 99);
		await postToEndpoint(
			authToken,
			`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
			{
				uris: uploadTracks,
			},
		);
	} while (tracks.length);
}

async function createOnePlaylist(userSpotifyId, playlistName, authToken) {
	const { data } = await postToEndpoint(
		authToken,
		`https://api.spotify.com/v1/users/${userSpotifyId}/playlists`,
		{
			name: playlistName,
			public: false,
		}
	);
	return data.id;
}

async function exportOwnTracks(currentUser, authToken) {
	try {
		const userLib = (await currentUser.getLibrary()).map(track => track?.importId?.spotifyUri);
		const name = `MyTracks_${getFullDate()}`;

		const userSpotifyId = await getUserSpotifyId(authToken);
		const playlistId = await createOnePlaylist(userSpotifyId, name, authToken);

		if (playlistId) {
			await addTracksToPlaylist(playlistId, userLib, authToken);
		} else {
			throw new Error('failed to create a new playlist');
		}
	} catch (error) {
		console.error('error', error);
		throw new Error('failed to create a new playlist');
	}
}

async function exportGroup(originGroup, authToken) {
	try {
		const groupTracksObject = await originGroup.getCommonGroupTracks();
		const tracklist = Object.values(groupTracksObject).map(track => track?.importId?.spotifyUri);

		if (tracklist?.length) {
			const userSpotifyId = await getUserSpotifyId(authToken);
			const name = `${originGroup?.name || 'GroupPlaylist'} 🎉 ${getFullDate()}`;
			const playlistId = await createOnePlaylist(userSpotifyId, name, authToken);
			if (playlistId) {
				await addTracksToPlaylist(playlistId, tracklist, authToken);
			} else {
				throw new Error('failed to create a new playlist');
			}
		} else {
			throw new Error('No tracks to export');
		}
	} catch (error) {
		console.error('error', error);
		throw new Error('failed to create a new playlist');
	}
}

async function exportPlaylist(currentUser, originGroup, authToken) {
	try {
		if (originGroup === 'ownTracks') {
			return await exportOwnTracks(currentUser, authToken);
		} else {
			return await exportGroup(originGroup, authToken);
		}
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	exportPlaylist,

}
