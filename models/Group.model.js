const { Schema, model } = require("mongoose");

const groupSchema = new Schema({

    name: String,
    owner: { type: Schema.Types.ObjectId, ref: "User"},
    participants: [{ type: Schema.Types.ObjectId, ref: "User"}]

});

const group = model("group", groupSchema);

module.exports = group;
