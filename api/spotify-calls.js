
function redirectSpotifyLogin(req, res, next ) {
  const { mySongs, myPlaylists, spotifyPlaylist } = req.body;
	console.log('IMPORT SONGS API ->');
	console.log("mySongs", mySongs);
	console.log("myPlaylists", myPlaylists);
	console.log("spotifyPlaylist", spotifyPlaylist);
	res.send('call redirect login here');
}

module.exports = {
	redirectSpotifyLogin
}
