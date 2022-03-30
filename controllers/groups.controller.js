const Group = require('../models/Group.model');
const User = require('../models/User.model');
exports.getGroups= async (req,res )=>{
     // console.log('REQUETE.USER: ',req.user);
  const meUser = req.user;

  // 1. Get All My Groups as owner and participants
  const allMyGroups = await Group.find({
    $or: [{ owner: req.user._id }, { participants: req.user._id }],
  }).populate('owner participants');


  // 2. Get All Users
  let allUsers = await User.find({_id: {$ne: meUser._id}});

  // 3. Get current user matches with others
  for (let i = 0; i < allUsers.length; i++) {
    const targetUser = allUsers[i];
    targetUser['match'] = await meUser.getCompatibility(targetUser);
  }
  // 4. Sort users by matches
  allUsers = allUsers.sort(
    (userA, userB) => userB.match.numOfMatches - userA.match.numOfMatches
  );

  // 5. Send allMyGroups to method extractStatistic
  for (let i = 0; i < allMyGroups.length; i++) {
    const targetGroup = allMyGroups[i];
    targetGroup['match'] = await allMyGroups[i].extractStatistic()
  }

  // 6. EXTRACT GROUPS WHERE IM OWN
  // 7. EXTRACT GROUPS WHERE IM PARTICIPANTS
  let myOwnGroups = [];
  let myOtherGroups = [];
  allMyGroups.forEach((group) => {
    console.log(group.owner._id, req.user._id);
    if (group.owner._id.toString() === req.user._id.toString()) {
      myOwnGroups.push(group);
      console.log('PUUUSHH OWNER');
    } else {
      myOtherGroups.push(group);
    }
  });



  res.render('groups/allGroups', { users: allUsers, myOwnGroups, myOtherGroups});
}
