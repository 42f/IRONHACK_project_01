const Rooms = require("../models/Room.model");

module.exports = async (req, res, next) => {
  // checks if user is the owner of the room in the url params
  try {
    const roomToEdit = await Rooms.findById(req.params.id);
    if (roomToEdit.owner.toString() !== req.userId) {
      return res.status(403).send("You are not authorized to edit this room");
    }
    //store the room in the request object
    req.targetRoom = roomToEdit;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
