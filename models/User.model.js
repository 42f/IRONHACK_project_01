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
    username: { type: String, unique: true, required: true },
    avatarUrl: String,
    password: String,
    libraryUpdateInProgress: { type: Boolean, default: false },
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
    return (await Link
      .find({ userId: this._id }, null, { sort: { 'updatedAt': -1 } })
      .populate("trackId"))
    // .filter(link => link.trackId);
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

userSchema.methods.getCompatibility = async function (userB) {

  const ids = [this._id, userB._id];

  const commonLib = await Link.aggregate(
    [
      { $match: { userId: { $in: ids } } },
      { $group: { _id: '$trackId', count: { $sum: 1 } } },
      { $lookup: { from: 'tracks', localField: '_id', foreignField: '_id', as: 'trackId' } }
    ]
  );
  const commonTracks = commonLib.filter(track => track.count > 1);
  const match = {
    numOfMatches: commonTracks.length,
    numOfuserBTracks: await Link.find({ userId: userB._id }).countDocuments()
  }
  return match;
}

userSchema.methods.setUpdatingStatus = async function (status) {
  if (typeof status === 'boolean') {
    this.libraryUpdateInProgress = status;
    await this.save();
  }
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
