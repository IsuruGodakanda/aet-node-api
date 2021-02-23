const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const config = require('config');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/multer');
const excelController = require('../../controller/excelController');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const SG_API_KEY = config.get('sgApiKey');

sgMail.setApiKey(SG_API_KEY);

// @route    POST api/users/bulkupload
// @desc     Register set of users
// @access   Public
router.post(
  '/bulkupload', 
  upload.single("file"),
  excelController.uploadFile,
  [
    check('file', 'Please include a valid file')
      .not()
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      res.json(req.data);
      // let user = await User.findOne({ email });

      // if (user) {
      //   return res
      //     .status(400)
      //     .json({ errors: [{ msg: 'User already exists' }] });
      // }

      // const avatar = gravatar.url(email, {
      //   s: '200',
      //   r: 'pg',
      //   d: 'mm'
      // });

      // const payload = {
      //   email
      // };

      // jwt.sign(
      //   payload,
      //   config.get('jwtSecret'),
      //   { expiresIn: 300 },
      //   async (err, token) => {
      //     if (err) throw err;
      //     let passwordOTP = {
      //       otp: token,
      //       isUsed: false
      //     }

      //     newUser = new User({
      //       email,
      //       role,
      //       avatar,
      //       passwordOTP
      //     });
    
      //     newUser.save();

      //     const emailObject = {
      //       to: email,
      //       from: {
      //         name: 'Greatcode',
      //         email:'isurugreatcode@gmail.com'
      //       },
      //       subject: 'Verification Email',
      //       text: 'Please verify your acount',
      //       html: `<div style="padding: 0; margin: 0; font-family: 'Open Sans', sans-serif;">
      //               <div style="max-width:600px; margin:0 auto">
      //                   <div style="background-color:#e9eef1;padding:30px">
      //                       <div style="margin:40px 0;text-align:center">
      //                           <h1>Greatcode</h1>
      //                       </div>
      //                       <div style="text-align:center">
      //                           <p style="font-size:44px;font-weight:700;letter-spacing:0.51px;color:#212121;line-height:44px;margin-bottom:10px">
      //                               Welcome to Greatcode!
      //                           </p>
      //                           <p style="font-size:22px;font-weight:500;letter-spacing:0.41px;color:#212121;margin-bottom:40px">
      //                               Please confirm your email address
      //                           </p>
      //                       </div>
      //                       <div style="text-align:center;margin:15px 0 20px 0;font-size:22px;letter-spacing:0.41px">
      //                           <a href="http://localhost:3000/createpassword?code=${passwordOTP.otp}" target="_blank" style="color:#2696d9;text-decoration:underline">
      //                               Create Password
      //                           </a>
      //                       </div>
      //                   </div>
      //               </div>
      //           </div>`
      //     }

      //     await sgMail
      //       .send(emailObject)
      //       .then(() => {
      //         return res
      //           .status(200)
      //           .json({ msg: "Email has sent" });
      //       })
      //       .catch((err) => console.log(err));
      //   }
      // );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('role', 'Role is required')
      .not()
      .isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role } = req.body;

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

      const payload = {
        email
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 300 },
        async (err, token) => {
          if (err) throw err;
          let passwordOTP = {
            otp: token,
            isUsed: false
          }

          newUser = new User({
            email,
            role,
            avatar,
            passwordOTP
          });
    
          newUser.save();

          const emailObject = {
            to: email,
            from: {
              name: 'Greatcode',
              email:'isurugreatcode@gmail.com'
            },
            subject: 'Verification Email',
            text: 'Please verify your acount',
            html: `<div style="padding: 0; margin: 0; font-family: 'Open Sans', sans-serif;">
                    <div style="max-width:600px; margin:0 auto">
                        <div style="background-color:#e9eef1;padding:30px">
                            <div style="margin:40px 0;text-align:center">
                                <h1>Greatcode</h1>
                            </div>
                            <div style="text-align:center">
                                <p style="font-size:44px;font-weight:700;letter-spacing:0.51px;color:#212121;line-height:44px;margin-bottom:10px">
                                    Welcome to Greatcode!
                                </p>
                                <p style="font-size:22px;font-weight:500;letter-spacing:0.41px;color:#212121;margin-bottom:40px">
                                    Please confirm your email address
                                </p>
                            </div>
                            <div style="text-align:center;margin:15px 0 20px 0;font-size:22px;letter-spacing:0.41px">
                                <a href="http://localhost:3000/createpassword?code=${passwordOTP.otp}" target="_blank" style="color:#2696d9;text-decoration:underline">
                                    Create Password
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`
          }

          await sgMail
            .send(emailObject)
            .then(() => {
              return res
                .status(200)
                .json({ msg: "Email has sent" });
            })
            .catch((err) => console.log(err));
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

    const users = await User.find({email: { $regex: new RegExp("^" + search.toLowerCase(), "i")  }}, {id: 1, email: 1, role: 1}).skip(offset*limit).limit(limit).sort(req.query.sortdirection ? {[sortby]: sortdirection} : {$natural:-1});

    const userCount = await User.find({email: { $regex: new RegExp("^" + search.toLowerCase(), "i")  }}).countDocuments();
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
    }, {email: 1, role: 1});

    if (!user) return res.status(400).json({errors: [{ msg: 'User not found' }]});

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({errors: [{ msg: 'User not found' }]});
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
    check('email', 'Please include a valid email').isEmail(),
    check('role', 'Role is required')
      .not()
      .isEmpty(),
  ], auth, async (req, res) => {  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role } = req.body;
    try {
      const user = await User.findOne({
        _id: req.params.user_id
      }, {email: 1, role: 1});

      if (!user) return res.status(400).json({errors: [{ msg: 'User not found' }]});

      await User.findOneAndUpdate(
        { _id : req.params.user_id },
        { $set: { email, role} },
        { upsert:true, new : true }
      );
  
      res.json({ msg: 'User updated' });
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res.status(400).json({errors: [{ msg: 'User not found' }]});
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
    }, {email: 1, role: 1});

    if (!user) return res.status(400).json({errors: [{ msg: 'User not found' }]});

    await User.findOneAndRemove({ _id: req.params.user_id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
