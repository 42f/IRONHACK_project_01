const { Schema, model } = require("mongoose");

const linkSchema = new Schema({

  trackId: { type: Schema.Types.ObjectId, ref: "Track", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
});

const Link = model("link", linkSchema);

module.exports = Link;
