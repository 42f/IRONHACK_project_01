const isLoggedIn = require("../middleware/isLoggedIn");

const router = require("express").Router();

/* GET home page */
router.get("/", isLoggedIn, async (req, res, next) => {
  res.render("index", { username: req.user.username });
});

module.exports = router;
