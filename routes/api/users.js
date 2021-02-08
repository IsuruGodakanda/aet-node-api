const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('role', 'Role is required')
      .not()
      .isEmpty(),
    // check(
    //   'password',
    //   'Please enter a password with 6 or more characters'
    // ).isLength({ min: 6 })
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, role, password = 'Asdf123' } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name,
        email,
        role,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET api/users
// @desc     Get all users
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    let offset = parseInt(req.query.offset) || 0
    let limit = parseInt(req.query.limit) || 5
    let search = req.query.search_term || ''
    let sortby = req.query.sortby || ''
    let sortdirection = req.query.sortdirection === "ASC" ? 1 : -1

    const users = await User.find({name: { $regex: new RegExp("^" + search.toLowerCase(), "i")  }}, {id: 1, name: 1, email: 1, role: 1}).skip(offset*limit).limit(limit).sort(req.query.sortdirection ? {[sortby]: sortdirection, $natural:-1} : {$natural:-1});

    const userCount = await User.find({name: { $regex: new RegExp("^" + search.toLowerCase(), "i")  }}).countDocuments();
    res.json({"results": users, "totalCount": userCount});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/users/:user_id
// @desc     Get user by user ID
// @access   Private
router.get('/:user_id', auth, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.user_id
    }, {name: 1, email: 1, role: 1});

    if (!user) return res.status(400).json({ msg: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/users/:user_id
// @desc     Update user by user ID
// @access   Private
router.put(
  '/:user_id',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('role', 'Role is required')
      .not()
      .isEmpty(),
  ], auth, async (req, res) => {  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, role } = req.body;
    try {
      const user = await User.findOne({
        _id: req.params.user_id
      }, {name: 1, email: 1, role: 1});

      if (!user) return res.status(400).json({ msg: 'User not found' });

      await User.findOneAndUpdate(
        { _id : req.params.user_id },
        { $set: { name, email, role} },
        { upsert:true, new : true }
      );
  
      res.json({ msg: 'User updated' });
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'User not found' });
      }
      res.status(500).send('Server Error');
    }
});

// @route    DELETE api/users/:user_id
// @desc     Delete user by id
// @access   Private
router.delete('/:user_id', auth, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.user_id
    }, {name: 1, email: 1, role: 1});

    if (!user) return res.status(400).json({ msg: 'User not found' });

    await User.findOneAndRemove({ _id: req.params.user_id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
