import { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { getErrorMsg, getInitials, avatarColor } from '../../utils/helpers';
import { HiOutlineUserAdd } from 'react-icons/hi';

export default function AssignMentor() {
  const [students, setStudents]   = useState([]);
  const [mentors, setMentors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState({ studentId:'', mentorId:'' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, m] = await Promise.all([usersAPI.getAll({ role:'student' }), usersAPI.getAll({ role:'mentor' })]);
    setStudents(s.data.users);
    setMentors(m.data.users);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selected.studentId || !selected.mentorId) return toast.error('Select both student and mentor');
    setSubmitting(true);
    try {
      await usersAPI.assignMentor(selected);
      toast.success('Mentor assigned successfully!');
      setSelected({ studentId:'', mentorId:'' });
      load();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="page-title">Assign Mentor to Student</h1>

      <div className="card p-6">
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
              <select className="input-field" value={selected.studentId} onChange={e => setSelected({...selected, studentId:e.target.value})}>
                <option value="">Choose student...</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Mentor</label>
              <select className="input-field" value={selected.mentorId} onChange={e => setSelected({...selected, mentorId:e.target.value})}>
                <option value="">Choose mentor...</option>
                {mentors.map(m => <option key={m._id} value={m._id}>{m.name} ({m.department || m.email})</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            <HiOutlineUserAdd /> {submitting ? 'Assigning...' : 'Assign Mentor'}
          </button>
        </form>
      </div>

      {loading ? (
        <>
          <SkeletonList rows={3} />
          <div className="grid sm:grid-cols-2 gap-4"><SkeletonCard rows={3} /><SkeletonCard rows={3} /></div>
        </>
      ) : (
        <>
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Current Assignments</h2>
            <div className="card divide-y divide-gray-50">
              {students.filter(s => s.assignedMentor).length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No assignments yet</div>
              ) : students.filter(s => s.assignedMentor).map(s => (
                <div key={s._id} className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor(s.name)}`}>
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.rollNumber} · {s.branch}</p>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <p className="font-medium">{s.assignedMentor?.name || '—'}</p>
                    <p className="text-xs text-gray-400">Mentor</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Mentor Overview</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {mentors.map(m => (
                <div key={m._id} className="card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor(m.name)}`}>
                      {getInitials(m.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.department}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{m.assignedStudents?.length || 0} students assigned</p>
                  {m.assignedStudents?.slice(0, 3).map(s => (
                    <p key={s._id || s} className="text-xs text-gray-600 py-0.5">• {s.name || 'Student'}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
