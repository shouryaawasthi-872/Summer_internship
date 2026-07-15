const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  mentor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledAt: { type: Date, required: true },
  duration:    { type: Number, default: 60 }, // minutes
  meetLink:    { type: String },
  status:      { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
