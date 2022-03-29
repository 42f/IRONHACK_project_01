const { Schema, model } = require("mongoose");

const trackSchema = new Schema({
  isrc: {type:String, unique:true, required:true},
  title: {type:String, required:true},
  artist: {type:String, required:true},
  length: {type:String},
  genre: [String],
  importId:{
    spotifyId: String,
    appleId: String
  }
});

const Track = model("Track", trackSchema);

module.exports = Track;
