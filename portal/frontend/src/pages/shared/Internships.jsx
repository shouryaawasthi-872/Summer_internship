import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { internshipsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMsg } from '../../utils/helpers';
import { KR_COLORS } from '../../utils/constants';
import {
  HiOutlineBriefcase, HiOutlinePlus, HiOutlineLocationMarker,
  HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineAcademicCap,
  HiOutlineDocumentText, HiOutlineX, HiOutlineTrash,
} from 'react-icons/hi';

// Suggested document types for the requiredDocuments builder
const DOC_SUGGESTIONS = [
  'resume', 'id_proof', 'marksheet', 'noc',
  'previous_marksheet', 'certificate', 'offer_letter', 'other',
];

const EMPTY_FORM = {
  title: '', company: '', description: '', domain: '',
  location: 'Remote', duration: '', stipend: '', seats: 10,
  skills: '', lastDate: '',
  minCGPA: 0,
  requiredDocuments: [],   // array of strings
  newDoc: '',              // staging input for adding a doc requirement
};

export default function Internships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);

  const canCreate = ['admin', 'superadmin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    internshipsAPI.getAll()
      .then(r => setInternships(r.data.internships))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  // ── required-document builder helpers ─────────────────────────────────────
  const addDocReq = () => {
    const val = form.newDoc.trim().toLowerCase();
    if (!val) return;
    if (form.requiredDocuments.includes(val))
      return toast.error('Already in the list');
    setForm(f => ({ ...f, requiredDocuments: [...f.requiredDocuments, val], newDoc: '' }));
  };

  const removeDocReq = (doc) =>
    setForm(f => ({ ...f, requiredDocuments: f.requiredDocuments.filter(d => d !== doc) }));

  const addSuggestion = (s) => {
    if (form.requiredDocuments.includes(s)) return;
    setForm(f => ({ ...f, requiredDocuments: [...f.requiredDocuments, s] }));
  };

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await internshipsAPI.create({
        ...form,
        skills:            form.skills.split(',').map(s => s.trim()).filter(Boolean),
        minCGPA:           Number(form.minCGPA) || 0,
        requiredDocuments: form.requiredDocuments,
      });
      toast.success('Internship posted!');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Internships</h1>
        {canCreate && (
          <button onClick={() => setModalOpen(true)} className="btn-kr-red flex items-center gap-2">
            <HiOutlinePlus /> Post Internship
          </button>
        )}
      </div>

      {/* Note for students about CGPA filter */}
      {user?.role === 'student' && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(0,48,135,0.06)', border: '1px solid rgba(0,48,135,0.12)' }}>
          <HiOutlineAcademicCap className="text-xl flex-shrink-0" style={{ color: KR_COLORS.blue }} />
          <span style={{ color: KR_COLORS.blue }}>
            Showing internships matching your CGPA eligibility. Internships with higher CGPA requirements are hidden.
          </span>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <SkeletonGrid count={6} rows={4} />
      ) : internships.length === 0 ? (
        <EmptyState icon={HiOutlineBriefcase} title="No internships available"
          description={user?.role === 'student'
            ? 'No internships match your CGPA eligibility right now. Contact your mentor to update your CGPA.'
            : 'No internships posted yet. Click "Post Internship" to add one.'} />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {internships.map(i => (
            <Link key={i._id} to={`/internships/${i._id}`}
              className="card-interactive p-5 group">

              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                  {i.company?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {i.status === 'pending'  && <span className="badge-pending text-xs">Pending Approval</span>}
                  {i.status === 'approved' && <span className="badge-approved text-xs">Active</span>}
                  {/* CGPA badge */}
                  {i.minCGPA > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(200,16,46,0.10)', color: KR_COLORS.red }}>
                      CGPA ≥ {i.minCGPA}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                {i.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{i.company}</p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><HiOutlineLocationMarker />{i.location}</span>
                {i.duration && <span className="flex items-center gap-1"><HiOutlineClock />{i.duration}</span>}
                {i.stipend  && <span className="flex items-center gap-1"><HiOutlineCurrencyRupee />{i.stipend}</span>}
              </div>

              {/* Skills */}
              {i.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {i.skills.slice(0, 3).map(s => (
                    <span key={s} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s}</span>
                  ))}
                  {i.skills.length > 3 && <span className="text-xs text-gray-400">+{i.skills.length - 3}</span>}
                </div>
              )}

              {/* Required docs hint */}
              {i.requiredDocuments?.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                  <HiOutlineDocumentText />
                  <span>{i.requiredDocuments.length} document{i.requiredDocuments.length > 1 ? 's' : ''} required</span>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">{i.seats} seats available</p>
            </Link>
          ))}
        </div>
      )}

      {/* ── Create Internship Modal ── */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
        title="Post New Internship" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">

          {/* Basic fields — 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input className="input-field" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company *</label>
              <input className="input-field" value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Domain</label>
              <input className="input-field" value={form.domain} placeholder="e.g. Web Development"
                onChange={e => setForm({ ...form, domain: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <select className="input-field" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}>
                {['Remote', 'On-site', 'Hybrid'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
              <input className="input-field" value={form.duration} placeholder="3 Months"
                onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stipend</label>
              <input className="input-field" value={form.stipend} placeholder="₹10,000/month"
                onChange={e => setForm({ ...form, stipend: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seats</label>
              <input className="input-field" type="number" min={1} value={form.seats}
                onChange={e => setForm({ ...form, seats: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Date</label>
              <input className="input-field" type="date" value={form.lastDate}
                onChange={e => setForm({ ...form, lastDate: e.target.value })} />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Skills <span className="font-normal text-gray-400">(comma separated)</span>
            </label>
            <input className="input-field" value={form.skills} placeholder="React, Node.js, MongoDB"
              onChange={e => setForm({ ...form, skills: e.target.value })} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea className="input-field" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>

          {/* ── NEW: CGPA Requirement ── */}
          <div className="rounded-xl p-4 space-y-2"
            style={{ background: 'rgba(0,48,135,0.04)', border: '1px solid rgba(0,48,135,0.10)' }}>
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineAcademicCap style={{ color: KR_COLORS.blue }} className="text-lg" />
              <span className="text-sm font-bold" style={{ color: KR_COLORS.blue }}>CGPA Requirement</span>
            </div>
            <p className="text-xs text-gray-500">
              Students with CGPA below this value will not see or apply for this internship.
              Set to <strong>0</strong> to allow all students.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range" min={0} max={10} step={0.1}
                value={form.minCGPA}
                onChange={e => setForm({ ...form, minCGPA: e.target.value })}
                className="flex-1 accent-[#003087]"
              />
              <span className="w-14 text-center font-bold text-lg" style={{ color: KR_COLORS.blue }}>
                {Number(form.minCGPA).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>0 (Open to all)</span><span>10 (Maximum)</span>
            </div>
          </div>

          {/* ── NEW: Required Documents Builder ── */}
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(200,16,46,0.03)', border: '1px solid rgba(200,16,46,0.12)' }}>
            <div className="flex items-center gap-2">
              <HiOutlineDocumentText style={{ color: KR_COLORS.red }} className="text-lg" />
              <span className="text-sm font-bold" style={{ color: KR_COLORS.red }}>Required Documents</span>
              <span className="text-xs text-gray-400 font-normal">
                (Students must upload all these before applying)
              </span>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {DOC_SUGGESTIONS.map(s => (
                  <button key={s} type="button"
                    disabled={form.requiredDocuments.includes(s)}
                    onClick={() => addSuggestion(s)}
                    className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
                    style={
                      form.requiredDocuments.includes(s)
                        ? { background: KR_COLORS.red, color: '#fff', borderColor: KR_COLORS.red }
                        : { borderColor: 'rgba(200,16,46,0.3)', color: KR_COLORS.red }
                    }>
                    {form.requiredDocuments.includes(s) ? '✓ ' : '+ '}{s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                placeholder="Custom document name (e.g. bank_statement)"
                value={form.newDoc}
                onChange={e => setForm({ ...form, newDoc: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDocReq())}
              />
              <button type="button" onClick={addDocReq}
                className="btn-primary px-4 text-sm">
                Add
              </button>
            </div>

            {/* Current list */}
            {form.requiredDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.requiredDocuments.map(d => (
                  <span key={d}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: KR_COLORS.red }}>
                    {d.replace('_', ' ')}
                    <button type="button" onClick={() => removeDocReq(d)}
                      className="hover:opacity-75 transition-opacity">
                      <HiOutlineX className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {form.requiredDocuments.length === 0 && (
              <p className="text-xs text-gray-400 italic">No documents required — all students may apply.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary"
              onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Internship'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
