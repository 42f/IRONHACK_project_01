const isLoggedIn = require("../middleware/isLoggedIn");
const Rooms = require("../models/Room.model");

const isOwner = require("../middleware/isOwner");
const isNotOwner = require("../middleware/isNotOwner");
const hasRequiredFields = require("../middleware/hasRequiredFields");
const Review = require("../models/Review.model");

const router = require("express").Router();



router.get("/:id/create", isLoggedIn, isNotOwner, (req, res, next) => {
  const room = req.targetRoom;
  const data = {
    formTitle: `Review ${room.owner.fullName}'s room "${room.name}"`,
    formAction: `/reviews/${room.id}/create`,
    formButton: 'Review',
  }
  res.render("rooms/review-form", data);
});

router.post("/:id/create", isLoggedIn, isNotOwner, hasRequiredFields(['comment']), async (req, res, next) => {
  const { comment } = req.body;
  try {
    const room = req.targetRoom;
    const user = req.userId;
    const newReview = await Review.create({comment, user});
    await Rooms.findByIdAndUpdate(room._id, {reviews: [...room.reviews, newReview]});
    res.redirect("/rooms");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
