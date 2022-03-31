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
hbs.registerHelper('isUserTheOwner', (userId, roomOwner) => userId === roomOwner._id.toString());

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "rooms-app";
const User = require("./models/User.model");
app.locals.appTitle = `Spotimatcher`;

// Middlewares
const isLoggedIn = require('./middleware/isLoggedIn');

// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const settingsRoutes = require("./routes/settings.routes");
app.use("/settings", settingsRoutes);

const groups = require('./routes/groups.routes')
app.use('/groups', isLoggedIn, groups)


// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

