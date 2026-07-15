import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { internshipsAPI, applicationsAPI, documentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDate } from '../../utils/helpers';
import { KR_COLORS } from '../../utils/constants';
import {
  HiOutlineLocationMarker, HiOutlineClock, HiArrowLeft,
  HiOutlineOfficeBuilding, HiOutlineAcademicCap, HiOutlineDocumentText,
  HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineBan,
  HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineUsers,
} from 'react-icons/hi';

// ── helpers ───────────────────────────────────────────────────────────────────
/**
 * Check whether a student's uploaded documents satisfy an internship's
 * requiredDocuments list.  Matches on doc.type OR doc.title (case-insensitive).
 */
const checkDocsCoverage = (requiredDocs, uploadedDocs) => {
  if (!requiredDocs || requiredDocs.length === 0) return { missing: [], satisfied: true };

  const uploadedSet = new Set(
    uploadedDocs.flatMap(d => [
      (d.type  || '').toLowerCase().trim(),
      (d.title || '').toLowerCase().trim(),
    ])
  );

  const missing = requiredDocs.filter(r => !uploadedSet.has(r.toLowerCase().trim()));
  return { missing, satisfied: missing.length === 0 };
};

export default function InternshipDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [internship,    setInternship]    = useState(null);
  const [myDocs,        setMyDocs]        = useState([]);    // student's own documents
  const [myApps,        setMyApps]        = useState([]);    // student's existing applications
  const [loading,       setLoading]       = useState(true);
  const [applyModal,    setApplyModal]    = useState(false);
  const [coverLetter,   setCoverLetter]   = useState('');
  const [applying,      setApplying]      = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [approvalForm,  setApprovalForm]  = useState({ status: 'approved', comment: '' });

  useEffect(() => {
    const fetches = [internshipsAPI.getById(id)];
    if (user?.role === 'student') {
      fetches.push(documentsAPI.getAll());
      fetches.push(applicationsAPI.getAll());
    }
    Promise.all(fetches)
      .then(([iRes, dRes, aRes]) => {
        setInternship(iRes.data.internship);
        if (dRes) setMyDocs(dRes.data.documents || []);
        if (aRes) setMyApps(aRes.data.applications || []);
      })
      .finally(() => setLoading(false));
  }, [id, user?.role]);

  // ── derived state ─────────────────────────────────────────────────────────
  const alreadyApplied = myApps.some(a => a.internship?._id === id || a.internship === id);
  const activeApps     = myApps.filter(a => a.overallStatus !== 'rejected').length;
  const atLimit        = activeApps >= 3;

  const cgpaMet = !internship?.minCGPA || internship.minCGPA === 0
    || (user?.currentCGPA ?? 0) >= internship.minCGPA;

  const { missing: missingDocs, satisfied: docsSatisfied } =
    checkDocsCoverage(internship?.requiredDocuments, myDocs);

  // IDs of docs that cover requirements (to send as submittedDocumentIds)
  const coveringDocIds = internship?.requiredDocuments
    ? myDocs
        .filter(d => {
          const t  = (d.type  || '').toLowerCase().trim();
          const ti = (d.title || '').toLowerCase().trim();
          return internship.requiredDocuments.some(
            r => r.toLowerCase().trim() === t || r.toLowerCase().trim() === ti
          );
        })
        .map(d => d._id)
    : [];

  const canApply = user?.role === 'student'
    && internship?.status === 'approved'
    && !alreadyApplied
    && !atLimit
    && cgpaMet
    && docsSatisfied;

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsAPI.apply({
        internshipId:        id,
        coverLetter,
        submittedDocumentIds: coveringDocIds,
      });
      toast.success('Application submitted successfully!');
      setApplyModal(false);
      // Refresh application list
      applicationsAPI.getAll().then(r => setMyApps(r.data.applications || []));
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setApplying(false);
    }
  };

  const handleApproval = async (e) => {
    e.preventDefault();
    try {
      await internshipsAPI.approve(id, approvalForm);
      toast.success(`Internship ${approvalForm.status}`);
      setApprovalModal(false);
      internshipsAPI.getById(id).then(r => setInternship(r.data.internship));
    } catch (err) {
      toast.error(getErrorMsg(err)); }
  };

  if (loading) return <Spinner />;
  if (!internship) return <p className="text-center text-gray-400 mt-12">Internship not found.</p>;

  return (
    <div className="max-w-3xl space-y-5">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: KR_COLORS.blue }}>
        <HiArrowLeft /> Back to Internships
      </button>

      {/* ── Hero card ── */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl text-white text-xl font-bold flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
              {internship.company?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: KR_COLORS.blue }}>
                {internship.title}
              </h1>
              <p className="text-gray-500">{internship.company}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {user?.role === 'student' && internship.status === 'approved' && (
              <>
                {alreadyApplied ? (
                  <span className="badge-approved">Applied ✓</span>
                ) : atLimit ? (
                  <span className="badge-rejected text-xs">3-app limit reached</span>
                ) : (
                  <button
                    className={canApply ? 'btn-kr-red' : 'btn-secondary cursor-not-allowed'}
                    onClick={() => canApply && setApplyModal(true)}
                    title={!cgpaMet ? `Requires CGPA ≥ ${internship.minCGPA}` : !docsSatisfied ? 'Upload required documents first' : ''}
                  >
                    {canApply ? 'Apply Now' : (!cgpaMet ? 'CGPA too low' : 'Docs missing')}
                  </button>
                )}
              </>
            )}
            {['admin', 'superadmin'].includes(user?.role) && internship.status === 'pending' && (
              <button className="btn-primary" onClick={() => setApprovalModal(true)}>
                Review Internship
              </button>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-500"
          style={{ borderTop: '1px solid rgba(0,48,135,0.08)', paddingTop: '1rem' }}>
          <span className="flex items-center gap-1.5">
            <HiOutlineLocationMarker style={{ color: KR_COLORS.blue }} />
            {internship.location}
          </span>
          {internship.duration && (
            <span className="flex items-center gap-1.5">
              <HiOutlineClock style={{ color: KR_COLORS.blue }} />
              {internship.duration}
            </span>
          )}
          {internship.stipend && (
            <span className="flex items-center gap-1.5">
              <HiOutlineCurrencyRupee style={{ color: KR_COLORS.blue }} />
              {internship.stipend}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <HiOutlineUsers style={{ color: KR_COLORS.blue }} />
            {internship.seats} seats
          </span>
          {internship.lastDate && (
            <span className="flex items-center gap-1.5">
              <HiOutlineCalendar style={{ color: KR_COLORS.blue }} />
              Last date: {fmtDate(internship.lastDate)}
            </span>
          )}
        </div>
      </div>

      {/* ── NEW: CGPA & eligibility info card ── */}
      {(internship.minCGPA > 0 || internship.requiredDocuments?.length > 0) && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Eligibility Requirements</h3>

          {/* CGPA requirement */}
          {internship.minCGPA > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,48,135,0.08)' }}>
                <HiOutlineAcademicCap style={{ color: KR_COLORS.blue }} className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Minimum CGPA: {internship.minCGPA}
                </p>
                {user?.role === 'student' && (
                  <div className="flex items-center gap-2 mt-1">
                    {cgpaMet ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <HiOutlineCheckCircle className="text-base" />
                        Your CGPA ({user.currentCGPA ?? 'N/A'}) meets the requirement
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: KR_COLORS.red }}>
                        <HiOutlineBan className="text-base" />
                        Your CGPA ({user.currentCGPA ?? 'N/A'}) is below the requirement — contact your mentor
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Required documents */}
          {internship.requiredDocuments?.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(200,16,46,0.07)' }}>
                <HiOutlineDocumentText style={{ color: KR_COLORS.red }} className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Required Documents ({internship.requiredDocuments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {internship.requiredDocuments.map(doc => {
                    const uploaded = user?.role === 'student' && myDocs.some(d =>
                      (d.type?.toLowerCase().trim() === doc.toLowerCase().trim()) ||
                      (d.title?.toLowerCase().trim() === doc.toLowerCase().trim())
                    );
                    return (
                      <span key={doc}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          user?.role !== 'student'
                            ? { background: 'rgba(0,48,135,0.08)', color: KR_COLORS.blue }
                            : uploaded
                              ? { background: 'rgba(5,150,105,0.10)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }
                              : { background: 'rgba(200,16,46,0.08)', color: KR_COLORS.red, border: '1px solid rgba(200,16,46,0.20)' }
                        }>
                        {user?.role === 'student' && (uploaded
                          ? <HiOutlineCheckCircle className="text-sm" />
                          : <HiOutlineExclamationCircle className="text-sm" />
                        )}
                        {doc.replace(/_/g, ' ')}
                      </span>
                    );
                  })}
                </div>

                {/* Student — missing docs CTA */}
                {user?.role === 'student' && missingDocs.length > 0 && (
                  <div className="mt-3 rounded-lg px-3 py-2 text-xs flex items-center gap-2"
                    style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)' }}>
                    <HiOutlineExclamationCircle style={{ color: KR_COLORS.red }} className="flex-shrink-0 text-base" />
                    <span style={{ color: KR_COLORS.red }}>
                      Missing: <strong>{missingDocs.join(', ')}</strong>.{' '}
                    </span>
                    <Link to="/documents" className="underline font-semibold" style={{ color: KR_COLORS.blue }}>
                      Upload now →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Application limit warning ── */}
      {user?.role === 'student' && !alreadyApplied && atLimit && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)' }}>
          <HiOutlineExclamationCircle style={{ color: KR_COLORS.red }} className="text-xl flex-shrink-0" />
          <p style={{ color: KR_COLORS.red }}>
            You have reached the <strong>3 application limit</strong>. You can apply to more internships
            only after one of your current applications is rejected.
          </p>
        </div>
      )}

      {/* ── Description ── */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-3">About the Internship</h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
          {internship.description}
        </p>
      </div>

      {/* ── Skills ── */}
      {internship.skills?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {internship.skills.map(s => (
              <span key={s}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: 'rgba(0,48,135,0.07)', color: KR_COLORS.blue }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Apply Modal ── */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title="Apply for Internship">
        <form onSubmit={handleApply} className="space-y-4">
          {/* Doc checklist summary */}
          {internship.requiredDocuments?.length > 0 && (
            <div className="rounded-lg px-3 py-2.5 space-y-1"
              style={{ background: 'rgba(0,48,135,0.05)', border: '1px solid rgba(0,48,135,0.10)' }}>
              <p className="text-xs font-bold text-gray-600 mb-1.5">Documents being submitted:</p>
              {internship.requiredDocuments.map(doc => {
                const d = myDocs.find(d =>
                  d.type?.toLowerCase().trim()  === doc.toLowerCase().trim() ||
                  d.title?.toLowerCase().trim() === doc.toLowerCase().trim()
                );
                return (
                  <div key={doc} className="flex items-center gap-2 text-xs">
                    <HiOutlineCheckCircle className="text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">{doc.replace(/_/g,' ')}</span>
                    {d && <span className="text-gray-400">— {d.title}</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cover Letter <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea className="input-field" rows={5} value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Why are you interested in this internship?" />
          </div>

          {/* App limit info */}
          <p className="text-xs text-gray-400">
            You have used <strong>{activeApps}/3</strong> application slots.
            After this you'll have {2 - activeApps} remaining.
          </p>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setApplyModal(false)}>Cancel</button>
            <button type="submit" className="btn-kr-red" disabled={applying}>
              {applying ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Approval Modal (admin/superadmin) ── */}
      <Modal open={approvalModal} onClose={() => setApprovalModal(false)} title="Review Internship">
        <form onSubmit={handleApproval} className="space-y-4">
          <div className="flex gap-3">
            {['approved', 'rejected'].map(s => (
              <button key={s} type="button"
                onClick={() => setApprovalForm({ ...approvalForm, status: s })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition ${
                  approvalForm.status === s
                    ? s === 'approved' ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'text-white border-transparent'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                style={approvalForm.status === s && s === 'rejected'
                  ? { background: KR_COLORS.red, borderColor: KR_COLORS.red } : {}}>
                {s === 'approved' ? '✓ Approve' : '✗ Reject'}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
            <textarea className="input-field" rows={3} value={approvalForm.comment}
              onChange={e => setApprovalForm({ ...approvalForm, comment: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setApprovalModal(false)}>Cancel</button>
            <button type="submit"
              className={approvalForm.status === 'approved' ? 'btn-success' : 'btn-danger'}>
              Confirm {approvalForm.status}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
