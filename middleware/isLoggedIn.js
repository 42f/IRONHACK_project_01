module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  req.userId = req.session.userId;
  next();
};
