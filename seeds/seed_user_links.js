const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/User.model");
const Track = require("../models/Track.model");
const Link = require("../models/Link.model");
const Group = require("../models/Group.model");

const { MONGO_URI } = require('../utils/consts');

mongoose
  .connect(MONGO_URI)
  .then(async (x) => {
    console.log(
      `Connected to Mongo Gary! Database name: '${x.connections[0].name}'`
    );
    await seedDB();
    await mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

// Create fake users
function generateFakeUsers(quantity) {
  const users = [];
  for (let i = 0; i < quantity; i++) {
    const usernameValue = faker.internet.userName();
    let user = {
      email: faker.internet.email(),
      username: `${faker.name.firstName()}_${faker.name.lastName()}*`,
      avatarUrl: `https://avatars.dicebear.com/api/adventurer/${usernameValue}.svg`,
      password: "$2b$10$wN27fSja8gOfp.OFfULH9./pUZ0sYjtd2RX10CHT230WbDLo0RfV2",
    };
    console.log('NEW USER', user.username, user.email);
    users.push(user);
  }
  return users;
}

function generateFakeLinksForOneUser(quantity, fakeUser, existingTracksIds) {
  const Links = [];
  quantity = quantity + Math.floor(Math.random() * 50);
  for (let i = 0; existingTracksIds.length && i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * existingTracksIds.length);
    const link = {
      userId: fakeUser._id,
      trackId: existingTracksIds.splice(randomIndex, 1)[0]
    };
    Links.push(link);
  }
  return Links;
}

async function generateFakeLinks(quantity, fakeUsers, existingTracksIds) {
  for (let i = 0; i < fakeUsers.length; i++) {
    const links = generateFakeLinksForOneUser(quantity, fakeUsers[i], [...existingTracksIds]);
    await Link.create(links);
  }
}

async function deleteAllFakeLinksAndUsers() {
  const fakeUsersIds = (await User.find({ username: /\*$/ })).map(user => user._id);
  await Link.deleteMany({ userId: { $in: fakeUsersIds}});
  await User.deleteMany({ username: /\*$/ });
}

// The script that will be run to actually seed the database (feel free to refer to the previous lesson)
async function seedDB() {
  try {
    await Group.deleteMany();
    const existingTracksIds = (await Track.find()).map(t => t._id);
    await deleteAllFakeLinksAndUsers();
    const fakeUsers = generateFakeUsers(12);
    const fakeUsersDb = await User.create(fakeUsers);
    await generateFakeLinks(30, fakeUsersDb, existingTracksIds);
  } catch (err) {
    console.log(`An error occurred while creating users from the DB: ${err}`);
  }
}
//
