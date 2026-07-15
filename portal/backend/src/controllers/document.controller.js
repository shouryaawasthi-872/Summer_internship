const Document = require('../models/Document');
const { createNotification } = require('../utils/helpers');
const User = require('../models/User');

/** POST /api/documents — student uploads */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { title, type } = req.body;
    // Store a relative path so it is always servable via /uploads/documents/<filename>
    // Replace backslashes (Windows) with forward slashes for URL safety.
    const relativePath = `uploads/documents/${req.file.filename}`.replace(/\\/g, '/');
    const doc = await Document.create({
      student:  req.user._id,
      title,
      type,
      filePath:  relativePath,
      fileSize:  req.file.size,
      mimeType:  req.file.mimetype,
    });

    // Notify mentor
    const student = await User.findById(req.user._id);
    if (student.assignedMentor) {
      await createNotification(student.assignedMentor, 'Document Uploaded', `${student.name} uploaded "${title}".`, 'document');
    }

    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/documents */
exports.getDocuments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id);
      query.student = { $in: mentor.assignedStudents };
    }
    const docs = await Document.find(query).populate('student', 'name email').sort('-createdAt').lean();
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/documents/:id/review */
exports.reviewDocument = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const doc = await Document.findByIdAndUpdate(req.params.id,
      { status, comment, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true });
    await createNotification(doc.student, `Document ${status}`, `Your document "${doc.title}" was ${status}. ${comment ? 'Note: ' + comment : ''}`, 'document');
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/documents/:id */
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.student.toString() !== req.user._id.toString() && !['admin','superadmin'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Not authorised' });
    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
