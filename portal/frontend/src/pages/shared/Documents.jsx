import { useEffect, useState, useRef } from 'react';
import { documentsAPI, applicationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDate } from '../../utils/helpers';
import { STATUS_BADGE, STATUS_LABELS, KR_COLORS } from '../../utils/constants';
import {
  HiOutlineFolder, HiOutlinePlus, HiOutlineTrash, HiOutlineEye,
  HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineDocumentText,
  HiOutlineInformationCircle, HiOutlineExclamationCircle,
} from 'react-icons/hi';

/* All document types (matches backend Document.js enum) */
const DOC_TYPES = [
  { value: 'resume',                 label: 'Resume / CV' },
  { value: 'id_proof',               label: 'ID Proof' },
  { value: 'marksheet',              label: 'Marksheet' },
  { value: 'noc',                    label: 'NOC (No Objection Certificate)' },
  { value: 'offer_letter',           label: 'Offer Letter' },
  { value: 'email_screenshot',       label: 'Email Screenshot' },
  { value: 'completion_certificate', label: 'Completion Certificate' },
  { value: 'certificate',            label: 'Other Certificate' },
  { value: 'other',                  label: 'Other' },
];

/* Mandatory docs — highlighted with special styling */
const MANDATORY_KEYS = ['noc', 'offer_letter', 'email_screenshot'];

/* Icon colour by type */
const typeColor = (type) => {
  if (type === 'noc')                    return { bg: 'bg-amber-50',   icon: 'text-amber-500' };
  if (type === 'offer_letter')           return { bg: 'bg-blue-50',    icon: 'text-blue-500'  };
  if (type === 'email_screenshot')       return { bg: 'bg-purple-50',  icon: 'text-purple-500'};
  if (type === 'completion_certificate') return { bg: 'bg-emerald-50', icon: 'text-emerald-600'};
  return { bg: 'bg-gray-50', icon: 'text-gray-400' };
};

