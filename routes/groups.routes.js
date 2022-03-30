const async = require("hbs/lib/async");
const isLoggedIn = require("../middleware/isLoggedIn");
const Group = require("../models/Group.model");
const User = require("../models/User.model");
// const Link = require('../models/Link.model');

const router = require("express").Router();

router.get("/", async (req, res, next) => {
  // console.log('REQUETE.USER: ',req.user);
const meUser = req.user

  // 1. Get All My Groups as owner and participants
  const allMyGroups = await Group.find({
    $or: [{ owner: req.user._id }, { participants: req.user._id }],
  }).populate("owner participants");

  // console.log('ALL MY GROUPS', allMyGroups.map(
  //   group=>{
  //     return {ower: group.owner, part:  JSON.stringify(group.participants)}
  //   }
  // ));

  // 2. Get All Users
  let allUsers = await User.find(); //condition = userid != currentUser._id

  // 3. Get current user matches with others
  for (let i = 0; i < allUsers.length; i++) {
    const targetUser = allUsers[i];
    targetUser['match'] = await meUser.getCompatibility(targetUser)
  }
  // 4. Sort users by matches
  allUsers = allUsers.sort((userA, userB) => 
    userB.match.numOfMatches - userA.match.numOfMatches
  );
 
  // console.log('--ALL MATCHES--', allUsers.map(user => { return {...user.match}}));
  // console.log('ALL MY GROUPS: ',allMyGroups);

  // 5. GET MATCHES FOR MY GROUPS
  const group = Group.findById('62441ae22549882842c7b751')
  // const cumulPlaylist =  group.getCumulativePlaylist('62441ae22549882842c7b751')
  console.log('Playlist: ', group.owner);

  // console.log('Playlist: ',cumulPlaylist);


  
  // Rendre la vue
  res.render("groups/allGroups", {users: allUsers, allMyGroups });
});

router.get("/create", (req, res, next) => {
  res.render("groups/createGroup");
});
router.post("/create", (req, res, next) => {
  res.render("groups/createGroup");
});


router.get("/:id", async (req, res, next) => {

  console.log('PARMAS',req.params.id);
  const group = await Group.findById(req.params.id)
  .populate('owner participants')
  // group.getCumulativePlaylist();

  console.log('LE GROUPE: ', group);
  res.render('./groups/showOneGroup', {group})
});


router.get("/:id/edit", (req, res, next) => {
  res.render("groups/editOneGroup");
});

router.post("/:id/edit", (req, res, next) => {
  res.redirect("/:id");
});

router.post("/:id/delete", (req, res, next) => {
  res.redirect("/groups");
});

module.exports = router;
