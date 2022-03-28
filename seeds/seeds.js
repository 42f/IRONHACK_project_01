const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/User.model");
const Track = require("../models/Track.model");
const Link = require("../models/Link.model");

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
function generateFakeUsers() {
  const users = starterUsers;
  for (let i = 0; i < 50; i++) {
    const userNameValue = faker.internet.userName();
    console.log(userNameValue);
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
function generateFakeTracks() {
  const tracks = staterTracks;
  for (let i = 0; i < 30; i++) {
    let track = {
      isrc: faker.datatype.number(),
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
async function fakeLinks(usersDB, tracksDB) {
  const links = [];
  for (let i = 0; i < 100; i++) {
    let aLink = {
      trackId: tracksDB[Math.floor(Math.random() * tracksDB.length)]._id,
      userId: usersDB[Math.floor(Math.random() * usersDB.length)]._id,
    };
    links.push(aLink);
  }
  await Link.create(links);
}

// generate one group
/*

  generate (userdb) {

    declar an object for group { ower, participant = []}
    group.owner = userdb.splice(randomIndex, 1);

    randomLen between 2 and 5
      for (random len) {
        group.participant.push( one random user from userDB (with splice) );
      }

      return group;
  }
*/
function generateOneGroup(usersDB) {
  const usersArr = [...usersDB];
  let group = {
    name: faker.lorem.words(),
    owner,
    participants,
  };
}

/* generateAllGroups() {

    groups = [];

    for(10) {
      groups.push(generateOneGroup([...userDb]));
    }

    return groups;

  }




*/

// Generate groups

// The script that will be run to actually seed the database (feel free to refer to the previous lesson)
async function seedDB() {
  try {
    await User.deleteMany();
    await Track.deleteMany();
    await Link.deleteMany();
    // Populate track array with random tracks
    const tracks = generateFakeTracks();
    // Populate users array with random users
    const users = generateFakeUsers();

    const usersDB = await User.create(users);
    const tracksDB = await Track.create(tracks);
    // Populate links array and save it to db
    await fakeLinks(usersDB, tracksDB);

    //await generateGroup(usersDB);
  } catch (err) {
    console.log(`An error occurred while creating users from the DB: ${err}`);
  }
}
