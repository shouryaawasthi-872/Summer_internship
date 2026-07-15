import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, documentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDate } from '../../utils/helpers';
import { KR_COLORS } from '../../utils/constants';
import {
  HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineExclamationCircle,
  HiOutlineInformationCircle, HiOutlinePlus, HiOutlineFolder,
  HiOutlineUpload, HiOutlineEye, HiOutlineDocumentText, HiArrowLeft,
} from 'react-icons/hi';

/* Mandatory docs required for every application */
const MANDATORY = [
  { key: 'noc',              label: 'NOC',              desc: 'No Objection Certificate from university' },
  { key: 'offer_letter',     label: 'Offer Letter',     desc: 'Official offer letter from the company' },
  { key: 'email_screenshot', label: 'Email Screenshot', desc: 'Screenshot of offer/joining email from company' },
];

const EMPTY_FORM = {
  companyName: '', role: '', location: '', duration: '',
  stipend: '', startDate: '', endDate: '',
  supervisorName: '', supervisorEmail: '', coverLetter: '',
};

const STATUS_LABEL = {
  submitted: 'Submitted', mentor_approved: 'Mentor Approved',
  admin_approved: 'Admin Approved', fully_approved: 'Fully Approved', rejected: 'Rejected',
};
const STATUS_BADGE_CLS = {
  submitted: 'badge-submitted', mentor_approved: 'badge-info',
  admin_approved: 'badge-info', fully_approved: 'badge-approved', rejected: 'badge-rejected',
};

