const { Schema, model } = require("mongoose");

const linkSchema = new Schema({
  trackId: { type: Schema.Types.ObjectId, ref: "Track", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true
  }
);

const Link = model("Link", linkSchema);

module.exports = Link;
