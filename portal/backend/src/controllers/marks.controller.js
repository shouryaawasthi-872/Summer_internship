const Marks    = require('../models/Marks');
const Document = require('../models/Document');
const { createNotification } = require('../utils/helpers');

/**
 * Grade calculation:
 *  5 components: performance, attendance, taskCompletion, communication, certificateMarks
 *  certificateMarks only counts if the certificate has been verified by mentor.
 *  Without certificate: average of 4 components.
 *  With certificate:    average of 5 components.
 */
const calcOverall = (p, a, t, c, cert, certVerified) => {
  const base = [+p, +a, +t, +c];
  if (certVerified && cert > 0) base.push(+cert);
  return Math.round(base.reduce((s, v) => s + v, 0) / base.length);
};

const calcGrade = (overall) => {
  if (overall >= 90) return 'A+';
  if (overall >= 80) return 'A';
  if (overall >= 70) return 'B+';
  if (overall >= 60) return 'B';
  if (overall >= 50) return 'C';
  return 'F';
};

// ─────────────────────────────────────────────────────────────────────────────
/** POST /api/marks — mentor saves / updates marks */
// ─────────────────────────────────────────────────────────────────────────────
exports.saveMarks = async (req, res) => {
  try {
    const {
      studentId, internshipId, internshipTitle,
      performance, attendance, taskCompletion, communication,
      certificateMarks = 0,
      feedback,
    } = req.body;

    // Check if marks are unlocked
    const existing = await Marks.findOne({
      student: studentId,
      mentor:  req.user._id,
    });
    if (existing && !existing.canGiveMark)
      return res.status(403).json({
        success: false,
        message: 'Marks not unlocked yet — application needs full approval first',
      });

    // certificateMarks only count if certificate is verified
    const certVerified = existing?.certificateVerified ?? false;
    const overall = calcOverall(performance, attendance, taskCompletion, communication, certificateMarks, certVerified);
    const grade   = calcGrade(overall);

    const filter = { student: studentId };
    if (internshipId) filter.internship = internshipId;
    else filter.internshipTitle = internshipTitle;

    const marks = await Marks.findOneAndUpdate(
      filter,
      {
        mentor: req.user._id,
        performance, attendance, taskCompletion, communication,
        certificateMarks,
        overall, grade, feedback,
        ...(internshipTitle ? { internshipTitle } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await createNotification(
      studentId,
      'Marks Updated',
      `Your mentor has updated your marks. Overall: ${overall}/100 (${grade}).`,
      'marks',
    );
    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** PUT /api/marks/:id/verify-certificate — mentor verifies completion certificate */
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateMarks = 0, comment } = req.body;

    const marks = await Marks.findById(req.params.id);
    if (!marks) return res.status(404).json({ success: false, message: 'Marks record not found' });
    if (marks.mentor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not your student' });
    if (!marks.completionCertificate)
      return res.status(400).json({ success: false, message: 'No completion certificate uploaded yet' });

    marks.certificateVerified = true;
    marks.certificateMarks    = Math.min(100, Math.max(0, +certificateMarks));

    // Recalculate overall including certificate
    marks.overall = calcOverall(
      marks.performance, marks.attendance,
      marks.taskCompletion, marks.communication,
      marks.certificateMarks, true,
    );
    marks.grade = calcGrade(marks.overall);

    await marks.save();

    // Approve the certificate document
    if (marks.completionCertificate) {
      await Document.findByIdAndUpdate(marks.completionCertificate, {
        status: 'approved',
        reviewedBy: req.user._id,
        comment: comment || 'Completion certificate verified',
        reviewedAt: new Date(),
      });
    }

    await createNotification(
      marks.student,
      'Certificate Verified',
      `Your completion certificate has been verified. Updated overall: ${marks.overall}/100 (${marks.grade}).`,
      'marks',
    );

    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/marks */
// ─────────────────────────────────────────────────────────────────────────────
exports.getMarks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'mentor')  query.mentor  = req.user._id;

    const marks = await Marks.find(query)
      .populate('student',               'name email rollNumber')
      .populate('internship',            'title company')
      .populate('mentor',                'name')
      .populate('completionCertificate', 'title type status filePath')
      .lean();

    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
