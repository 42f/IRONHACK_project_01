const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const Link = require('./Link.model');
const Track = require('./Track.model');

function avatarGen(username) {
  return `https://avatars.dicebear.com/api/adventurer/${username}.svg`;
}

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    userName: { type: String, unique: true, required: true },
    avatarUrl: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

/*
userSchema.methods.getLibrary; ->
  Link.find( userId = this._id).populate(tracks)
  retourne traks[]
*/
userSchema.methods.getLinks = async function () {
  try {
    return await Link
      .find({ userId: this._id }, null, { sort: {'updatedAt': -1 }})
      .populate("trackId");
  } catch (err) {
    console.log(err);
    return [];
  }
};

userSchema.methods.getLibrary = function () {
  return this.getLinks()
    .then((links) => links.map((link) => link.trackId))
    .catch((err) => {
      console.log(err);
      return [];
    });
};

userSchema.methods.getCompatibility = async function(userB){

  const myLibrary = await this.getLibrary()
  // console.log('MY LIB', myLibrary)
  
  const userBLibrary = await userB.getLibrary()
  // console.log('userBLibrary LIB', userBLibrary)
  const match = {
    numOfMatches:0,
    numOfuserBTracks:userBLibrary.length
  }
  
  // console.log('USER B LIBRARY: ', userBLibrary);
  // console.log('___________--------______');
  
  myLibrary.forEach(myTrack => {
    if(userBLibrary.some(track => {
      return track._id.toString() === myTrack._id.toString();
    })){
      match.numOfMatches++;
    }
  });

  // console.log('match object ', match);

  return match;
}


userSchema.methods.comparePassword = async function (candidatePassword) {
  const match = await bcrypt.compare(candidatePassword, this.password);
  if (match) {
    return true;
  }
  throw new Error('Invalid Password');
};

const User = model('User', userSchema);

module.exports = User;
