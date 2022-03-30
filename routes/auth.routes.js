const router = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isLoggedOut, (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your email and username.",
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  //   ! This use case is using a regular expression to control for special characters and min length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */

  // Search the database for a user with the email submitted in the form
  User.findOne().or([{ email }, { username }]).then((found) => {
    // If the user is found, send the message email is taken
    if (found) {
      const similarData = email === found.email ? 'Email' : 'Username';
      return res
        .status(400)
        .render("auth/signup", { errorMessage: `${similarData} already taken.` });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          email,
          password: hashedPassword,
        });
      })
      .then((user) => {
        // Bind the user to the session object
        req.session.user = user;
        req.user = user;
        res.redirect("/");
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render("auth/signup", {
            errorMessage:
              "Email and Username needs to be unique.",
          });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message });
      });
  });
});

router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});


router.post("/login", isLoggedOut, async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return generateFailedLoginForm(req, res, StatusCodes.BAD_REQUEST,
      'missing email');
  }
  if (!password) {
    return generateFailedLoginForm(req, res, StatusCodes.BAD_REQUEST,
      'missing password');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return generateFailedLoginForm(req, res, StatusCodes.BAD_REQUEST,
        'wrong credential');
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (isCorrectPassword) {
      req.session.user = user;
      return res.redirect('/');
    } else {
      return generateFailedLoginForm(req, res, StatusCodes.BAD_REQUEST,
        'wrong credential');
    }
  } catch (error) {
    console.log(error);
    return generateFailedLoginForm(req, res, StatusCodes.BAD_REQUEST,
      'Could not login at the moment, please try again.');
  }
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("/auth/logout", { errorMessage: err.message });
    }
    res.redirect("/");
  });
});

module.exports = router;
