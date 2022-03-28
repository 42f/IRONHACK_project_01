const isLoggedIn = require("../middleware/isLoggedIn");
const User = require("../models/User.model");

const router = require("express").Router();

/* GET home page */
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.render("index", { userName: user.fullName });
  } catch (error) {
    res.render("index", { userName: 'Ironhacker!'});
  }
});

module.exports = router;
