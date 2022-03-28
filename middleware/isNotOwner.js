const Rooms = require("../models/Room.model");
const Review = require("../models/Review.model");

module.exports = async (req, res, next) => {
  // checks if user is the owner of the room in the url params
  try {
    const roomToEdit = await Rooms.findById(req.params.id).populate('owner reviews');
    const ownerId = roomToEdit.owner._id.toString();
    if (ownerId === req.userId) {
      return res.status(403).send("You are not authorized to act on your own rooms");
    }
    //store the room in the request object
    req.targetRoom = roomToEdit;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
