const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Leave = require('../../models/Leave');
const User = require('../../models/User');

// @route    GET api/profile/:user_id
// @desc     Get current users profile
// @access   Private
// router.get('/:user_id', auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user: req.params.user_id }).select(['-createdDate', '-updatedDate']);

//     if (!profile) {
//       return res.status(400).json({errors: [{ msg: 'There is no profile for this user' }]});
//     }

//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// @route    POST api/leave
// @desc     Apply leave request
// @access   Private
router.post(
  '/',
  [
    check('subject', 'Subject is required')
        .not()
        .isEmpty(),
    check('leaveType', 'Leave Type is required')
        .not()
        .isEmpty(),
    check('startTime', 'Start Date is required')
        .not()
        .isEmpty(),
    check('endTime', 'End Date is required')
        .not()
        .isEmpty(),
    check('description', 'Description is required')
        .not()
        .isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      subject,
      leaveType,
      startTime,
      endTime,
      description,
    } = req.body;

    try {    
      newLeave = new Leave({
        subject,
        leaveType,
        startTime,
        endTime,
        description,
        owner: req.user.id
      });

      newLeave.save();

      return res
        .status(200)
        .json({ msg: "Leave request has applied!" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/leave
// @desc     Get all leaves
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const leaves = await Leave.find().select(['-createdDate', '-updatedDate']);

    await res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
// router.delete('/:user_id', auth, async (req, res) => {
//   try {
//     // Remove profile
//     await Profile.findOneAndRemove({ user: req.params.user_id });

//     res.json({ msg: 'User profile deleted' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;
