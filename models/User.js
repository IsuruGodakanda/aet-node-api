const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    default: 'ADMIN' | 'MANAGER' | 'WORKER'
  },
  password: {
    type: String
  },
  passwordOTP: {
    otp: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  avatar: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);
