const Application = require('../models/Application');
const Internship  = require('../models/Internship');
const Document    = require('../models/Document');
const Marks       = require('../models/Marks');
const User        = require('../models/User');
const { createNotification, deriveStatus } = require('../utils/helpers');

/** Maximum number of active (non-rejected) applications a student may have */
const MAX_APPLICATIONS = 3;

/**
 * MANDATORY documents required for EVERY application regardless of type.
 * These are matched case-insensitively against Document.type OR Document.title.
 */
const MANDATORY_DOCS = ['noc', 'offer_letter', 'email_screenshot'];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a normalised set of uploaded doc identifiers for a student
// ─────────────────────────────────────────────────────────────────────────────
async function buildDocSet(studentId, submittedDocumentIds = []) {
  // Fetch all docs the student has (pending or approved — we're lenient on status
  // so students can submit without waiting for doc approval first)
  const allDocs = await Document.find({ student: studentId }).lean();

  const set = new Set(
    allDocs.flatMap(d => [
      (d.type  || '').toLowerCase().trim(),
      (d.title || '').toLowerCase().trim(),
    ])
  );

  // Also include any explicitly passed doc IDs (for "just uploaded" docs)
  if (submittedDocumentIds.length) {
    const extra = await Document.find({
      _id: { $in: submittedDocumentIds },
      student: studentId,
    }).lean();
    extra.forEach(d => {
      set.add((d.type  || '').toLowerCase().trim());
      set.add((d.title || '').toLowerCase().trim());
    });
  }

  return set;
}

