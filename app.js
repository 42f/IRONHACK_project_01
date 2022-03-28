// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const path = require('path');
const hbs = require("hbs");
hbs.registerPartials(path.join(__dirname, 'views/partials'));
hbs.registerHelper('isUserTheOwner', (userId, linkOwner) => userId === linkOwner._id.toString());
const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "links-app";
const User = require("./models/User.model");
app.locals.appTitle = `${capitalized(projectName)} created with IronLauncher`;


// PASSPORT SETTINGS
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, cb) => {
  return cb(null, user)
});

passport.deserializeUser((id, cb) => {
  User.findById(id)
    .then(user => cb(null, user))
    .catch(err => cb(err));
});

passport.use(new LocalStrategy(
  {
    usernameField: 'email'
  },
  function verify(email, password, done) {
    User.findOne({ email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      user.comparePassword(password)
        .then(validity => {
          if (validity) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch(err => {
          console.error(err)
          done(null, false, { message: err });
        });
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());



// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const linksRoutes = require("./routes/links.routes");
app.use("/links", linksRoutes);

const tracksRoutes = require("./routes/tracks.routes");
app.use("/tracks", tracksRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
