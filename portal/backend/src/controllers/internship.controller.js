const Internship = require('../models/Internship');
const User       = require('../models/User');
const { createNotification } = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/internships
 *  - Students: only approved, active internships where minCGPA ≤ their CGPA
 *  - Admin/SuperAdmin: all internships
 *  - Mentor: approved + their own pending posts
 */
// ─────────────────────────────────────────────────────────────────────────────
exports.getInternships = async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'student') {
      query.status = 'approved';

      // CGPA filter — only show internships the student is eligible for
      const student = await User.findById(req.user._id).select('currentCGPA').lean();
      const cgpa = student?.currentCGPA ?? 0;

      // minCGPA 0 means open to all; otherwise student CGPA must be >= minCGPA
      query.$or = [
        { minCGPA: { $lte: cgpa } },
        { minCGPA: { $exists: false } },
        { minCGPA: null },
        { minCGPA: 0 },
      ];
    } else if (req.user.role === 'mentor') {
      // Mentor sees all approved internships + their own pending ones
      query.$or = [
        { status: 'approved' },
        { postedBy: req.user._id },
      ];
    }
    // Admin/superadmin: no extra filters — they see everything

    const internships = await Internship.find(query)
      .populate('postedBy', 'name role')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, count: internships.length, internships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/internships/:id */
// ─────────────────────────────────────────────────────────────────────────────
exports.getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('postedBy', 'name email role');
    if (!internship)
      return res.status(404).json({ success: false, message: 'Internship not found' });
    res.json({ success: true, internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** POST /api/internships — admin/superadmin/mentor creates */
// ─────────────────────────────────────────────────────────────────────────────
exports.createInternship = async (req, res) => {
  try {
    const {
      title, company, description, domain,
      location, duration, stipend, seats,
      skills, lastDate,
      minCGPA,            // NEW
      requiredDocuments,  // NEW — array of strings
    } = req.body;

    // Mentor-posted internships need admin approval; admin/superadmin go live immediately
    const status = ['admin', 'superadmin'].includes(req.user.role) ? 'approved' : 'pending';

    const internship = await Internship.create({
      title, company, description, domain,
      location, duration, stipend, seats,
      skills, lastDate,
      minCGPA:           minCGPA           ?? 0,
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments.filter(Boolean) : [],
      postedBy: req.user._id,
      status,
    });

    if (status === 'pending') {
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      for (const a of admins) {
        await createNotification(
          a._id,
          'New Internship Pending',
          `${req.user.name} posted "${title}" — needs your approval.`,
          'system',
        );
      }
    }

    res.status(201).json({ success: true, internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** PUT /api/internships/:id */
// ─────────────────────────────────────────────────────────────────────────────
exports.updateInternship = async (req, res) => {
  try {
    // Allow updating requiredDocuments and minCGPA via the same endpoint
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!internship)
      return res.status(404).json({ success: false, message: 'Internship not found' });
    res.json({ success: true, internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** DELETE /api/internships/:id */
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship)
      return res.status(404).json({ success: false, message: 'Internship not found' });
    await internship.deleteOne();
    res.json({ success: true, message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** PUT /api/internships/:id/approve */
// ─────────────────────────────────────────────────────────────────────────────
exports.approveInternship = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user._id },
      { new: true },
    );
    await createNotification(
      internship.postedBy,
      `Internship ${status}`,
      `Your internship "${internship.title}" was ${status}.${comment ? ' Note: ' + comment : ''}`,
      'system',
    );
    res.json({ success: true, internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
