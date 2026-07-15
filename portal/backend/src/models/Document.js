const mongoose = require('mongoose');

/**
 * Document types:
 *  resume             — CV / Resume
 *  id_proof           — Aadhar / College ID
 *  marksheet          — Academic marksheet
 *  noc                — No Objection Certificate (MANDATORY for all internships)
 *  offer_letter       — Company offer letter   (MANDATORY for all internships)
 *  email_screenshot   — Screenshot of offer/joining email (MANDATORY)
 *  completion_certificate — Certificate issued after internship completion
 *  certificate        — Any other certificate
 *  other              — Miscellaneous
 */
const DOCUMENT_TYPES = [
  'resume',
  'id_proof',
  'marksheet',
  'noc',
  'offer_letter',
  'email_screenshot',
  'completion_certificate',
  'certificate',
  'other',
];

const documentSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  type:      { type: String, enum: DOCUMENT_TYPES, required: true },
  filePath:  { type: String, required: true },
  fileSize:  { type: Number },
  mimeType:  { type: String },

  // For completion certificates — links back to the application it completes
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },

  // Approval (done by mentor / admin)
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment:    { type: String },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
