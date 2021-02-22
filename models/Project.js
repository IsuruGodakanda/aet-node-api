const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  projectMembers: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'user'
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

module.exports = Project = mongoose.model('project', ProjectSchema);
