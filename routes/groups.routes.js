const async = require('hbs/lib/async');
const { getGroups } = require('../controllers/groups.controller');
const isLoggedIn = require('../middleware/isLoggedIn');
const Group = require('../models/Group.model');
const User = require('../models/User.model');
// const Link = require('../models/Link.model');

const router = require('express').Router();

router.get('/', getGroups)
//  async (req, res, next) => {
//   // console.log('REQUETE.USER: ',req.user);
//   const meUser = req.user;

//   // 1. Get All My Groups as owner and participants
//   const allMyGroups = await Group.find({
//     $or: [{ owner: req.user._id }, { participants: req.user._id }],
//   }).populate('owner participants');

//   // console.log('ALL MY GROUPS', allMyGroups.map(
//   //   group=>{
//   //     return {ower: group.owner, part:  JSON.stringify(group.participants)}
//   //   }
//   // ));

//   // 2. Get All Users
//   let allUsers = await User.find(); //condition = userid != currentUser._id

//   // 3. Get current user matches with others
//   for (let i = 0; i < allUsers.length; i++) {
//     const targetUser = allUsers[i];
//     targetUser['match'] = await meUser.getCompatibility(targetUser);
//   }
//   // 4. Sort users by matches
//   allUsers = allUsers.sort(
//     (userA, userB) => userB.match.numOfMatches - userA.match.numOfMatches
//   );

//   // 5. Send allMyGroups to method extractStatistic
//   for (let i = 0; i < allMyGroups.length; i++) {
//     const targetGroup = allMyGroups[i];
//     targetGroup['match'] = await allMyGroups[i].extractStatistic()
//     // on attend le number/string renvoyé par extractStatistic
//     // console.log('TARGET MATCH : ', targetGroup['match']);
//   }

//   // 6. EXTRACT GROUPS WHERE IM OWN
//   // 7. EXTRACT GROUPS WHERE IM PARTICIPANTS
//   let myOwnGroups = [];
//   let myOtherGroups = [];
//   allMyGroups.forEach((group) => {
//     console.log(group.owner._id, req.user._id);
//     if (group.owner._id.toString() === req.user._id.toString()) {
//       myOwnGroups.push(group);
//       console.log('PUUUSHH OWNER');
//     } else {
//       myOtherGroups.push(group);
//     }
//   });


//   //   const commonGroupTracks = await allMyGroups[0].extractStatistic()

//   // Rendre la vue
//   res.render('groups/allGroups', { users: allUsers, myOwnGroups, myOtherGroups});
// });

router.get('/create', (req, res, next) => {
  res.render('groups/createGroup');
});
router.post('/create', (req, res, next) => {
  res.render('groups/createGroup');
});

router.get('/:id', async (req, res, next) => {
  console.log('PARMAS', req.params.id);
  const group = await Group.findById(req.params.id).populate(
    'owner participants'
  );
  // group.getCumulativePlaylist();

  console.log('LE GROUPE: ', group);
  res.render('./groups/showOneGroup', { group });
});

router.get('/:id/edit', (req, res, next) => {
  res.render('groups/editOneGroup');
});

router.post('/:id/edit', (req, res, next) => {
  res.redirect('/:id');
});

router.post('/:id/delete', (req, res, next) => {
  res.redirect('/groups');
});

module.exports = router;
