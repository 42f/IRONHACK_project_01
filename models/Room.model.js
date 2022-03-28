const { Schema, model } = require("mongoose");

const roomSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
});

const Room = model("Room", roomSchema);

module.exports = Room;
