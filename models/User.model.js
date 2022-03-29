const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");


function avatarGen(username){
  return `https://avatars.dicebear.com/api/adventurer/${username}.svg`
}

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {type: String, unique:true, required:true},
    userName: {type: String, unique:true, required:true},
    avatarUrl: String,
    password: String,
  },
  {
    timestamps: true
  }
);

/*
userSchema.methods.getLibrary; ->
  Link.find( userId = this._id).populate(tracks)
  retourne traks[]



userSchema.methods.getCommonTracks(userB)
  userB libraray = userB.getLibrary
  userA library = this.getLibrary

  // assembler userB Library and user A library, keep only the tracks
  which are present more than once



*/

userSchema.methods.comparePassword = async function(candidatePassword) {
    const match = await bcrypt.compare(candidatePassword, this.password);
    if (match) {
      return true;
    }
    throw new Error('Invalid Password')
};

const User = model("User", userSchema);

module.exports = User;
