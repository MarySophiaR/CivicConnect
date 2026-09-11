const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  address: {
    state: String,
    district: String,
    city: String,
    area: String,
    landmark: String,
    pincode: String,
  },
  municipality: String,
  wardNumber: Number,
  supportCount: {
    type: Number,
    default: 0,
  },
  supporters: [{
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    supportedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    default: 'Pending',
  },
  currentLevel: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignmentHistory: [{
    officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    level: String,
    assignedAt: Date,
    startedAt: Date,
    resolvedAt: Date,
    endedAt: Date,
    endReason: String,
    resolved: Boolean,
  }],
  deadline: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  resolutionRemarks: String,
  resolutionImage: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  escalationHistory: []
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);