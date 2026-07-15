const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },

  // For off-campus internships, internship ref may be null — store title separately
  internshipTitle: { type: String },

  // Grading criteria (each 0–100)
  performance:    { type: Number, min: 0, max: 100, default: 0 },
  attendance:     { type: Number, min: 0, max: 100, default: 0 },
  taskCompletion: { type: Number, min: 0, max: 100, default: 0 },
  communication:  { type: Number, min: 0, max: 100, default: 0 },

  /**
   * certificateMarks — bonus/marks component from the completion certificate.
   * Mentor sets this after verifying the certificate (0–100).
   * Counts as a 5th component in the overall calculation.
   */
  certificateMarks: { type: Number, min: 0, max: 100, default: 0 },

  overall: { type: Number, min: 0, max: 100 },
  grade:   { type: String },
  feedback: { type: String },

  /**
   * completionCertificate — reference to the Document uploaded by the student.
   * Set automatically when student uploads a completion_certificate type document.
   */
  completionCertificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  certificateVerified:   { type: Boolean, default: false },

  // Unlocked after full application approval
  canGiveMark: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
