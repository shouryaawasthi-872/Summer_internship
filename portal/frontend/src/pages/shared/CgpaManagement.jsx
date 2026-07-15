import { useEffect, useState, useCallback } from 'react';
import { cgpaAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { SkeletonList, SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDate, getInitials } from '../../utils/helpers';
import { KR_COLORS } from '../../utils/constants';
import {
  HiOutlineAcademicCap, HiOutlinePlus, HiOutlineTrash,
  HiOutlinePencil, HiOutlineChartBar, HiOutlineUser,
  HiOutlineTrendingUp, HiOutlineTrendingDown,
} from 'react-icons/hi';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ── Colour band for CGPA value ────────────────────────────────────────────────
const cgpaColor = (v) => {
  if (v >= 9)   return { bg: 'rgba(5,150,105,0.10)',  text: '#059669' };
  if (v >= 7.5) return { bg: 'rgba(0,48,135,0.09)',   text: '#003087' };
  if (v >= 6)   return { bg: 'rgba(217,119,6,0.10)',  text: '#d97706' };
  return          { bg: 'rgba(200,16,46,0.09)',  text: '#C8102E' };
};

// ── Bar chart for a student's CGPA history ────────────────────────────────────
function CgpaChart({ records }) {
  if (!records || records.length === 0) return null;
  const sorted = [...records].sort((a, b) => a.semester - b.semester);
  const max = 10;

  return (
    <div className="flex items-end gap-1 h-16">
      {sorted.map(r => {
        const { bg, text } = cgpaColor(r.cgpa);
        const heightPct = (r.cgpa / max) * 100;
        return (
          <div key={r.semester} className="flex flex-col items-center gap-0.5 flex-1" title={`Sem ${r.semester}: ${r.cgpa}`}>
            <span className="text-[9px] font-bold" style={{ color: text }}>{r.cgpa}</span>
            <div className="w-full rounded-t-sm" style={{ height: `${heightPct}%`, background: bg, border: `1px solid ${text}`, minHeight: 4 }} />
            <span className="text-[9px] text-gray-400">S{r.semester}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CgpaManagement() {
  const { user } = useAuth();

  const isMentor    = user?.role === 'mentor';
  const isAdmin     = ['admin', 'superadmin'].includes(user?.role);
  const isStudent   = user?.role === 'student';

  // ── state ─────────────────────────────────────────────────────────────────
  const [students,      setStudents]      = useState([]);
  const [records,       setRecords]       = useState([]);
  const [selectedStu,   setSelectedStu]   = useState(null);  // student obj currently viewed
  const [loading,       setLoading]       = useState(true);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [deleting,      setDeleting]      = useState(null);  // record id being deleted
  const [submitting,    setSubmitting]    = useState(false);
  const [form, setForm] = useState({ studentId: '', semester: '', cgpa: '', remarks: '' });

  // ── load ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const r = await cgpaAPI.getAll();
        setRecords(r.data.records);
      } else {
        const [sRes, rRes] = await Promise.all([
          cgpaAPI.getStudents(),
          cgpaAPI.getAll(),
        ]);
        setStudents(sRes.data.students);
        setRecords(rRes.data.records);
      }
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── records for a given student ───────────────────────────────────────────
  const recordsFor = (studentId) =>
    records.filter(r => (r.student?._id || r.student) === studentId);

  const latestCgpa = (studentId) => {
    const sorted = recordsFor(studentId).sort((a, b) => b.semester - a.semester);
    return sorted[0]?.cgpa ?? null;
  };

  // ── open modal pre-filled ─────────────────────────────────────────────────
  const openEdit = (rec) => {
    setForm({
      studentId: rec.student?._id || rec.student,
      semester:  String(rec.semester),
      cgpa:      String(rec.cgpa),
      remarks:   rec.remarks || '',
    });
    setModalOpen(true);
  };

  const openAdd = (student) => {
    setForm({ studentId: student._id, semester: '', cgpa: '', remarks: '' });
    setModalOpen(true);
  };

  // ── submit CGPA upsert ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.semester || form.cgpa === '') return toast.error('Semester and CGPA are required');
    const cgpaNum = Number(form.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)
      return toast.error('CGPA must be a number between 0 and 10');

    setSubmitting(true);
    try {
      await cgpaAPI.upsert({
        studentId: form.studentId,
        semester:  Number(form.semester),
        cgpa:      cgpaNum,
        remarks:   form.remarks,
      });
      toast.success('CGPA record saved!');
      setModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this CGPA record? The student\'s current CGPA will be recalculated.')) return;
    setDeleting(id);
    try {
      await cgpaAPI.remove(id);
      toast.success('Record deleted');
      loadAll();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setDeleting(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ── STUDENT VIEW ──────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  if (isStudent) {
    const sorted = [...records].sort((a, b) => a.semester - b.semester);
    const current = records.find(r => r.isLatest)?.cgpa ?? user?.currentCGPA;

    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="page-title">My CGPA</h1>

        {/* Summary card */}
        <div className="card p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ background: current != null ? cgpaColor(current).bg : 'rgba(0,48,135,0.07)' }}>
            <span className="text-2xl font-extrabold" style={{ color: current != null ? cgpaColor(current).text : KR_COLORS.blue }}>
              {current != null ? Number(current).toFixed(2) : '—'}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 mt-0.5">Current</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">CGPA Overview</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {records.length === 0
                ? 'No CGPA records yet. Contact your mentor.'
                : `${records.length} semester${records.length > 1 ? 's' : ''} recorded`}
            </p>
            {records.length > 0 && <CgpaChart records={records} />}
          </div>
        </div>

        {/* Semester-wise table */}
        {loading ? (
          <SkeletonList rows={4} />
        ) : records.length === 0 ? (
          <EmptyState icon={HiOutlineAcademicCap}
            title="No CGPA records"
            description="Your mentor hasn't entered any semester results yet." />
        ) : (
          <div className="card overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
              <h3 className="font-bold text-gray-900">Semester-wise Results</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
              {sorted.map((r, idx) => {
                const prev = sorted[idx - 1];
                const diff = prev ? r.cgpa - prev.cgpa : null;
                const { bg, text } = cgpaColor(r.cgpa);
                return (
                  <div key={r._id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: bg, color: text }}>
                      S{r.semester}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{Number(r.cgpa).toFixed(2)}</span>
                        {r.isLatest && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: KR_COLORS.blue }}>
                            Current
                          </span>
                        )}
                        {diff !== null && (
                          <span className={`flex items-center gap-0.5 text-xs font-semibold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {diff >= 0 ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                            {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Semester {r.semester}
                        {r.remarks && <span className="italic ml-2">· {r.remarks}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{fmtDate(r.updatedAt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ── MENTOR / ADMIN VIEW ───────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">CGPA Management</h1>
        {/* Only mentors can add/update CGPA */}
        {isMentor && selectedStu && (
          <button
            onClick={() => openAdd(selectedStu)}
            className="btn-kr-red flex items-center gap-2 text-sm">
            <HiOutlinePlus /> Add / Update Semester
          </button>
        )}
        {isAdmin && (
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,48,135,0.07)', color: '#003087' }}
          >
            Read-only view · Only mentors can update CGPA
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} rows={3} />)}
        </div>
      ) : students.length === 0 ? (
        <EmptyState icon={HiOutlineAcademicCap}
          title="No students assigned"
          description={isMentor ? 'No students have been assigned to you yet.' : 'No students in the system.'} />
      ) : !selectedStu ? (

        /* ── Student grid ── */
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select a student to view and manage their CGPA history.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(s => {
              const latest = latestCgpa(s._id);
              const stuRecords = recordsFor(s._id);
              const { bg, text } = latest != null ? cgpaColor(latest) : { bg: 'rgba(0,48,135,0.07)', text: KR_COLORS.blue };

              return (
                <button key={s._id}
                  onClick={() => setSelectedStu(s)}
                  className="card-interactive p-5 text-left group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                      {getInitials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNumber} · {s.branch}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: bg }}>
                      <span className="text-base font-extrabold leading-none" style={{ color: text }}>
                        {latest != null ? Number(latest).toFixed(1) : '—'}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-0.5">CGPA</span>
                    </div>
                  </div>

                  {stuRecords.length > 0
                    ? <CgpaChart records={stuRecords} />
                    : <p className="text-xs text-gray-400 italic">No records yet</p>
                  }

                  <p className="text-xs text-gray-400 mt-2">
                    {stuRecords.length} semester{stuRecords.length !== 1 ? 's' : ''} · Click to manage
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      ) : (

        /* ── Selected student detail ── */
        <div className="space-y-5 max-w-2xl">

          {/* Back + header */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedStu(null)}
              className="text-sm font-semibold hover:underline flex items-center gap-1"
              style={{ color: KR_COLORS.blue }}>
              ← All Students
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-700">{selectedStu.name}</span>
          </div>

          {/* Student summary */}
          <div className="card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full text-white text-lg font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
              {getInitials(selectedStu.name)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{selectedStu.name}</p>
              <p className="text-sm text-gray-500">{selectedStu.rollNumber} · {selectedStu.branch} · {selectedStu.email}</p>
            </div>
            {(() => {
              const latest = latestCgpa(selectedStu._id);
              const { bg, text } = latest != null ? cgpaColor(latest) : { bg: 'rgba(0,48,135,0.07)', text: KR_COLORS.blue };
              return (
                <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: bg }}>
                  <span className="text-xl font-extrabold" style={{ color: text }}>
                    {latest != null ? Number(latest).toFixed(1) : '—'}
                  </span>
                  <span className="text-[10px] text-gray-400">Current</span>
                </div>
              );
            })()}
          </div>

          {/* CGPA history table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
              <h3 className="font-bold text-gray-900">Semester History</h3>
              {isMentor && (
                <button onClick={() => openAdd(selectedStu)} className="btn-kr-red text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <HiOutlinePlus /> Add Semester
                </button>
              )}
            </div>

            {recordsFor(selectedStu._id).length === 0 ? (
              <div className="p-8 text-center">
                <HiOutlineAcademicCap className="text-4xl mx-auto mb-2" style={{ color: KR_COLORS.blue, opacity: 0.4 }} />
                <p className="text-sm font-medium text-gray-500">No CGPA records yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Semester" to add the first entry.</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,48,135,0.06)' }}>
                  <CgpaChart records={recordsFor(selectedStu._id)} />
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
                  {[...recordsFor(selectedStu._id)]
                    .sort((a, b) => a.semester - b.semester)
                    .map(r => {
                      const { bg, text } = cgpaColor(r.cgpa);
                      return (
                        <div key={r._id} className="flex items-center gap-4 px-5 py-3.5">
                          <div className="w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0"
                            style={{ background: bg, color: text }}>
                            S{r.semester}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{Number(r.cgpa).toFixed(2)}</span>
                              {r.isLatest && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                  style={{ background: KR_COLORS.blue }}>Current</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Semester {r.semester}
                              {r.remarks && <span className="italic ml-2">· {r.remarks}</span>}
                              <span className="ml-2">· Updated {fmtDate(r.updatedAt)}</span>
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            {isMentor && (
                              <button onClick={() => openEdit(r)}
                                className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                                title="Edit" style={{ color: KR_COLORS.blue }}>
                                <HiOutlinePencil />
                              </button>
                            )}
                            {isMentor && (
                              <button onClick={() => handleDelete(r._id)}
                                disabled={deleting === r._id}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                                title="Delete">
                                <HiOutlineTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Upsert Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.semester ? `Edit Semester ${form.semester} CGPA` : 'Add Semester CGPA'}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Student indicator */}
          {form.studentId && (() => {
            const s = students.find(s => s._id === form.studentId);
            return s ? (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: 'rgba(0,48,135,0.06)' }}>
                <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: KR_COLORS.blue }}>
                  {getInitials(s.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: KR_COLORS.blue }}>{s.name}</p>
                  <p className="text-xs text-gray-400">{s.rollNumber}</p>
                </div>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester *</label>
              <select className="input-field" value={form.semester}
                onChange={e => setForm({ ...form, semester: e.target.value })} required>
                <option value="">Select semester</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CGPA (0–10) *</label>
              <input
                type="number" step="0.01" min="0" max="10"
                className="input-field"
                placeholder="e.g. 8.50"
                value={form.cgpa}
                onChange={e => setForm({ ...form, cgpa: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Live preview bar */}
          {form.cgpa !== '' && !isNaN(Number(form.cgpa)) && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">CGPA preview</span>
                <span className="text-sm font-bold"
                  style={{ color: cgpaColor(Number(form.cgpa)).text }}>
                  {Number(form.cgpa).toFixed(2)} / 10
                </span>
              </div>
              <div className="kr-progress-track">
                <div className="kr-progress-fill" style={{ width: `${(Number(form.cgpa) / 10) * 100}%` }} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Remarks <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input className="input-field" placeholder="e.g. Good improvement"
              value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save CGPA'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
