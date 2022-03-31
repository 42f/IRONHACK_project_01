const isLoggedIn = require("../middleware/isLoggedIn");
const Group = require("../models/Group.model");
const Link = require("../models/Link.model");
const User = require("../models/User.model");
// const Link = require('../models/Link.model');

const router = require("express").Router();

router.get("/", async (req, res, next) => {
  // console.log('REQUETE.USER: ',req.user);
  const meUser = req.user;

  // 1. Get All My Groups as owner and participants
  const allMyGroups = await Group.find({
    $or: [{ owner: req.user._id }, { participants: req.user._id }],
  }).populate("owner participants");

  // 2. Get All Users
  let allUsers = await User.find({ _id: { $ne: meUser._id } });

  // 3. Get current user matches with others
  for (let i = 0; i < allUsers.length; i++) {
    const targetUser = allUsers[i];
    targetUser["match"] = await meUser.getCompatibility(targetUser);
  }
  // 4. Sort users by matches
  allUsers = allUsers.sort(
    (userA, userB) => userB.match.numOfMatches - userA.match.numOfMatches
  );

  // 5. Send allMyGroups to method getGroupMatch
  for (let i = 0; i < allMyGroups.length; i++) {
    const targetGroup = allMyGroups[i];
    targetGroup["match"] = await allMyGroups[i].getGroupMatch();
  }

  // 6. EXTRACT GROUPS WHERE IM OWN
  // 7. EXTRACT GROUPS WHERE IM PARTICIPANTS
  let myOwnGroups = [];
  let myOtherGroups = [];
  allMyGroups.forEach((group) => {
    console.log(group.owner._id, req.user._id);
    if (group.owner._id.toString() === req.user._id.toString()) {
      myOwnGroups.push(group);
      console.log("PUUUSHH OWNER");
    } else {
      myOtherGroups.push(group);
    }
  });

  // 8. Rendre la vue
  res.render("groups/allGroups", {
    users: allUsers,
    myOwnGroups,
    myOtherGroups,
  });
});

router.get("/create", (req, res, next) => {
  res.render("groups/createGroup");
});
router.post("/create", (req, res, next) => {
  res.render("groups/createGroup");
});

router.get("/:id", async (req, res, next) => {
  // 1. Récuperer le groupe
  const group = await Group.findById(req.params.id).populate(
    "owner participants"
  );
  // 2. Récupérer la playlist du groupe
  const groupPlaylist = await group.getCommonGroupTracks();
  // group.getCommonGroupTracks();
  console.log("GROUP PLAYLIST :", groupPlaylist);

  const match = await group.getGroupMatch();

  res.render("./groups/showOneGroup", {
    group,
    match,
    tracklist: groupPlaylist,
  });
});

router.get("/:id/edit", async (req, res, next) => {
  const meUser = req.user;
  // 1. Get All Users
  let allUsers = await User.find({ _id: { $ne: meUser._id } });
  // 2. Get group playlist
  const group = await Group.findById(req.params.id).populate(
    "owner participants"
  );

  // 5. Set allUsers checked status and getMatchUserWithGroup
  for (let i = 0; i < allUsers.length; i++) {
    const targetUser = allUsers[i];
    targetUser["matchGroup"] = await group.getMatchUserWithGroup(targetUser);
    targetUser["matchGroup"]["pourcentage"] = (
      (targetUser["matchGroup"]["numOfMatches"] /
        targetUser["matchGroup"]["numOfGroupTracks"]) *
      100
    ).toFixed(0);
    // console.log(("USER WITH GROUP MATCH:", targetUser['matchGroup']));

    targetUser["isChecked"] = await group.getUsersWithCheckedStatus(targetUser);
  }
  allUsers.forEach((user) => {
    console.log(user.userName, user["isChecked"]);
  });

  // console.log(allUsers, 'users');
  res.render("groups/editOneGroup", { users: allUsers, group });
});

router.post("/:id/edit", (req, res, next) => {
  res.send("ok");
  // res.redirect("/:id");
});

router.post("/:id/delete", (req, res, next) => {
  res.redirect("/groups");
});

module.exports = router;
