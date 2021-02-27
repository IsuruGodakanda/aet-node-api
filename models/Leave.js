const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'user'
  },
  allDay: {
    type: Boolean,
    default: false
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

module.exports = Leave = mongoose.model('leave', LeaveSchema);
