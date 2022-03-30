const { getSpotifyToken, importFromSpotify, redirectSpotifyLogin } = require('../api/spotify-calls');
const router = require("express").Router();
const isLoggedIn = require('../middleware/isLoggedIn')
const Track = require('../models/Track.model')
const Link = require('../models/Link.model')

router.get("/", isLoggedIn, (req, res, next) => {
  res.render("settings/settings");
});

router.get("/import", isLoggedIn, (req, res, next) => {
  res.render("settings/import");
});

router.get("/library", isLoggedIn, async (req, res, next) => {
  try {
    const tracklist = await req.user.getLinks();
    res.render("settings/library", { tracklist });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/library/create", isLoggedIn, (req, res, next) => {
  const { mySongs, myPlaylists, spotifyPlaylist } = req.body;
  if (mySongs != 'on' && myPlaylists != 'on' && spotifyPlaylist != 'on') {
    res.redirect('/settings/import')
  } else {
    req.session.userFormData = { mySongs, myPlaylists, spotifyPlaylist };
    next();
  }
}, redirectSpotifyLogin);

router.get("/library/callback", isLoggedIn, async (req, res, next) => {

  const userCode = req.query.code;
  const receivedstate = req.query.state;
  const storedState = req.session.state;

  // check state in cookie, if ok clear it, if not redirect
  if (storedState !== receivedstate) {
    console.error('Not the right state');
    return res.status(400).send('wrong state');
  }
  delete req.session.state;

  try {
    const authToken = await getSpotifyToken(userCode);
    await importFromSpotify(req.user, req.session.userFormData, authToken)
    res.redirect('/settings/library')
  } catch (error) {
    next(error);
  }

});

module.exports = router;
