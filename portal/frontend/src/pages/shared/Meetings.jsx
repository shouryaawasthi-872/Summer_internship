import { useEffect, useState } from 'react';
import { meetingsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDateTime } from '../../utils/helpers';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlineTrash, HiOutlineLink } from 'react-icons/hi';

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', students:[], scheduledAt:'', duration:60, meetLink:'' });

  const canCreate = ['mentor','admin','superadmin'].includes(user?.role);

  const load = () => meetingsAPI.getAll().then(r => setMeetings(r.data.meetings)).finally(() => setLoading(false));
  useEffect(() => {
    load();
    if (canCreate) usersAPI.getAll({ role:'student' }).then(r => setStudents(r.data.users)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await meetingsAPI.create(form);
      toast.success('Meeting scheduled!');
      setModalOpen(false);
      setForm({ title:'', description:'', students:[], scheduledAt:'', duration:60, meetLink:'' });
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel this meeting?')) return;
    try { await meetingsAPI.remove(id); toast.success('Meeting cancelled'); load(); }
    catch (err) { toast.error(getErrorMsg(err)); }
  };

  const toggleStudent = (id) => {
    setForm(f => ({ ...f, students: f.students.includes(id) ? f.students.filter(s => s !== id) : [...f.students, id] }));
  };

  const statusColor = { scheduled:'bg-blue-100 text-blue-700', completed:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Meetings</h1>
        {canCreate && (
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <HiOutlinePlus /> Schedule Meeting
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : meetings.length === 0 ? (
        <EmptyState icon={HiOutlineCalendar} title="No meetings scheduled" />
      ) : (
        <div className="space-y-3">
          {meetings.map(m => (
            <div key={m._id} className="card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <HiOutlineCalendar className="text-purple-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.title}</h3>
                    <p className="text-sm text-gray-500">{fmtDateTime(m.scheduledAt)} · {m.duration} min</p>
                    {m.mentor && <p className="text-xs text-gray-400">By: {m.mentor.name}</p>}
                    {m.description && <p className="text-xs text-gray-500 mt-1">{m.description}</p>}
                    {m.students?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Participants: {m.students.map(s => s.name).join(', ')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[m.status]}`}>{m.status}</span>
                  {m.meetLink && (
                    <a href={m.meetLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                      <HiOutlineLink /> Join
                    </a>
                  )}
                  {canCreate && (
                    <button onClick={() => handleDelete(m._id)} className="text-red-400 hover:text-red-600 p-1"><HiOutlineTrash /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Meeting">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input-field" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input type="datetime-local" className="input-field" value={form.scheduledAt} onChange={e => setForm({...form,scheduledAt:e.target.value})} required />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <input type="number" className="input-field" value={form.duration} min={15} onChange={e => setForm({...form,duration:e.target.value})} />
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meet Link</label>
            <input className="input-field" type="url" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={e => setForm({...form,meetLink:e.target.value})} />
          </div>
          {students.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Students</label>
              <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {students.map(s => (
                  <label key={s._id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm">
                    <input type="checkbox" checked={form.students.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                    {s.name} <span className="text-gray-400 text-xs">({s.rollNumber})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Scheduling...' : 'Schedule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
