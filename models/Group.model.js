const { Schema, model } = require("mongoose");

const groupSchema = new Schema({

    name: String,
    owner: { type: Schema.Types.ObjectId, ref: "User"},
    participants: [{ type: Schema.Types.ObjectId, ref: "User"}]

});

const Group = model("Group", groupSchema);

module.exports = Group;
