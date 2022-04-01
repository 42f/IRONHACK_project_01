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
    users.push(user);
  }
  return users;
}

// Generate groups

function generateOneGroup(usersDB) {

  const randomIndex = Math.floor(Math.random() * usersDB.length);
  const group = {
    name: faker.lorem.words(),
    owner: usersDB.splice(randomIndex, 1)[0],
    participants: [],
  };

  let randomLen = 2 + Math.floor(Math.random() * usersDB.length)
  randomLen = randomLen > 5 ? 5 : randomLen;
  for (let i = 0; i < randomLen; i++) {
    const randomIndex = Math.floor(Math.random() * usersDB.length);
    const newParticipant = usersDB.splice(randomIndex, 1)[0];
    group.participants.push(newParticipant);
  }

  return group;
}

function generateAllGroups(quantity, userDb) {
  const groups = [];
  for (let i = 0; i < quantity; i++) {
    const newGroup = generateOneGroup([...userDb]);
    groups.push(newGroup);
  }
  return groups;
}



function generateFakeLinksForOneUser(quantity, fakeUser, existingTracksIds) {
  const Links = [];
  quantity = quantity + Math.floor(Math.random() * 10);
  console.log('fakeUser', fakeUser);
  console.log('tracks', existingTracksIds.length);
  for (let i = 0; i < quantity; i++) {
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
    console.log(links);
    const linksDb = await Link.create(links);
    console.log('links db', linksDb.map(l => `${l.userId} -- ${l.trackId}`));
  }
}

async function deleteAllFakeLinksAndUsers() {
  const fakeUsersIds = (await User.find({ username: /\*$/ })).map(user => user._id);
  const fakeLinks = await Link.find({ userId: { $in: fakeUsersIds}});
  console.log('Fake links', fakeLinks);
  await Link.deleteMany({ userId: { $in: fakeUsersIds}});
  await User.deleteMany({ username: /\*$/ });
}

// The script that will be run to actually seed the database (feel free to refer to the previous lesson)
async function seedDB() {
  try {
    const existingTracksIds = (await Track.find()).map(t => t._id);
    console.log('tracks', existingTracksIds);
    await deleteAllFakeLinksAndUsers();
    const fakeUsers = generateFakeUsers(5);
    const fakeUsersDb = await User.create(fakeUsers);

    await generateFakeLinks(20, fakeUsersDb, existingTracksIds);

    // console.log('ALL', (await User.find()).map(i => i.username))
    // console.log('fake', (await User.find({ username: /\*$/ })).map(i => i.username))

  } catch (err) {
    console.log(`An error occurred while creating users from the DB: ${err}`);
  }
}