export default function OffCampus() {
  const { user } = useAuth();
  const fileRef = useRef();

  const [docs,       setDocs]       = useState([]);
  const [myApps,     setMyApps]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [uploadModal,setUploadModal]= useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'noc', file: null });

  const load = () => {
    setLoading(true);
    Promise.all([documentsAPI.getAll(), applicationsAPI.getAll()])
      .then(([d, a]) => {
        setDocs(d.data.documents || []);
        setMyApps((a.data.applications || []).filter(ap => ap.internshipType === 'off_campus'));
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  /* Normalised set of doc types/titles the student already has */
  const docSet = new Set(
    docs.flatMap(d => [
      (d.type  || '').toLowerCase().trim(),
      (d.title || '').toLowerCase().trim(),
    ])
  );

  const mandatoryStatus = MANDATORY.map(m => ({
    ...m,
    uploaded: docSet.has(m.key),
    doc: docs.find(d => d.type?.toLowerCase() === m.key || d.title?.toLowerCase() === m.key),
  }));
  const allReady  = mandatoryStatus.every(m => m.uploaded);
  const activeCount = myApps.filter(a => a.overallStatus !== 'rejected').length;
  const atLimit   = activeCount >= 3;

  /* Submit off-campus application */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allReady)   return toast.error('Upload all 3 mandatory documents first');
    if (atLimit)     return toast.error('3-application limit reached');
    setSubmitting(true);
    try {
      await applicationsAPI.apply({
        internshipType: 'off_campus',
        offCampusDetails: {
          companyName:     form.companyName,
          role:            form.role,
          location:        form.location,
          duration:        form.duration,
          stipend:         form.stipend,
          startDate:       form.startDate || undefined,
          endDate:         form.endDate   || undefined,
          supervisorName:  form.supervisorName,
          supervisorEmail: form.supervisorEmail,
        },
        coverLetter:          form.coverLetter,
        submittedDocumentIds: mandatoryStatus.filter(m => m.doc).map(m => m.doc._id),
      });
      toast.success('Off-campus application submitted for approval!');
      setApplyModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  /* Upload a mandatory document */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Select a file');
    const fd = new FormData();
    fd.append('title', uploadForm.title || uploadForm.type.replace(/_/g, ' '));
    fd.append('type',  uploadForm.type);
    fd.append('file',  uploadForm.file);
    setUploading(true);
    try {
      await documentsAPI.upload(fd);
      toast.success('Document uploaded!');
      setUploadModal(false);
      setUploadForm({ title: '', type: 'noc', file: null });
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Off-Campus Internship</h1>
          <p className="text-xs text-gray-400 mt-1">
            Arranged an internship through your own source? Register it here for
            university records, approval, and marks.
          </p>
        </div>
        <button
          onClick={() => setApplyModal(true)}
          disabled={!allReady || atLimit}
          title={!allReady ? 'Upload all 3 mandatory docs first' : atLimit ? '3-app limit reached' : ''}
          className="btn-kr-red flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlinePlus /> Register Internship
        </button>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-4 flex gap-3"
        style={{ background: 'rgba(0,48,135,0.05)', border: '1px solid rgba(0,48,135,0.12)' }}>
        <HiOutlineInformationCircle className="text-xl flex-shrink-0 mt-0.5" style={{ color: KR_COLORS.blue }} />
        <div className="text-xs leading-relaxed" style={{ color: KR_COLORS.blue }}>
          <p className="font-bold mb-1">How off-campus internship registration works:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-800/80">
            <li>Upload all 3 mandatory documents (NOC, Offer Letter, Email Screenshot)</li>
            <li>Click "Register Internship" and fill in the company & role details</li>
            <li>Your application goes through the same 3-level approval (Mentor → Admin → Super Admin)</li>
            <li>After full approval, upload your <strong>Completion Certificate</strong> from the Documents page</li>
            <li>Your mentor reviews the certificate and it contributes to your final marks</li>
          </ol>
        </div>
      </div>

      {/* Mandatory Documents Checklist */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineDocumentText style={{ color: KR_COLORS.red }} className="text-xl" />
            Mandatory Documents
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: allReady ? 'rgba(5,150,105,0.10)' : 'rgba(200,16,46,0.10)',
                       color: allReady ? '#059669' : KR_COLORS.red }}>
              {mandatoryStatus.filter(m => m.uploaded).length} / 3 uploaded
            </span>
          </h3>
          <button onClick={() => setUploadModal(true)} className="btn-secondary text-xs flex items-center gap-1.5">
            <HiOutlineUpload /> Upload
          </button>
        </div>
        <div className="space-y-3">
          {mandatoryStatus.map(m => (
            <div key={m.key} className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: m.uploaded ? 'rgba(5,150,105,0.05)' : 'rgba(200,16,46,0.04)',
                border: `1px solid ${m.uploaded ? 'rgba(5,150,105,0.20)' : 'rgba(200,16,46,0.18)'}`,
              }}>
              {m.uploaded
                ? <HiOutlineCheckCircle className="text-xl flex-shrink-0 text-emerald-500" />
                : <HiOutlineExclamationCircle className="text-xl flex-shrink-0" style={{ color: KR_COLORS.red }} />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-400">{m.desc}</p>
              </div>
              {m.uploaded && m.doc ? (
                <a href={`/${(m.doc.filePath || '').replace(/\\/g, '/')}`} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0">
                  <HiOutlineEye /> View
                </a>
              ) : (
                <button onClick={() => { setUploadForm({ title: m.label, type: m.key, file: null }); setUploadModal(true); }}
                  className="text-xs font-semibold flex-shrink-0 px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(200,16,46,0.10)', color: KR_COLORS.red }}>
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
        {!allReady && (
          <p className="text-xs mt-3" style={{ color: KR_COLORS.red }}>
            ⚠ All 3 documents are required before you can register an off-campus internship.
          </p>
        )}
      </div>

      {/* My off-campus applications */}
      {myApps.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900">My Off-Campus Applications</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
            {myApps.map(app => (
              <Link key={app._id} to={`/applications/${app._id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                  {(app.offCampusDetails?.companyName || 'O').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-700">
                    {app.offCampusDetails?.role || 'Internship'} at {app.offCampusDetails?.companyName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {app.offCampusDetails?.location} · Applied {fmtDate(app.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {app.completionCertificate && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Cert Uploaded
                    </span>
                  )}
                  <span className={STATUS_BADGE_CLS[app.overallStatus] || 'badge-submitted'}>
                    {STATUS_LABEL[app.overallStatus]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {myApps.length === 0 && !loading && (
        <div className="card p-10 text-center">
          <div className="kr-empty-icon mx-auto mb-3">
            <HiOutlineBriefcase className="text-3xl" />
          </div>
          <p className="font-medium text-gray-600 text-sm">No off-campus applications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload your 3 mandatory documents and click "Register Internship" to get started.
          </p>
        </div>
      )}

      {/* ── Register Internship Modal ── */}
      <Modal open={applyModal} onClose={() => { setApplyModal(false); setForm(EMPTY_FORM); }}
        title="Register Off-Campus Internship" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Mandatory docs summary */}
          <div className="rounded-lg px-3 py-2.5 flex flex-wrap gap-2"
            style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)' }}>
            <p className="text-xs font-bold text-emerald-700 w-full mb-1">Documents being submitted:</p>
            {mandatoryStatus.map(m => (
              <span key={m.key} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <HiOutlineCheckCircle /> {m.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
              <input className="input-field" value={form.companyName} required
                onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="e.g. TechCorp India" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role / Designation *</label>
              <input className="input-field" value={form.role} required
                onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Web Developer Intern" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input className="input-field" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / Delhi" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
              <input className="input-field" value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 Months" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <input type="date" className="input-field" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <input type="date" className="input-field" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stipend</label>
              <input className="input-field" value={form.stipend}
                onChange={e => setForm({ ...form, stipend: e.target.value })} placeholder="e.g. ₹8,000/month" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Supervisor Name</label>
              <input className="input-field" value={form.supervisorName}
                onChange={e => setForm({ ...form, supervisorName: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Supervisor Email</label>
              <input type="email" className="input-field" value={form.supervisorEmail}
                onChange={e => setForm({ ...form, supervisorEmail: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cover Letter / Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea className="input-field" rows={3} value={form.coverLetter}
              onChange={e => setForm({ ...form, coverLetter: e.target.value })}
              placeholder="Briefly describe the internship and your role..." />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={() => { setApplyModal(false); setForm(EMPTY_FORM); }}>
              Cancel
            </button>
            <button type="submit" className="btn-kr-red" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Upload Mandatory Document Modal ── */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Mandatory Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="rounded-lg px-3 py-2.5 text-xs"
            style={{ background: 'rgba(200,16,46,0.05)', border: '1px solid rgba(200,16,46,0.15)', color: KR_COLORS.red }}>
            Upload your NOC, Offer Letter, or Email Screenshot to unlock internship registration.
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type *</label>
            <select className="input-field" value={uploadForm.type}
              onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}>
              <option value="noc">NOC (No Objection Certificate)</option>
              <option value="offer_letter">Offer Letter</option>
              <option value="email_screenshot">Email Screenshot</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input className="input-field" value={uploadForm.title}
              placeholder={uploadForm.type.replace(/_/g, ' ')}
              onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              File (PDF / JPG / PNG, max 5MB) *
            </label>
            <input type="file" ref={fileRef} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="input-field file:mr-2 file:border-0 file:bg-red-50 file:text-red-700 file:px-3 file:py-1 file:rounded file:text-xs file:font-medium"
              onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setUploadModal(false)}>Cancel</button>
            <button type="submit" className="btn-kr-red" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
