const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../models/User.model');
const Track = require('../models/Track.model');
const Link = require('../models/Link.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Projet-2_Spotify';

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(
      `Connected to Mongo Gary! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

// Users to insert in  DB
const users = [
    {
      email: "A Wrinkle in Time",
      userName: "Ava DuVernay",
      password:"password"
  
    },
    {
      email: "The Strangers: Prey at Night",
      userName: "Johannes Roberts",
      password:"password"
    },
    {
      email: "The Hurricane Heist",
      userName: "Rob Cohen",
      avatarUrl:
        "https://images-na.ssl-images-amazon.com/images/M/MV5BMzg3Y2MyNjgtMzk4ZS00OTU3LWEwZmMtN2Y0NTdlZjU0NGFiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX182_CR0,0,182,268_AL_.jpg",
      password:"password"
       
    },
    {
      email: "Gringo",
      userName: "Nash Edgerton",
      password:"password"
       
    },
    {
      email: "Thoroughbreds",
      userName: "Cory Finley",
      avatarUrl:
        "https://images-na.ssl-images-amazon.com/images/M/MV5BNDcyNDA4NDAzN15BMl5BanBnXkFtZTgwODQxMDQ5NDM@._V1_UX182_CR0,0,182,268_AL_.jpg",
      password:"password"
   
    },
    {
      email: "The Leisure Seeker",
      userName: "Paolo Virzì",
      avatarUrl:
        "https://images-na.ssl-images-amazon.com/images/M/MV5BMTg1NTg2MzcyNF5BMl5BanBnXkFtZTgwNjMwMDIzNDM@._V1_UX182_CR0,0,182,268_AL_.jpg",
      password:"password"
    
    },
    {
      email: "Black Panther",
      userName: "Ryan Coogler",
      avatarUrl:
        "https://images-na.ssl-images-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMTc4NTMwNDI@._V1_UX182_CR0,0,182,268_AL_.jpg",
      password:"password"
       
    },
    {
      email: "Red Sparrow",
      userName: "Francis Lawrence",
      avatarUrl:
        "https://images-na.ssl-images-amazon.com/images/M/MV5BMTA3MDkxOTc4NDdeQTJeQWpwZ15BbWU4MDAxNzgyNTQz._V1_UX182_CR0,0,182,268_AL_.jpg",
      password:"password"

    },
  ];

// Create fake users
function fakeUsers(){
    for (let i = 0; i<50; i++){
        let user = {
            email:faker.internet.internet(),
            userName: faker.name.firstName(),
            avatarUrl: `https://avatars.dicebear.com/api/adventurer/${userName}.svg`,
           password: "password"
            
        }
        users.push(user)
    }
}
// Call fakeUsers
fakeUsers()

// Tracks to insert in Db
const tracks = [
    {
        isrc:"FR9W11935958",
        title: "Maravilla (Instrumental)",
        artist: "SUNINEYE",
        length: "3:00",
        genre: ["instrumental", "Afro-carribean","reggaeton"],
        importId:{
            spotifyId: "test",
            appleId: "appleId"
        }

    },
    {
        isrc:"FR9W12042631",
        title: "Malishka (Carribean Style) [Instrumental]",
        artist: "SUNINEYE",
        length: "3:00",
        genre: ["instrumental", "Afro-carribean","reggaeton"],
        importId:{
            spotifyId: "test",
            appleId: "appleId"
        }
    },
    {
        isrc:"FR9W11935960",
        title: "Potion (Instrumental",
        artist: "SUNINEYE",
        length: "3:00",
        genre: ["instrumental", "Afro-house","Clubbing"],
        importId:{
            spotifyId: "test",
            appleId: "appleId"
        }
    },
    {
        isrc:"FR9W11324494",
        title: "Babycat (instrumental)",
        artist: "SUNINEYE",
        length: "3:00",
        genre: ["instrumental", "chill", "yoga", "child"],
        importId:{
            spotifyId: "test",
            appleId: "appleId"
        }
    }
]
// Create fake track
function fakeTracks(){

    for (let i = 0; i<30; i++){
        let track = {
            isrc:faker.datatype.number(),
            title: faker.lorem.words(),
            artist: faker.name.firstName(),
            length: "3:00",
            genre: [],
            importId:{
                spotifyId: "test",
                appleId: "appleId"
            }
            
        }
        for (let j=0; j<3; j++){
            track.genre.push(faker.music.genre())
        }
        
        tracks.push(track)
    }
}
// Call fakeTracks
fakeTracks()

// The script that will be run to actually seed the database (feel free to refer to the previous lesson)
async function seedDB(){

    try{
        await User.deleteMany();
        await Track.deleteMany();
        await Link.deleteMany();

        const usersDB = await User.create(users);
        await Track.create(tracks);
        

        // Genereta fake links
        const links = [];
        function fakeLinks(users, tracks){
        for(let i = 0; i < 100; i++){
            let aLink = {
                trackId
            }
        
        }    
}

        await Link.create(links)

        mongoose.connection.close()
    }
    catch(err){
        
        console.log(`An error occurred while creating users from the DB: ${err}`);
    } 
}

seedDB()

  