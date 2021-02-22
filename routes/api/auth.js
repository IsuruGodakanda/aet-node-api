const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const SG_API_KEY = config.get('sgApiKey');

sgMail.setApiKey(SG_API_KEY);

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        id: user.id,
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

// @route    GET api/auth/verifycode
// @desc     Verify OTP code
// @access   Public
router.get(
  '/verifycode',
  async (req, res) => {
    // Get otpToken from Authorization header
    const otpToken = req.header('Authorization');

    try {
      await jwt.verify(otpToken, config.get('jwtSecret'), async (error, decoded)=>{
        if(error){
          if (error.message === "jwt expired") {
            res.status(401).json({errors: [{ msg: 'Token has expired' }]});
          } else if (error.message === "jwt must be provided") {
            res.status(400).json({errors: [{ msg: 'Token must be provided' }]});
          } else {
            res.status(400).json({errors: [{ msg: 'Token is not valid' }]});
          }
        } else {
          const email = decoded.email;

          let user = await User.findOne({ email });

          if (!user) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'User does not exist' }] });
          } else if (user.passwordOTP.isUsed) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'The token has already used' }] });
          }

          return res
              .status(200)
              .json({ msg: 'Email verified' });
        }
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST api/auth/setpassword
// @desc     Set Password
// @access   Public
router.post(
  '/setpassword',
  [
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    // Get otpToken from Authorization header
    const otpToken = req.header('Authorization');

    try {
      await jwt.verify(otpToken, config.get('jwtSecret'), async (error, decoded)=>{
        if(error){
          if (error.message === "jwt expired") {
            res.status(401).json({errors: [{ msg: 'Token has expired' }]});
          } else if (error.message === "jwt must be provided") {
            res.status(400).json({errors: [{ msg: 'Token must be provided' }]});
          } else {
            res.status(400).json({errors: [{ msg: 'Token is not valid' }]});
          }
        } else {
          const email = decoded.email;

          let user = await User.findOne({ email });

          if (!user) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'User does not exist' }] });
          } else if (user.passwordOTP.isUsed) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'The token has already used' }] });
          }

          const salt = await bcrypt.genSalt(10);

          user.password = await bcrypt.hash(password, salt);
          user.passwordOTP.isUsed = true;

          await user.save();

          const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          };
    
          jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          );
        }
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST api/auth/resendemail
// @desc     Resend verification email
// @access   Public
router.post(
  '/resendemail',
  [
    check('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User does not exist' }] });
      }

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

          user.passwordOTP = await passwordOTP;
    
          await user.save();

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
                .json({ msg: "Email has re-sent!" });
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

module.exports = router;
