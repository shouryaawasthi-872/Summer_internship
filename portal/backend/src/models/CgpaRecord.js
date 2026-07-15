const mongoose = require('mongoose');

/**
 * CgpaRecord — stores one row per semester per student.
 * Mentor creates/updates entries; system derives currentCGPA from the latest record.
 *
 * Example flow:
 *   Mentor calls PUT /api/cgpa  { studentId, semester: 3, cgpa: 8.6, remarks }
 *   Controller upserts this record and sets student.currentCGPA to the highest
 *   semester number's CGPA (latest = most recent academic standing).
 */
const cgpaRecordSchema = new mongoose.Schema({
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  /** Numeric semester (1-8 for UG, 1-4 for PG) */
  semester: { type: Number, required: true, min: 1, max: 12 },

  /** CGPA on a 10-point scale */
  cgpa:     { type: Number, required: true, min: 0, max: 10 },

  /** Optional: mentor comments / remarks for this semester */
  remarks:  { type: String },

  /** Whether this entry is the latest (used for quick lookup) */
  isLatest: { type: Boolean, default: false },
}, { timestamps: true });

// Compound unique: one record per student per semester
cgpaRecordSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('CgpaRecord', cgpaRecordSchema);
