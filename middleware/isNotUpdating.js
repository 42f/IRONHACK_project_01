module.exports = async (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (req.user.libraryUpdateInProgress) {
    res.render('settings/waitMessage');
  } else {
    next();
  }
};
