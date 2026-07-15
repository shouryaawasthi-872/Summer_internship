const mongoose = require('mongoose');

/**
 * requiredDocuments — array of document-type strings the admin/mentor defines
 * when creating the internship.  Students must have uploaded AND had approved
 * at least one Document for each type listed before they can apply.
 *
 * Examples: ['resume', 'marksheet', 'id_proof', 'noc']
 * The strings should match the `type` enum in the Document model (or any
 * free-text label for custom document names).
 */
const internshipSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  description: { type: String, required: true },
  domain:      { type: String },
  location:    { type: String, default: 'Remote' },
  duration:    { type: String },           // e.g. "3 Months"
  stipend:     { type: String },
  seats:       { type: Number, default: 10 },
  skills:      [String],
  lastDate:    { type: Date },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ── New: CGPA eligibility ────────────────────────────────────────────
  /**
   * Minimum CGPA (0–10 scale) required to view / apply for this internship.
   * Students whose currentCGPA < minCGPA will NOT see this internship in listings
   * and will be blocked from applying.  Default 0 = open to all.
   */
  minCGPA: { type: Number, default: 0, min: 0, max: 10 },

  // ── New: Dynamic required documents ─────────────────────────────────
  /**
   * List of document types (labels) that a student MUST upload before applying.
   * Stored as plain strings so admins can add custom labels beyond the
   * Document model's enum (e.g. 'noc', 'previous_marksheet', etc.).
   * Each entry is compared case-insensitively against Document.type or Document.title.
   */
  requiredDocuments: [{ type: String, trim: true }],

  // Mentor-posted internships need admin approval; admin/superadmin auto-approved
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
