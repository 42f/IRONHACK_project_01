const isLoggedIn = require("../middleware/isLoggedIn");
const Track = require('../models/Track.model');
const User = require('../models/User.model');
const Link = require('../models/Link.model');
const Group = require('../models/Group.model');

const router = require("express").Router();

/* GET home page */
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const data = {
      username: req.user.username,
      quantities: Object.entries({
        'Users': await User.countDocuments(),
        'Cumulated songs likes': await Link.countDocuments(),
        'Single songs': await Track.countDocuments(),
        'Groups': await Group.countDocuments(),
      })
    }

    res.render("index", data);
  } catch (error) {
    res.render("index", { username: req.user.username });
  }
});

module.exports = router;
