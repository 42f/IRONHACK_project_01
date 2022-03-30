const User = require('../models/User.model')

module.exports = async (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  try {
    const currentUser = req.session.user;
    const user = await User.findById(currentUser._id);
    req.user = user;
  } catch (err) {
    res.redirect('/auth/logout');
  }
  next();
};
