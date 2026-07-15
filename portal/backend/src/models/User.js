const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['student', 'mentor', 'admin', 'superadmin'], default: 'student' },
  phone:    { type: String },
  avatar:   { type: String },

  // ── Student-specific ──────────────────────────────────────────────────
  rollNumber:     { type: String },
  branch:         { type: String },
  semester:       { type: String },
  university:     { type: String },
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  /**
   * currentCGPA — the active/effective CGPA used for eligibility checks.
   * Mentor updates this whenever a new semester result is entered.
   * Stored separately so queries are fast (no need to aggregate CgpaRecord).
   */
  currentCGPA: { type: Number, default: null, min: 0, max: 10 },

  // ── Mentor-specific ───────────────────────────────────────────────────
  department:       { type: String },
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
