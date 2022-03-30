const { Schema, model } = require("mongoose");
const Link = require("./Link.model");
const Track = require("./Track.model");
const User = require("./User.model");

const groupSchema = new Schema({
  name: String,
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

groupSchema.methods.getCumulativePlaylist = async function () {
  let cumulativeTracks = [];
  const commonGroupTracks = {};

  // 1. Get the owner's tracks
  // Push them in the cumulativeTracks array
  await this.populate("owner participants");

  const ownerTracks = await this.owner.getLibrary();
  cumulativeTracks = [...ownerTracks];

  // 2. Get all participants track's
  // Push them in the cumulativeTracks array

  for (let participant of this.participants) {
    const participantTracks = await participant.getLibrary();
    cumulativeTracks = [...cumulativeTracks, ...participantTracks];
  }
  //  console.log('CUMULATIVE TRACKS :', cumulativeTracks);

  // 3. Création de l'objet commomGroupTracks

  cumulativeTracks.forEach((track) => {
    track.occurence = track.occurence ? ++track.occurence : 1;
    commonGroupTracks[track.isrc] = track;
  });

  cumulativeTracks.forEach((track) => {
    // console.log(track.isrc, track.occurence)
  });

  for (let track in commonGroupTracks) {
    // console.log("ici - ", track, commonGroupTracks[track].occurence);
  }

  return commonGroupTracks;
  // retourne un object avec les sons en communs
};

groupSchema.methods.extractStatistic = async function () {
  // Dans commonGroupTrack, additionner les tracks occurantes plus d'une fois et diviser par Longueur des values
  // Renvoi un number, ou un nombre en string

  const groupTracks = await this.getCumulativePlaylist();
  // console.log('APPEL OOOKKKK !', groupTracks['3850'].occurence)

  let nbOfduplicatedTracks = 0;

  for (let obj in groupTracks) {
    if (groupTracks[obj].occurence > 1) {
      nbOfduplicatedTracks++;
    }
  }
  //   console.log('DUPLICATE TRACK',nbOfduplicatedTracks)

  // Match format 00.00% before return
  const match = (
    (nbOfduplicatedTracks / Object.keys(groupTracks).length) *
    100
  ).toFixed(0);

//   console.log("MAAAAACTH", match);

  return match;
};

const Group = model("Group", groupSchema);

module.exports = Group;
