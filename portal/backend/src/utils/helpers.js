const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

/** Generate JWT token */
exports.generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES || '7d';
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

/** Send token response */
exports.sendToken = (user, statusCode, res) => {
  const token = exports.generateToken(user._id);
  const userData = user.toObject();
  delete userData.password;
  res.status(statusCode).json({ success: true, token, user: userData });
};

/** Create a notification */
exports.createNotification = async (recipientId, title, message, type = 'system', link = '') => {
  try {
    await Notification.create({ recipient: recipientId, title, message, type, link });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

/** Derive overall application status from approval levels */
exports.deriveStatus = (app) => {
  if (
    app.mentorApproval?.status === 'rejected' ||
    app.adminApproval?.status === 'rejected' ||
    app.superAdminApproval?.status === 'rejected'
  ) return 'rejected';
  if (app.superAdminApproval?.status === 'approved') return 'fully_approved';
  if (app.adminApproval?.status === 'approved') return 'admin_approved';
  if (app.mentorApproval?.status === 'approved') return 'mentor_approved';
  return 'submitted';
};
