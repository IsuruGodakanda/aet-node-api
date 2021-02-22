const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/:user_id
// @desc     Get current users profile
// @access   Private
router.get('/:user_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).select(['-createdDate', '-updatedDate']);

    if (!profile) {
      return res.status(400).json({errors: [{ msg: 'There is no profile for this user' }]});
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile/:user_id
// @desc     Create or update user profile
// @access   Private
router.post(
  '/:user_id',
  [
    check('firstName', 'First Name is required')
        .not()
        .isEmpty(),
    check('lastName', 'Last Name is required')
        .not()
        .isEmpty(),
    check('gender', 'Gender is required')
        .not()
        .isEmpty(),
    check('religion', 'Religion is required')
        .not()
        .isEmpty(),
    check('dateOfBirth', 'Date Of Birth is required')
        .not()
        .isEmpty(),
    check('phoneNumber', 'Phone Number is required')
        .not()
        .isEmpty(),
    check('technologies', 'Technologies is required')
        .not()
        .isEmpty(),
    check('address', 'Address is required')
        .not()
        .isEmpty(),
    check('githubusername', 'Git hub Username is required')
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
      firstName,
      lastName,
      gender,
      religion,
      dateOfBirth,
      phoneNumber,
      managers = [],
      projects = [],
      technologies = [],
      address,
      githubusername,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.params.user_id;
    profileFields.firstName = firstName;
    profileFields.lastName = lastName;
    profileFields.gender = gender;
    profileFields.religion = religion;
    profileFields.dateOfBirth = dateOfBirth;
    profileFields.phoneNumber = phoneNumber;
    profileFields.managers = managers;
    profileFields.projects = projects;
    profileFields.technologies = technologies;
    profileFields.address = address;
    profileFields.githubusername = githubusername;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.params.user_id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().select(['-createdDate', '-updatedDate']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/:user_id', auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.params.user_id });

    res.json({ msg: 'User profile deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