// ─────────────────────────────────────────────────────────────────────────────
/** POST /api/applications — student applies (portal OR off-campus) */
// ─────────────────────────────────────────────────────────────────────────────
exports.applyInternship = async (req, res) => {
  try {
    const {
      internshipType = 'portal',
      internshipId,
      offCampusDetails,
      coverLetter,
      submittedDocumentIds = [],
    } = req.body;

    const student = await User.findById(req.user._id);

    // ── 1. Application limit ─────────────────────────────────────────────────
    const activeCount = await Application.countDocuments({
      student: req.user._id,
      overallStatus: { $ne: 'rejected' },
    });
    if (activeCount >= MAX_APPLICATIONS)
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum limit of ${MAX_APPLICATIONS} applications.`,
      });

    // ── 2. Portal-specific checks ────────────────────────────────────────────
    let internship = null;
    if (internshipType === 'portal') {
      if (!internshipId)
        return res.status(400).json({ success: false, message: 'internshipId is required for portal applications' });

      internship = await Internship.findById(internshipId);
      if (!internship || internship.status !== 'approved')
        return res.status(400).json({ success: false, message: 'Internship not available or not yet approved' });

      // Duplicate check
      const existing = await Application.findOne({ student: req.user._id, internship: internshipId });
      if (existing)
        return res.status(400).json({ success: false, message: 'You have already applied to this internship' });

      // CGPA eligibility
      if (internship.minCGPA > 0) {
        const cgpa = student.currentCGPA ?? 0;
        if (cgpa < internship.minCGPA)
          return res.status(400).json({
            success: false,
            message: `Your CGPA (${cgpa}) does not meet the minimum requirement of ${internship.minCGPA}.`,
          });
      }
    } else {
      // Off-campus: validate required fields
      if (!offCampusDetails?.companyName || !offCampusDetails?.role)
        return res.status(400).json({
          success: false,
          message: 'Company name and role are required for off-campus applications.',
        });
    }

    // ── 3. Mandatory documents check (applies to BOTH types) ────────────────
    const docSet = await buildDocSet(req.user._id, submittedDocumentIds);
    const missingMandatory = MANDATORY_DOCS.filter(d => !docSet.has(d));
    if (missingMandatory.length > 0)
      return res.status(400).json({
        success: false,
        message: `Missing mandatory documents: ${missingMandatory.map(d => d.replace('_', ' ')).join(', ')}. All applications require NOC, Offer Letter, and Email Screenshot.`,
        missingDocuments: missingMandatory,
      });

    // ── 4. Portal internship-specific required documents ─────────────────────
    if (internshipType === 'portal' && internship?.requiredDocuments?.length > 0) {
      const missing = internship.requiredDocuments.filter(r => !docSet.has(r.toLowerCase().trim()));
      if (missing.length > 0)
        return res.status(400).json({
          success: false,
          message: `Missing required documents: ${missing.join(', ')}.`,
          missingDocuments: missing,
        });
    }

    // ── 5. Collect all submitted doc IDs ────────────────────────────────────
    const allSubmittedIds = Array.isArray(submittedDocumentIds) ? submittedDocumentIds : [];

    // ── 6. Create application ────────────────────────────────────────────────
    const appData = {
      student:            req.user._id,
      internshipType,
      coverLetter,
      submittedDocuments: allSubmittedIds,
      cgpaAtApplication:  student.currentCGPA ?? null,
    };

    if (internshipType === 'portal') {
      appData.internship = internshipId;
    } else {
      appData.offCampusDetails = offCampusDetails;
    }

    const app = await Application.create(appData);

    // ── 7. Notify assigned mentor ────────────────────────────────────────────
    if (student.assignedMentor) {
      const label = internshipType === 'portal'
        ? `"${internship.title}"`
        : `off-campus internship at "${offCampusDetails.companyName}"`;
      await createNotification(
        student.assignedMentor,
        'New Application',
        `${student.name} applied for ${label}. Please review.`,
        'application',
        `/applications/${app._id}`,
      );
    }

    res.status(201).json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/applications — role-filtered list */
// ─────────────────────────────────────────────────────────────────────────────
exports.getApplications = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id);
      query.student = { $in: mentor.assignedStudents };
    }
    if (req.query.status) query.overallStatus = req.query.status;
    if (req.query.type)   query.internshipType = req.query.type;

    const apps = await Application.find(query)
      .populate('student',     'name email rollNumber branch currentCGPA')
      .populate('internship',  'title company minCGPA requiredDocuments')
      .populate('submittedDocuments', 'title type status filePath')
      .populate('completionCertificate', 'title type status filePath')
      .populate('mentorApproval.reviewedBy',     'name')
      .populate('adminApproval.reviewedBy',      'name')
      .populate('superAdminApproval.reviewedBy', 'name')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/applications/:id */
// ─────────────────────────────────────────────────────────────────────────────
exports.getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('student',    'name email rollNumber branch semester phone currentCGPA')
      .populate('internship')
      .populate('submittedDocuments', 'title type status filePath mimeType')
      .populate('completionCertificate', 'title type status filePath mimeType')
      .populate('mentorApproval.reviewedBy',     'name role')
      .populate('adminApproval.reviewedBy',      'name role')
      .populate('superAdminApproval.reviewedBy', 'name role');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** PUT /api/applications/:id/review — mentor / admin / superadmin review */
// ─────────────────────────────────────────────────────────────────────────────
exports.reviewApplication = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const role = req.user.role;
    const app  = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const reviewData = { status, comment, reviewedBy: req.user._id, reviewedAt: new Date() };

    if (role === 'mentor') {
      if (app.overallStatus !== 'submitted')
        return res.status(400).json({ success: false, message: 'Already reviewed by mentor' });
      app.mentorApproval = reviewData;
    } else if (role === 'admin') {
      if (app.overallStatus !== 'mentor_approved')
        return res.status(400).json({ success: false, message: 'Mentor approval required first' });
      app.adminApproval = reviewData;
    } else if (role === 'superadmin') {
      if (app.overallStatus !== 'admin_approved')
        return res.status(400).json({ success: false, message: 'Admin approval required first' });
      app.superAdminApproval = reviewData;
    } else {
      return res.status(403).json({ success: false, message: 'Not authorised to review' });
    }

    app.overallStatus = deriveStatus(app);
    await app.save();

    // Notify student
    const nextStep = role === 'mentor' ? 'Admin' : 'Super Admin';
    const msg = status === 'approved'
      ? `Your application was approved by ${role}.${role !== 'superadmin' ? ` Next: ${nextStep} review.` : ' Fully approved!'}`
      : `Your application was rejected by ${role}. Reason: ${comment || 'N/A'}`;
    await createNotification(app.student, 'Application Update', msg, 'application', `/applications/${app._id}`);

    // Unlock marks when fully approved
    if (app.overallStatus === 'fully_approved') {
      const [internship, student] = await Promise.all([
        app.internship ? Internship.findById(app.internship) : null,
        User.findById(app.student),
      ]);
      if (student?.assignedMentor) {
        const title = internship?.title || app.offCampusDetails?.companyName || 'Internship';
        await Marks.findOneAndUpdate(
          { student: app.student, ...(app.internship ? { internship: app.internship } : { internshipTitle: title }) },
          {
            mentor: student.assignedMentor,
            canGiveMark: true,
            ...(app.internship ? {} : { internshipTitle: title }),
          },
          { upsert: true, new: true },
        );
        await createNotification(
          student.assignedMentor,
          'Marks Unlocked',
          `You can now give marks to ${student.name} for "${title}".`,
          'marks',
        );
      }
    }

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** PUT /api/applications/:id/certificate — student uploads completion certificate */
// ─────────────────────────────────────────────────────────────────────────────
exports.submitCertificate = async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId)
      return res.status(400).json({ success: false, message: 'documentId is required' });

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    // Only the owning student can submit
    if (app.student.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not your application' });

    if (app.overallStatus !== 'fully_approved')
      return res.status(400).json({ success: false, message: 'Internship must be fully approved before uploading completion certificate' });

    // Verify the document belongs to this student and is of correct type
    const doc = await Document.findOne({
      _id: documentId,
      student: req.user._id,
      type: 'completion_certificate',
    });
    if (!doc)
      return res.status(400).json({ success: false, message: 'Document not found or not a completion certificate' });

    app.completionCertificate = documentId;
    await app.save();

    // Link certificate to marks record
    const student = await User.findById(req.user._id);
    if (student?.assignedMentor) {
      const title = app.offCampusDetails?.companyName;
      await Marks.findOneAndUpdate(
        { student: app.student, ...(app.internship ? { internship: app.internship } : { internshipTitle: title }) },
        { completionCertificate: documentId },
        { new: true },
      );
      await createNotification(
        student.assignedMentor,
        'Completion Certificate Uploaded',
        `${student.name} has uploaded their internship completion certificate. Please review and update marks.`,
        'marks',
        `/applications/${app._id}`,
      );
    }

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
