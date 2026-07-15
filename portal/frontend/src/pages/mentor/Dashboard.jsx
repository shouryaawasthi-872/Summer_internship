import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, usersAPI, meetingsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { SkeletonStats, SkeletonBanner, SkeletonList } from '../../components/common/Skeleton';
import { STATUS_BADGE, STATUS_LABELS, KR_COLORS } from '../../utils/constants';
import { fmtDateTime } from '../../utils/helpers';
import {
  HiOutlineUsers, HiOutlineDocumentText, HiOutlineCalendar,
  HiOutlineClock, HiOutlineArrowRight, HiOutlineCheckCircle,
  HiOutlineVideoCamera,
} from 'react-icons/hi';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState({ students: [], apps: [], meetings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.getAll(), applicationsAPI.getAll(), meetingsAPI.getAll()])
      .then(([u, a, m]) => setData({
        students: u.data.users,
        apps:     a.data.applications,
        meetings: m.data.meetings,
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <SkeletonBanner />
      <SkeletonStats />
      <div className="grid lg:grid-cols-2 gap-5">
        <SkeletonList rows={4} />
        <SkeletonList rows={4} />
      </div>
    </div>
  );

  const pending  = data.apps.filter(a => a.overallStatus === 'submitted');
  const approved = data.apps.filter(a => a.overallStatus !== 'submitted' && a.overallStatus !== 'rejected').length;
  const upcoming = data.meetings.filter(m => new Date(m.scheduledAt) > new Date() && m.status === 'scheduled');

  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <div className="kr-hero-banner">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
            Mentor Dashboard
          </p>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-white/60 mb-5">
            Review student applications, schedule meetings, and assign marks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#C8102E', boxShadow: '0 4px 12px rgba(200,16,46,0.40)' }}
            >
              Review Applications
              {pending.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[11px] font-bold flex items-center justify-center"
                  style={{ color: '#C8102E' }}>
                  {pending.length}
                </span>
              )}
            </Link>
            <Link
              to="/meetings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         text-white hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}
            >
              <HiOutlineCalendar /> Schedule Meeting
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="My Students"    value={data.students.length} icon={HiOutlineUsers}        color="blue" />
        <StatCard label="Pending Review" value={pending.length}       icon={HiOutlineDocumentText} color="red"  sub="Need your approval" />
        <StatCard label="Processed"      value={approved}             icon={HiOutlineCheckCircle}  color="green" />
        <StatCard label="Upcoming Meets" value={upcoming.length}      icon={HiOutlineCalendar}     color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* ── Pending Applications ── */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              Pending Reviews
              {pending.length > 0 && (
                <span className="w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                  style={{ background: '#C8102E' }}>
                  {pending.length}
                </span>
              )}
            </h3>
            <Link to="/applications"
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: KR_COLORS.blue }}>
              View all <HiOutlineArrowRight />
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineCheckCircle className="text-4xl mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No applications pending review.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
              {pending.slice(0, 5).map(app => (
                <Link key={app._id} to={`/applications/${app._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 transition-colors group">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: KR_COLORS.blue }}>
                    {app.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                      {app.student?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{app.internship?.title}</p>
                  </div>
                  <span className={STATUS_BADGE[app.overallStatus]}>{STATUS_LABELS[app.overallStatus]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Assigned Students ── */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900">Assigned Students</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,48,135,0.07)', color: KR_COLORS.blue }}>
              {data.students.length} total
            </span>
          </div>

          {data.students.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No students assigned yet.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
              {data.students.slice(0, 6).map(s => (
                <div key={s._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                    {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.rollNumber} · {s.branch}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,48,135,0.07)', color: KR_COLORS.blue }}>
                    {s.semester}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Upcoming Meetings ── */}
      {upcoming.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900">Upcoming Meetings</h3>
            <Link to="/meetings"
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: KR_COLORS.blue }}>
              View all <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
            {upcoming.slice(0, 3).map(m => (
              <div key={m._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,48,135,0.07)' }}>
                  <HiOutlineClock style={{ color: KR_COLORS.blue }} className="text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-400">{fmtDateTime(m.scheduledAt)} · {m.duration} min</p>
                </div>
                {m.meetLink && (
                  <a href={m.meetLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: '#C8102E' }}>
                    <HiOutlineVideoCamera /> Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
