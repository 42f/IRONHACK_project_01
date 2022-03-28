const {redirectSpotifyLogin} = require('../api/spotify-calls');
const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.render("settings/settings");
});

router.get("/import", (req, res, next) => {
  res.render("settings/import");
});

router.get("/library", (req, res, next) => {
  res.render("settings/library");
});

router.post("/library/create", (req, res, next) => {
  const { mySongs, myPlaylists, spotifyPlaylist } = req.body;
  if (mySongs != 'on' && myPlaylists != 'on' && spotifyPlaylist != 'on') {
    res.redirect('/settings/import')
  } else {
    next();
  }
}, redirectSpotifyLogin);

router.get("/library/callback", (req, res, next) => {
  console.log('CALLBACK called by spotify ->', req.body);
});

module.exports = router;
