const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/User.model");
const Track = require("../models/Track.model");
const Link = require("../models/Link.model");
const Group = require("../models/Group.model");

const {MONGO_URI} = require('../utils/consts');

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

// Users to insert in  DB
const starterUsers = [
  {
    email: "valette.brian@gmail.com",
    userName: 'brian',
    avatarUrl: `https://avatars.dicebear.com/api/adventurer/brian.svg`,
    password: "$2b$10$wN27fSja8gOfp.OFfULH9./pUZ0sYjtd2RX10CHT230WbDLo0RfV2",
  },
  {
    email: "gary.j@live.fr",
    userName: 'gary',
    avatarUrl: `https://avatars.dicebear.com/api/adventurer/gary.svg`,
    password: "$2b$10$wN27fSja8gOfp.OFfULH9./pUZ0sYjtd2RX10CHT230WbDLo0RfV2",
  },
];

// Create fake users
function generateFakeUsers(quantity) {
  const users = starterUsers;
  for (let i = 0; i < quantity; i++) {
    const userNameValue = faker.internet.userName();
    let user = {
      email: faker.internet.email(),
      userName: userNameValue,
      avatarUrl: `https://avatars.dicebear.com/api/adventurer/${userNameValue}.svg`,
      password: "password",
    };
    users.push(user);
  }
  return users;
}

// Tracks to insert in Db
const staterTracks = [
  {
    isrc: "FR9W11935958",
    title: "Maravilla (Instrumental)",
    artist: "SUNINEYE",
    length: "3:00",
    genre: ["instrumental", "Afro-carribean", "reggaeton"],
    importId: {
      spotifyId: "test",
      appleId: "appleId",
    },
  },
  {
    isrc: "FR9W12042631",
    title: "Malishka (Carribean Style) [Instrumental]",
    artist: "SUNINEYE",
    length: "3:00",
    genre: ["instrumental", "Afro-carribean", "reggaeton"],
    importId: {
      spotifyId: "test",
      appleId: "appleId",
    },
  },
  {
    isrc: "FR9W11935960",
    title: "Potion (Instrumental",
    artist: "SUNINEYE",
    length: "3:00",
    genre: ["instrumental", "Afro-house", "Clubbing"],
    importId: {
      spotifyId: "test",
      appleId: "appleId",
    },
  },
  {
    isrc: "FR9W11324494",
    title: "Babycat (instrumental)",
    artist: "SUNINEYE",
    length: "3:00",
    genre: ["instrumental", "chill", "yoga", "child"],
    importId: {
      spotifyId: "test",
      appleId: "appleId",
    },
  },
];

// Create fake track
function generateFakeTracks(quantity) {
  const tracks = staterTracks;
  for (let i = 0; i < quantity; i++) {
    let track = {
      isrc: faker.datatype.number() + '_' + faker.lorem.word(),
      title: faker.lorem.words(),
      artist: faker.name.firstName(),
      length: "3:00",
      genre: [],
      importId: {
        spotifyId: "test",
        appleId: "appleId",
      },
    };
    for (let j = 0; j < 3; j++) {
      track.genre.push(faker.music.genre());
    }
    tracks.push(track);
  }
  return tracks;
}

// Genereta fake links
async function fakeLinks(quantity, usersDB, tracksDB) {
  const links = [];
  for (let i = 0; i < quantity; i++) {
    let aLink = {
      trackId: tracksDB[Math.floor(Math.random() * tracksDB.length)]._id,
      userId: usersDB[Math.floor(Math.random() * usersDB.length)]._id,
    };
    links.push(aLink);
  }
  await Link.create(links);
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
  for(let i = 0; i < randomLen; i++) {
    const randomIndex = Math.floor(Math.random() * usersDB.length);
    const newParticipant = usersDB.splice(randomIndex, 1)[0];
    group.participants.push(newParticipant);
  }

  return group;
}

function generateAllGroups(quantity, userDb) {
  const groups = [];
  for(let i = 0; i < quantity; i++) {
    const newGroup = generateOneGroup([...userDb]);
    groups.push(newGroup);
  }
  return groups;
}


// The script that will be run to actually seed the database (feel free to refer to the previous lesson)
async function seedDB() {
  try {
    await User.deleteMany();
    await Track.deleteMany();
    await Link.deleteMany();
    await Group.deleteMany();
    // Populate track array with random tracks
    const tracks = generateFakeTracks(2000);
    // Populate users array with random users
    const users = generateFakeUsers(20);

    const usersDB = await User.create(users);
    const tracksDB = await Track.create(tracks);
    // Populate links array and save it to db
    await fakeLinks(700, usersDB, tracksDB);
    const groups = generateAllGroups(10, usersDB);
    await Group.create(groups);

  } catch (err) {
    console.log(`An error occurred while creating users from the DB: ${err}`);
  }
}
