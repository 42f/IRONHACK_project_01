const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/User.model");
const Track = require("../models/Track.model");
const Link = require("../models/Link.model");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/Projet-2_Spotify";

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
const users = [];

// Create fake users
function generateFakeUsers() {
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
}

// Tracks to insert in Db
const tracks = [
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

// The script that will be run to actually seed the database (feel free to refer to the previous lesson)
async function seedDB() {
  try {
    await User.deleteMany();
    await Track.deleteMany();
    await Link.deleteMany();
    // Populate track array with random tracks
    generateFakeTracks();
    // Populate users array with random users
    generateFakeUsers();

    const usersDB = await User.create(users);
    const tracksDB = await Track.create(tracks);
    // Populate links array and save it to db
    await fakeLinks(usersDB, tracksDB);

  } catch (err) {
    console.log(`An error occurred while creating users from the DB: ${err}`);
  }
}
