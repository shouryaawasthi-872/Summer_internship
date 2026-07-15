import { useEffect, useState } from 'react';
import { marksAPI, usersAPI, internshipsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMsg } from '../../utils/helpers';
import { KR_COLORS } from '../../utils/constants';
import {
  HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineExclamationCircle,
  HiOutlineEye,
} from 'react-icons/hi';

const gradeColor = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A':  'bg-emerald-100 text-emerald-600',
  'B+': 'bg-blue-100 text-blue-700',
  'B':  'bg-blue-100 text-blue-600',
  'C':  'bg-yellow-100 text-yellow-700',
  'F':  'bg-red-100 text-red-700',
};

/* Single criteria bar row */
function CriteriaBar({ label, value, max = 100, color = KR_COLORS.blue }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
        <span>{label}</span><span className="font-semibold">{value ?? 0}/{max}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${((value ?? 0) / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

/* Slider input field for the give-marks form */
function SliderField({ label, field, form, setForm }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-sm font-bold" style={{ color: KR_COLORS.blue }}>{form[field]}/100</span>
      </div>
      <input type="range" min={0} max={100} className="w-full accent-[#003087]" value={form[field]}
        onChange={e => setForm({ ...form, [field]: +e.target.value })} />
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}

export default function Marks() {
  const { user } = useAuth();
  const isMentor  = user?.role === 'mentor';

  const [marks,      setMarks]      = useState([]);
  const [students,   setStudents]   = useState([]);
  const [internships,setInternships]= useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [certModal,  setCertModal]  = useState(null); // marks record for cert verification
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: '', internshipId: '', internshipTitle: '',
    performance: 0, attendance: 0, taskCompletion: 0, communication: 0,
    certificateMarks: 0, feedback: '',
  });
  const [certForm, setCertForm] = useState({ certificateMarks: 0, comment: '' });

  const load = () =>
    marksAPI.getAll()
      .then(r => setMarks(r.data.marks || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    if (isMentor) {
      usersAPI.getAll().then(r => setStudents(r.data.users || []));
      internshipsAPI.getAll().then(r => setInternships(r.data.internships || []));
    }
  }, [isMentor]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await marksAPI.save(form);
      toast.success('Marks saved!');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  const handleVerifyCert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await marksAPI.verifyCertificate(certModal._id, certForm);
      toast.success('Certificate verified! Marks updated.');
      setCertModal(null);
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Marks & Feedback</h1>
        {isMentor && (
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <HiOutlineAcademicCap /> Give Marks
          </button>
        )}
      </div>

      {/* Info banner for students */}
      {user?.role === 'student' && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: 'rgba(0,48,135,0.05)', border: '1px solid rgba(0,48,135,0.12)' }}>
          <div className="flex gap-3">
            <HiOutlineAcademicCap className="text-xl flex-shrink-0 mt-0.5" style={{ color: KR_COLORS.blue }} />
            <p className="text-sm" style={{ color: KR_COLORS.blue }}>
              Marks are unlocked after your internship application is <strong>fully approved</strong>
              (Mentor → Admin → Super Admin). Your mentor then assigns marks across 5 components.
            </p>
          </div>
          {/* 5-component breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pl-7">
            {[
              { label: 'Performance',     color: KR_COLORS.blue },
              { label: 'Attendance',      color: KR_COLORS.blue },
              { label: 'Task Completion', color: KR_COLORS.blue },
              { label: 'Communication',   color: KR_COLORS.blue },
              { label: 'Completion Cert', color: '#059669', note: '← Upload to earn this!' },
            ].map((c, i) => (
              <div key={i} className="rounded-lg px-2.5 py-2 text-center"
                style={{
                  background: c.color === '#059669' ? 'rgba(5,150,105,0.08)' : 'rgba(0,48,135,0.06)',
                  border: `1px solid ${c.color === '#059669' ? 'rgba(5,150,105,0.20)' : 'rgba(0,48,135,0.12)'}`,
                }}>
                <p className="text-[11px] font-bold" style={{ color: c.color }}>{c.label}</p>
                {c.note && <p className="text-[10px] mt-0.5" style={{ color: c.color }}>{c.note}</p>}
              </div>
            ))}
          </div>
          <p className="text-xs pl-7" style={{ color: KR_COLORS.blue }}>
            Upload your <strong>Completion Certificate</strong> from the{' '}
            <a href="/documents" className="underline font-semibold">Documents page</a>{' '}
            after finishing your internship — your mentor verifies it and it adds the 5th component to your grade.
          </p>
        </div>
      )}

      {/* Marks grid */}
      {loading ? (
        <SkeletonGrid count={3} rows={4} />
      ) : marks.length === 0 ? (
        <EmptyState icon={HiOutlineAcademicCap} title="No marks yet"
          description={isMentor
            ? 'Marks unlock automatically after a student\'s application is fully approved.'
            : 'Your marks will appear here after your internship is fully approved.'} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {marks.map(m => (
            <div key={m._id} className="card p-5"
              style={m.certificateVerified ? { borderTop: '3px solid #059669' } : {}}>

              {/* Student / internship info */}
              {m.student && (
                <p className="font-bold text-gray-900 text-sm">{m.student.name}</p>
              )}
              <p className="text-xs text-gray-400 mb-3">
                {m.internship?.title || m.internshipTitle || 'Internship'}
                {m.internship?.company ? ` · ${m.internship.company}` : ''}
              </p>

              {/* Criteria bars */}
              <div className="space-y-2">
                <CriteriaBar label="Performance"     value={m.performance}    color={KR_COLORS.blue} />
                <CriteriaBar label="Attendance"      value={m.attendance}     color={KR_COLORS.blue} />
                <CriteriaBar label="Task Completion" value={m.taskCompletion} color={KR_COLORS.blue} />
                <CriteriaBar label="Communication"   value={m.communication}  color={KR_COLORS.blue} />
                {(m.certificateVerified || m.certificateMarks > 0) && (
                  <CriteriaBar label="Certificate Marks" value={m.certificateMarks} color="#059669" />
                )}
              </div>

              {/* Overall + grade */}
              <div className="flex items-center justify-between mt-4 pt-3"
                style={{ borderTop: '1px solid rgba(0,48,135,0.08)' }}>
                <span className="text-sm font-semibold text-gray-700">
                  Overall: <span className="font-extrabold text-gray-900">{m.overall ?? '—'}/100</span>
                </span>
                {m.grade && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradeColor[m.grade] || 'bg-gray-100 text-gray-600'}`}>
                    {m.grade}
                  </span>
                )}
              </div>

              {/* Feedback */}
              {m.feedback && (
                <p className="text-xs text-gray-400 mt-2 italic">"{m.feedback}"</p>
              )}

              {/* Completion certificate section */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,48,135,0.08)' }}>
                {m.completionCertificate ? (
                  <div className="flex items-center gap-2">
                    {m.certificateVerified
                      ? <HiOutlineCheckCircle className="text-emerald-500 flex-shrink-0" />
                      : <HiOutlineExclamationCircle className="text-amber-500 flex-shrink-0" />
                    }
                    <span className="text-xs font-semibold"
                      style={{ color: m.certificateVerified ? '#059669' : '#d97706' }}>
                      {m.certificateVerified ? 'Certificate verified' : 'Certificate pending verification'}
                    </span>
                    {m.completionCertificate?.filePath && (
                      <a href={`/${m.completionCertificate.filePath.replace(/\\/g, '/')}`}
                        target="_blank" rel="noreferrer"
                        className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                        <HiOutlineEye /> View
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No completion certificate uploaded yet
                  </p>
                )}

                {/* Mentor: verify certificate button */}
                {isMentor && m.completionCertificate && !m.certificateVerified && (
                  <button onClick={() => { setCertModal(m); setCertForm({ certificateMarks: 0, comment: '' }); }}
                    className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg w-full text-center transition-all"
                    style={{ background: 'rgba(5,150,105,0.10)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }}>
                    ✓ Verify Certificate & Add Marks
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Give Marks Modal (Mentor) ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Give Marks" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student *</label>
              <select className="input-field" value={form.studentId} required
                onChange={e => setForm({ ...form, studentId: e.target.value })}>
                <option value="">Select student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Internship (Portal)</label>
              <select className="input-field" value={form.internshipId}
                onChange={e => setForm({ ...form, internshipId: e.target.value, internshipTitle: '' })}>
                <option value="">Select (or type below for off-campus)</option>
                {internships.map(i => <option key={i._id} value={i._id}>{i.title} — {i.company}</option>)}
              </select>
            </div>
            {!form.internshipId && (
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Off-Campus Internship Title
                </label>
                <input className="input-field" value={form.internshipTitle}
                  placeholder="e.g. Web Developer Intern at TechCorp"
                  onChange={e => setForm({ ...form, internshipTitle: e.target.value })} />
              </div>
            )}
          </div>

          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(0,48,135,0.03)', border: '1px solid rgba(0,48,135,0.10)' }}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Performance Criteria</p>
            <SliderField label="Performance"     field="performance"    form={form} setForm={setForm} />
            <SliderField label="Attendance"      field="attendance"     form={form} setForm={setForm} />
            <SliderField label="Task Completion" field="taskCompletion" form={form} setForm={setForm} />
            <SliderField label="Communication"   field="communication"  form={form} setForm={setForm} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback</label>
            <textarea className="input-field" rows={3} value={form.feedback}
              onChange={e => setForm({ ...form, feedback: e.target.value })}
              placeholder="Write your feedback for the student..." />
          </div>

          <div className="rounded-lg px-3 py-2.5 text-xs"
            style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)', color: '#065F46' }}>
            <strong>Note:</strong> Certificate marks (5th component) will be added separately after the student uploads
            their completion certificate and you verify it.
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Verify Certificate Modal (Mentor) ── */}
      <Modal open={!!certModal} onClose={() => setCertModal(null)} title="Verify Completion Certificate">
        {certModal && (
          <form onSubmit={handleVerifyCert} className="space-y-4">
            <div className="rounded-lg px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.20)' }}>
              <HiOutlineAcademicCap className="text-xl flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  {certModal.student?.name} — Completion Certificate
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {certModal.internship?.title || certModal.internshipTitle}
                </p>
                {certModal.completionCertificate?.filePath && (
                  <a href={`/${certModal.completionCertificate.filePath.replace(/\\/g, '/')}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline mt-1">
                    <HiOutlineEye /> View Certificate
                  </a>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-gray-700">
                  Certificate Marks (0–100)
                </label>
                <span className="text-sm font-bold" style={{ color: '#059669' }}>
                  {certForm.certificateMarks}/100
                </span>
              </div>
              <input type="range" min={0} max={100} className="w-full accent-[#059669]"
                value={certForm.certificateMarks}
                onChange={e => setCertForm({ ...certForm, certificateMarks: +e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">
                This score will be averaged with the 4 other criteria to produce the new overall marks.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Verification Comment <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea className="input-field" rows={2} value={certForm.comment}
                onChange={e => setCertForm({ ...certForm, comment: e.target.value })}
                placeholder="e.g. Certificate verified and marks updated." />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setCertModal(null)}>Cancel</button>
              <button type="submit" className="btn-success" disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify & Update Marks'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
