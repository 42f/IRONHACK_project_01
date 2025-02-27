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
    allMyGroups[i].match = await allMyGroups[i].getGroupMatch();
  }

  // 6. EXTRACT GROUPS WHERE IM OWN
  // 7. EXTRACT GROUPS WHERE IM PARTICIPANTS
  let myOwnGroups = [];
  let myOtherGroups = [];
  allMyGroups.forEach((group) => {
    // console.log(group.owner._id, req.user._id);
    if (group.owner?._id && group.owner?._id.toString() === req.user._id.toString()) {
      myOwnGroups.push(group);
      // console.log("PUUUSHH OWNER");
    } else {
      myOtherGroups.push(group);
    }
  });

  // 8. Rendre la vue
  res.render("groups/allGroups", {
    users: allUsers,
    myOwnGroups,
    myOtherGroups,
    allMyGroups
  });
});

// C R E A T E  F O R M
router.get("/create", async (req, res, next) => {

  const groupOwner = req.user

// Get All Users
  let allUsers = await User.find({ _id: { $ne: groupOwner._id } });

// 3. Get current user matches with others
for (let i = 0; i < allUsers.length; i++) {
  const targetUser = allUsers[i];
  targetUser["match"] = await groupOwner.getCompatibility(targetUser);
}



  res.render("groups/createGroup", {users:allUsers, groupOwner});
});

router.post("/create", async (req, res, next) => {

  const groupToCreate = req.body
  const createdGroup = await Group.create(groupToCreate)

  const newGroupId = createdGroup._id.toString()

  // console.log(createdGroup, 'FORM DATA');
  // res.send('envoi form')
  res.redirect(`/groups/${newGroupId}`);
});


// D I S P L A Y  A  G R O U P
router.get("/:id", async (req, res, next) => {
  try {
    // 1. Récuperer le groupe
    const group = await Group.findById(req.params.id).populate(
      "owner participants"
      );
      // 2. Récupérer la playlist du groupe
      const groupPlaylist = await group.getCommonGroupTracks();
      // group.getCommonGroupTracks();
      // console.log("GROUP PLAYLIST :", groupPlaylist);

      const match = groupPlaylist.length;
      // await group.getGroupMatch();
      // const match = await group.getGroupMatch();

      const groupLen = (group.participants.length );
      res.render("./groups/showOneGroup", {
        group,
        groupLen,
        match,
        tracklist: groupPlaylist,
      });
    } catch(error) {
      console.error(error)
      res.send('error...')
    }
});

router.get("/:id/edit", async (req, res, next) => {
  const groupOwner = req.user;
  // 1. Get All Users
  let allUsers = await User.find({ _id: { $ne: groupOwner._id } });
  // 2. Get group playlist
  const group = await Group.findById(req.params.id).populate(
    "owner participants"
  );
  // 5. Set allUsers checked status and getMatchUserWithGroup
  // for (let i = 0; i < allUsers.length; i++) {
  //   const targetUser = allUsers[i];
  //   targetUser["matchGroup"] = await group.getMatchUserWithGroup(targetUser);
  //   targetUser["matchGroup"]["pourcentage"] = (
  //     (targetUser["matchGroup"]["numOfMatches"] /
  //       targetUser["matchGroup"]["numOfGroupTracks"]) *
  //     100
  //   ).toFixed(0);
  //   // console.log(("USER WITH GROUP MATCH:", targetUser['matchGroup']));

  //   targetUser["isChecked"] = await group.getUsersWithCheckedStatus(targetUser);
  // }
  // allUsers.forEach((user) => {
  //   console.log(user.userName, user["isChecked"]);
  // });

  // console.log(allUsers, 'users');
  res.render("groups/editOneGroup", { users: allUsers, group });
});

router.post("/:id/edit", (req, res, next) => {
  res.send("ok");
  // res.redirect("/:id");
});

router.get("/:id/delete", async(req, res, next) => {

  const groupId = req.params.id
  try{

    const deleteGroup = await Group.deleteOne({_id: req.params.id})

  }catch(err){

    console.err(err)
    res.redirect(`/groups/${groupId}`)

  }
  // res.send('ok delete');
  res.redirect("/groups");
});

module.exports = router;
