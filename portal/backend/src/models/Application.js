const mongoose = require('mongoose');

/** Reused for each of the 3 approval levels */
const approvalSchema = new mongoose.Schema({
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  comment:    { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
});

const applicationSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  /**
   * internshipType
   *  'portal'     — student applied to an internship listed on this portal
   *  'off_campus' — student arranged their own internship externally
   *
   * For off_campus:  internship field may be null/empty; offCampusDetails holds
   *                  the company/role info the student provides manually.
   */
  internshipType: {
    type: String,
    enum: ['portal', 'off_campus'],
    default: 'portal',
  },

  // Only set for portal-type applications
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },

  // ── Off-campus details (filled by student for self-arranged internships) ──
  offCampusDetails: {
    companyName:    { type: String },
    role:           { type: String },
    location:       { type: String },
    duration:       { type: String },   // e.g. "2 Months"
    stipend:        { type: String },
    startDate:      { type: Date },
    endDate:        { type: Date },
    supervisorName: { type: String },
    supervisorEmail:{ type: String },
  },

  coverLetter: { type: String },

  /**
   * submittedDocuments — Array of Document._id refs attached to this application.
   *
   * MANDATORY for ALL applications (portal + off-campus):
   *   - noc              (No Objection Certificate from the university)
   *   - offer_letter     (Offer letter from the company)
   *   - email_screenshot (Screenshot of the official offer / joining email)
   *
   * These are checked before the application can be submitted.
   */
  submittedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

  // CGPA snapshot at the moment of application (audit trail)
  cgpaAtApplication: { type: Number, default: null },

  // ── 3-level approval pipeline ─────────────────────────────────────────
  mentorApproval:     { type: approvalSchema, default: () => ({}) },
  adminApproval:      { type: approvalSchema, default: () => ({}) },
  superAdminApproval: { type: approvalSchema, default: () => ({}) },

  // Derived from the three approval levels
  overallStatus: {
    type: String,
    enum: ['submitted', 'mentor_approved', 'admin_approved', 'fully_approved', 'rejected'],
    default: 'submitted',
  },

  /**
   * completionCertificate — Document._id of the internship completion certificate
   * uploaded by the student after finishing the internship.
   * Mentor can see this and it is factored into the marks.
   */
  completionCertificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  certificateVerified:   { type: Boolean, default: false },  // set by mentor after review

  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
