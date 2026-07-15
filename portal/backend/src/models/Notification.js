const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['application', 'document', 'meeting', 'marks', 'system'], default: 'system' },
  link:      { type: String }, // frontend route
  isRead:    { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
