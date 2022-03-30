const { getSpotifyToken, importFromSpotify, redirectSpotifyLogin } = require('../api/spotify-calls');
const { createPlaylist } = require('../api/spotify-create-playlist');
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
    const tracklist = await req.user?.getLinks();
    res.render("settings/library", { tracklist });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// !! TODO change to post !
router.get("/library/delete", isLoggedIn, async (req, res, next) => {
  try {
    await Link.deleteMany({ userId: req.user._id });
    res.redirect('/settings/library');
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/library/create", isLoggedIn, (req, res, next) => {
  let { mySongs, myPlaylists, spotifyPlaylists } = req.body;
  mySongs = mySongs === 'on';
  myPlaylists = myPlaylists === 'on';
  spotifyPlaylists = spotifyPlaylists === 'on';

  if (!mySongs && !myPlaylists && !spotifyPlaylists) {
    res.redirect('/settings/import')
  } else {
    req.session.userFormData = { mySongs, myPlaylists, spotifyPlaylists };
    next();
  }
}, redirectSpotifyLogin);

router.get("/library/callback", isLoggedIn, async (req, res, next) => {

  const currentUser = req.user;
  console.log('CURRENT USERS', currentUser);
  const userCode = req.query.code;
  const receivedstate = req.query.state;
  const storedState = req.session.state;
  const createPlaylistGroupId = req.session?.createPlaylistGroupId;

  try {
    if (createPlaylistGroupId) {
      const authToken = await getSpotifyToken(userCode);
      console.log('CREATE PLAYLIST CALLBACK', createPlaylistGroupId);
      await createPlaylist(currentUser, authToken);
      res.send('<h1>Create Playlist</h1>');
    } else {
      // check state in cookie, if ok clear it, if not redirect
      if (storedState !== receivedstate) {
        console.error('Not the right state');
        return res.status(400).send('wrong state');
      }
      delete req.session.state;

      const authToken = await getSpotifyToken(userCode);
      await importFromSpotify(currentUser, req.session.userFormData, authToken)
      res.redirect('/settings/library')
    }
  } catch (error) {
    next(error);
  }

});

router.get("/playlist/create", isLoggedIn, async (req, res, next) => {
  req.session.createPlaylistGroupId = '42';
  next();
}, redirectSpotifyLogin);

module.exports = router;