export default function Documents() {
  const { user }    = useAuth();
  const fileRef     = useRef();

  const [docs,        setDocs]        = useState([]);
  const [myApps,      setMyApps]      = useState([]); // approved applications for cert linking
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [certModal,   setCertModal]   = useState(false); // completion certificate upload
  const [form,        setForm]        = useState({ title: '', type: 'resume', file: null });
  const [certForm,    setCertForm]    = useState({ title: '', applicationId: '', file: null });
  const [reviewForm,  setReviewForm]  = useState({ status: 'approved', comment: '' });
  const [submitting,  setSubmitting]  = useState(false);
  const [filter,      setFilter]      = useState('all');

  const canReview = ['mentor', 'admin', 'superadmin'].includes(user?.role);

  const load = () => {
    setError(null);
    const calls = [documentsAPI.getAll()];
    if (user?.role === 'student') calls.push(applicationsAPI.getAll());
    Promise.all(calls)
      .then(([d, a]) => {
        setDocs(d.data.documents || []);
        if (a) setMyApps((a.data.applications || []).filter(ap => ap.overallStatus === 'fully_approved'));
      })
      .catch(err => setError(getErrorMsg(err)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  /* Upload regular document */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) return toast.error('Select a file');
    const fd = new FormData();
    fd.append('title', form.title || form.type.replace(/_/g, ' '));
    fd.append('type',  form.type);
    fd.append('file',  form.file);
    setSubmitting(true);
    try {
      await documentsAPI.upload(fd);
      toast.success('Document uploaded!');
      setUploadModal(false);
      setForm({ title: '', type: 'resume', file: null });
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  /* Upload completion certificate + link to application */
  const handleCertUpload = async (e) => {
    e.preventDefault();
    if (!certForm.file) return toast.error('Select a file');
    if (!certForm.applicationId) return toast.error('Select the internship this certificate belongs to');
    setSubmitting(true);
    try {
      // 1. Upload the doc
      const fd = new FormData();
      fd.append('title', certForm.title || 'Completion Certificate');
      fd.append('type',  'completion_certificate');
      fd.append('file',  certForm.file);
      const { data: docData } = await documentsAPI.upload(fd);

      // 2. Link to application
      await applicationsAPI.submitCertificate(certForm.applicationId, { documentId: docData.document._id });

      toast.success('Completion certificate uploaded and linked to your internship!');
      setCertModal(false);
      setCertForm({ title: '', applicationId: '', file: null });
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await documentsAPI.review(reviewModal._id, reviewForm);
      toast.success(`Document ${reviewForm.status}`);
      setReviewModal(null);
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try { await documentsAPI.remove(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(getErrorMsg(err)); }
  };

  /* Filtered docs */
  const displayed = filter === 'all' ? docs
    : filter === 'mandatory' ? docs.filter(d => MANDATORY_KEYS.includes(d.type))
    : filter === 'certificate' ? docs.filter(d => d.type === 'completion_certificate')
    : docs.filter(d => d.type === filter);

  /* Mandatory doc status for student */
  const docSet = new Set(docs.flatMap(d => [(d.type || '').toLowerCase(), (d.title || '').toLowerCase()]));
  const mandatoryComplete = MANDATORY_KEYS.every(k => docSet.has(k));

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Documents</h1>
          {user?.role === 'student' && (
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your documents · Mandatory: NOC, Offer Letter, Email Screenshot
            </p>
          )}
        </div>
        {user?.role === 'student' && (
          <div className="flex gap-2">
            <button onClick={() => setCertModal(true)} className="btn-secondary flex items-center gap-2 text-sm"
              style={{ borderColor: '#059669', color: '#059669' }}>
              <HiOutlineAcademicCap /> Upload Certificate
            </button>
            <button onClick={() => setUploadModal(true)} className="btn-primary flex items-center gap-2">
              <HiOutlinePlus /> Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Mandatory docs banner for students */}
      {user?.role === 'student' && (
        <div className="rounded-xl p-4"
          style={{
            background: mandatoryComplete ? 'rgba(5,150,105,0.05)' : 'rgba(200,16,46,0.05)',
            border: `1px solid ${mandatoryComplete ? 'rgba(5,150,105,0.20)' : 'rgba(200,16,46,0.18)'}`,
          }}>
          <div className="flex items-start gap-3">
            {mandatoryComplete
              ? <HiOutlineCheckCircle className="text-xl flex-shrink-0 text-emerald-500 mt-0.5" />
              : <HiOutlineInformationCircle className="text-xl flex-shrink-0 mt-0.5" style={{ color: KR_COLORS.red }} />
            }
            <div>
              <p className="text-sm font-bold" style={{ color: mandatoryComplete ? '#059669' : KR_COLORS.red }}>
                {mandatoryComplete ? 'All mandatory documents uploaded ✓' : 'Mandatory documents required for all internship applications'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {MANDATORY_KEYS.map(k => {
                  const has = docSet.has(k);
                  return (
                    <span key={k} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={has
                        ? { background: 'rgba(5,150,105,0.10)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }
                        : { background: 'rgba(200,16,46,0.08)', color: KR_COLORS.red, border: '1px solid rgba(200,16,46,0.20)' }
                      }>
                      {has ? <HiOutlineCheckCircle /> : '○'}
                      {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Checklist Panel (students only) ── */}
      {user?.role === 'student' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)', background: 'rgba(0,48,135,0.02)' }}>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <HiOutlineDocumentText style={{ color: KR_COLORS.blue }} className="text-lg" />
              Document Checklist
            </h3>
            <span className="text-xs text-gray-400">Required for all internship types</span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>

            {/* Group 1 — Mandatory for EVERY application */}
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
                style={{ color: KR_COLORS.red }}>
                ★ Mandatory — Required before any application (portal or off-campus)
              </p>
              <div className="space-y-2">
                {[
                  { key: 'noc',              label: 'NOC',              desc: 'No Objection Certificate from the university — must be obtained from your department before any internship.' },
                  { key: 'offer_letter',     label: 'Offer Letter',     desc: 'Official offer letter from the company confirming your role, duration and stipend.' },
                  { key: 'email_screenshot', label: 'Email Screenshot', desc: 'Screenshot of the official offer / joining email received from the company.' },
                ].map(item => {
                  const has = docSet.has(item.key);
                  return (
                    <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg"
                      style={{
                        background: has ? 'rgba(5,150,105,0.05)' : 'rgba(200,16,46,0.04)',
                        border: `1px solid ${has ? 'rgba(5,150,105,0.18)' : 'rgba(200,16,46,0.16)'}`,
                      }}>
                      {has
                        ? <HiOutlineCheckCircle className="text-lg flex-shrink-0 mt-0.5 text-emerald-500" />
                        : <HiOutlineExclamationCircle className="text-lg flex-shrink-0 mt-0.5" style={{ color: KR_COLORS.red }} />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: has ? '#059669' : KR_COLORS.red }}>
                          {item.label}
                          {!has && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ background: KR_COLORS.red }}>REQUIRED</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                      {!has && (
                        <button
                          onClick={() => { setForm({ title: item.label, type: item.key, file: null }); setUploadModal(true); }}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                          style={{ background: 'rgba(200,16,46,0.10)', color: KR_COLORS.red, border: '1px solid rgba(200,16,46,0.20)' }}>
                          Upload
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 2 — Completion certificate */}
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 text-emerald-700">
                ✦ On Completion — Upload after finishing your internship (counts toward marks)
              </p>
              <div className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.16)' }}>
                <HiOutlineAcademicCap className="text-lg flex-shrink-0 mt-0.5 text-emerald-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-800">Completion Certificate</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Certificate issued by the company after you complete your internship.
                    Your mentor verifies it — it becomes the <strong>5th component</strong> in your
                    marks calculation alongside performance, attendance, task completion &amp; communication.
                  </p>
                </div>
                <button
                  onClick={() => setCertModal(true)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 text-white"
                  style={{ background: '#059669' }}>
                  Upload
                </button>
              </div>
            </div>

            {/* Group 3 — Other / optional */}
            <div className="px-5 py-3 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 text-gray-400">
                Optional — Additional documents you may upload
              </p>
              <div className="flex flex-wrap gap-2">
                {['Resume / CV', 'ID Proof', 'Marksheet', 'Other Certificate', 'Other'].map(label => (
                  <span key={label}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'rgba(0,48,135,0.07)', color: KR_COLORS.blue }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',         label: 'All' },
          { key: 'mandatory',   label: 'Mandatory' },
          { key: 'certificate', label: 'Completion Certificates' },
          { key: 'resume',      label: 'Resume' },
          { key: 'marksheet',   label: 'Marksheets' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={filter === f.key
              ? { background: KR_COLORS.blue, color: '#fff' }
              : { background: 'rgba(0,48,135,0.07)', color: KR_COLORS.blue }
            }>
            {f.label}
          </button>
        ))}
      </div>

      {/* Document grid */}
      {loading ? (
        <SkeletonGrid count={6} rows={3} />
      ) : error ? (
        <div className="card p-8 text-center text-red-500">
          <p className="font-medium">Failed to load documents</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
          <button className="btn-secondary text-sm mt-3" onClick={load}>Retry</button>
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState icon={HiOutlineFolder} title="No documents"
          description={user?.role === 'student'
            ? 'Upload your NOC, Offer Letter, Email Screenshot and other required documents.'
            : 'No documents uploaded by students yet.'} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(doc => {
            const isMandatory = MANDATORY_KEYS.includes(doc.type);
            const isCert      = doc.type === 'completion_certificate';
            const { bg, icon } = typeColor(doc.type);
            return (
              <div key={doc._id} className="card p-4"
                style={isMandatory ? { borderTop: `3px solid ${KR_COLORS.red}` }
                     : isCert      ? { borderTop: '3px solid #059669' }
                     : {}}>
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    {isCert
                      ? <HiOutlineAcademicCap className={`text-xl ${icon}`} />
                      : <HiOutlineFolder      className={`text-xl ${icon}`} />
                    }
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={STATUS_BADGE[doc.status] || 'badge-pending'}>
                      {STATUS_LABELS[doc.status] || doc.status}
                    </span>
                    {isMandatory && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ background: KR_COLORS.red }}>
                        MANDATORY
                      </span>
                    )}
                    {isCert && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-emerald-600">
                        CERTIFICATE
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {DOC_TYPES.find(t => t.value === doc.type)?.label || doc.type.replace(/_/g, ' ')}
                  {' · '}{fmtDate(doc.createdAt)}
                </p>
                {doc.student && <p className="text-xs text-gray-400 mt-1">By: {doc.student.name}</p>}
                {doc.comment && <p className="text-xs text-gray-500 mt-1 italic">"{doc.comment}"</p>}
                <div className="flex gap-2 mt-3">
                  <a href={`/${(doc.filePath || '').replace(/\\/g, '/')}`} target="_blank" rel="noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1 py-1 px-2.5">
                    <HiOutlineEye /> View
                  </a>
                  {canReview && doc.status === 'pending' && (
                    <button onClick={() => { setReviewModal(doc); setReviewForm({ status: 'approved', comment: '' }); }}
                      className="btn-primary text-xs py-1 px-2.5">Review</button>
                  )}
                  {user?.role === 'student' && (
                    <button onClick={() => handleDelete(doc._id)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2 ml-auto">
                      <HiOutlineTrash />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Upload Regular Document Modal ── */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type *</label>
            <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {DOC_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}{MANDATORY_KEYS.includes(t.value) ? ' ⭐ Mandatory' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input className="input-field" value={form.title}
              placeholder={form.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">File (PDF/DOC/JPG/PNG, max 5MB) *</label>
            <input type="file" ref={fileRef} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="input-field file:mr-2 file:border-0 file:bg-primary-50 file:text-primary-700 file:px-3 file:py-1 file:rounded file:text-xs file:font-medium"
              onChange={e => setForm({ ...form, file: e.target.files[0] })} required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setUploadModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Uploading…' : 'Upload'}</button>
          </div>
        </form>
      </Modal>

      {/* ── Upload Completion Certificate Modal ── */}
      <Modal open={certModal} onClose={() => setCertModal(false)} title="Upload Completion Certificate">
        <form onSubmit={handleCertUpload} className="space-y-4">
          <div className="rounded-lg px-3 py-2.5 text-xs flex items-start gap-2"
            style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.20)' }}>
            <HiOutlineAcademicCap className="text-lg flex-shrink-0 mt-0.5 text-emerald-600" />
            <p className="text-emerald-800 leading-relaxed">
              Upload the <strong>completion certificate</strong> issued by the company after finishing your internship.
              Your mentor will verify it and include it in your final marks calculation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link to Internship *</label>
            <select className="input-field" value={certForm.applicationId} required
              onChange={e => setCertForm({ ...certForm, applicationId: e.target.value })}>
              <option value="">Select your approved internship</option>
              {myApps.map(app => (
                <option key={app._id} value={app._id}>
                  {app.internshipType === 'off_campus'
                    ? `${app.offCampusDetails?.role} at ${app.offCampusDetails?.companyName} (Off-Campus)`
                    : `${app.internship?.title} — ${app.internship?.company}`
                  }
                </option>
              ))}
            </select>
            {myApps.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No fully approved internships found. Your internship must be fully approved before uploading a certificate.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate Title</label>
            <input className="input-field" value={certForm.title}
              placeholder="e.g. Internship Completion Certificate – TechCorp"
              onChange={e => setCertForm({ ...certForm, title: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate File (PDF/JPG/PNG, max 5MB) *</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png"
              className="input-field file:mr-2 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-1 file:rounded file:text-xs file:font-medium"
              onChange={e => setCertForm({ ...certForm, file: e.target.files[0] })} required />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setCertModal(false)}>Cancel</button>
            <button type="submit" className="btn-success" disabled={submitting || myApps.length === 0}>
              {submitting ? 'Uploading…' : 'Upload Certificate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Review Modal ── */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)}
        title={`Review: ${reviewModal?.title}`}>
        <form onSubmit={handleReview} className="space-y-4">
          <div className="flex gap-3">
            {['approved', 'rejected'].map(s => (
              <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, status: s })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition ${
                  reviewForm.status === s
                    ? s === 'approved' ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {s === 'approved' ? '✓ Approve' : '✗ Reject'}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea className="input-field" rows={2} value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
            <button type="submit" className={reviewForm.status === 'approved' ? 'btn-success' : 'btn-danger'}>
              Confirm
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
