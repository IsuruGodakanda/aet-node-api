const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    default: "MALE" | "FEMALE" | "OTHER"
  },
  religion: {
    type: String,
    required: true,
    default: "BUDDHISM" | "HINDUISM" | "ISLAM" | "CHRISTIANITY"
  },
  religion: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  managers: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'user'
  },
  projects: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'project'
  },
  Technologies: {
    type: [String],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  githubusername: {
    type: String,
    required: true
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

module.exports = Profile = mongoose.model('profile', ProfileSchema);
