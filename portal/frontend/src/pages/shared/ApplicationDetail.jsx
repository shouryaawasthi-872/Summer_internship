import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ApprovalPipeline from '../../components/common/ApprovalPipeline';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDate } from '../../utils/helpers';
import { STATUS_BADGE, STATUS_LABELS, KR_COLORS } from '../../utils/constants';
import {
  HiArrowLeft, HiOutlineFolder, HiOutlineEye,
  HiOutlineAcademicCap, HiOutlineDocumentText,
} from 'react-icons/hi';

export default function ApplicationDetail() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [app,        setApp]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [form,       setForm]       = useState({ status: 'approved', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    applicationsAPI
      .getById(id)
      .then(r => setApp(r.data.application))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  /** True when this user's role is the next one in the pipeline */
  const canReview = () => {
    if (!app) return false;
    if (user.role === 'mentor'     && app.overallStatus === 'submitted')       return true;
    if (user.role === 'admin'      && app.overallStatus === 'mentor_approved') return true;
    if (user.role === 'superadmin' && app.overallStatus === 'admin_approved')  return true;
    return false;
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applicationsAPI.review(id, form);
      toast.success(`Application ${form.status}`);
      setReviewModal(false);
      load();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!app)    return <p className="text-gray-400 text-center mt-12">Application not found</p>;

  return (
    <div className="max-w-3xl space-y-5">

      {/* ── Back ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: KR_COLORS.blue }}
      >
        <HiArrowLeft /> Back to Applications
      </button>

      {/* ── Header ── */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{app.internship?.title}</h1>
            <p className="text-gray-500 text-sm">{app.internship?.company}</p>
            <p className="text-xs text-gray-400 mt-1">Applied on {fmtDate(app.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm ${STATUS_BADGE[app.overallStatus]}`}>
              {STATUS_LABELS[app.overallStatus]}
            </span>
            {canReview() && (
              <button
                className="btn-primary text-sm"
                onClick={() => setReviewModal(true)}
              >
                Review Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Approval Pipeline ── */}
      <ApprovalPipeline application={app} />

      {/* ── Student Details ── */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Student Details</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Name</span>
            <p className="font-medium text-gray-900 mt-0.5">{app.student?.name}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Email</span>
            <p className="font-medium text-gray-900 mt-0.5">{app.student?.email}</p>
          </div>
          {app.student?.rollNumber && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Roll No</span>
              <p className="font-medium text-gray-900 mt-0.5">{app.student.rollNumber}</p>
            </div>
          )}
          {app.student?.branch && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Branch</span>
              <p className="font-medium text-gray-900 mt-0.5">{app.student.branch}</p>
            </div>
          )}
          {app.student?.semester && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Semester</span>
              <p className="font-medium text-gray-900 mt-0.5">{app.student.semester}</p>
            </div>
          )}
          {/* CGPA snapshot at time of application */}
          {app.cgpaAtApplication != null && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">CGPA at Application</span>
              <p className="font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                <HiOutlineAcademicCap style={{ color: KR_COLORS.blue }} />
                {Number(app.cgpaAtApplication).toFixed(2)}
              </p>
            </div>
          )}
          {/* Minimum required CGPA from internship */}
          {app.internship?.minCGPA > 0 && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Min. CGPA Required</span>
              <p className="font-medium text-gray-900 mt-0.5">{app.internship.minCGPA}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Submitted Documents ── */}
      {app.submittedDocuments?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HiOutlineDocumentText style={{ color: KR_COLORS.blue }} className="text-xl" />
            Submitted Documents
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,48,135,0.08)', color: KR_COLORS.blue }}
            >
              {app.submittedDocuments.length}
            </span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {app.submittedDocuments.map(doc => (
              <div
                key={doc._id}
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: 'rgba(0,48,135,0.04)', border: '1px solid rgba(0,48,135,0.09)' }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,48,135,0.08)' }}
                >
                  <HiOutlineFolder style={{ color: KR_COLORS.blue }} className="text-lg" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {doc.title || doc.type || 'Document'}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {(doc.type || '').replace(/_/g, ' ')}
                    {doc.status && (
                      <span
                        className={`ml-2 font-semibold ${
                          doc.status === 'approved'
                            ? 'text-emerald-600'
                            : doc.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}
                      >
                        · {doc.status}
                      </span>
                    )}
                  </p>
                </div>

                {/* View link */}
                {doc.filePath && (
                  <a
                    href={`/${(doc.filePath || '').replace(/\\/g, '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                    title="View document"
                    style={{ color: KR_COLORS.blue }}
                  >
                    <HiOutlineEye className="text-base" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Required-docs reminder */}
          {app.internship?.requiredDocuments?.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              This internship required:{' '}
              <span className="font-semibold text-gray-600">
                {app.internship.requiredDocuments.join(', ')}
              </span>
            </p>
          )}
        </div>
      )}

      {/* ── Cover Letter ── */}
      {app.coverLetter && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {app.coverLetter}
          </p>
        </div>
      )}

      {/* ── Review Modal ── */}
      <Modal
        open={reviewModal}
        onClose={() => setReviewModal(false)}
        title="Review Application"
      >
        <form onSubmit={handleReview} className="space-y-4">
          {/* Approve / Reject toggle */}
          <div className="flex gap-3">
            {['approved', 'rejected'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition
                  ${form.status === s
                    ? s === 'approved'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {s === 'approved' ? '✓ Approve' : '✗ Reject'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              placeholder="Add a comment for the student..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setReviewModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={form.status === 'approved' ? 'btn-success' : 'btn-danger'}
            >
              {submitting ? 'Submitting...' : `Confirm ${form.status}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
