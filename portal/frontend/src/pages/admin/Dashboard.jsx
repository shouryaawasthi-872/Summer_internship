import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, usersAPI, internshipsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { SkeletonStats, SkeletonBanner, SkeletonList } from '../../components/common/Skeleton';
import { STATUS_LABELS, KR_COLORS } from '../../utils/constants';
import {
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineArrowRight,
  HiOutlineUserAdd,
} from 'react-icons/hi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState({ stats: {}, apps: [], internships: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.getStats(), applicationsAPI.getAll(), internshipsAPI.getAll()])
      .then(([s, a, i]) => setData({
        stats:       s.data.stats,
        apps:        a.data.applications,
        internships: i.data.internships,
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

  const pendingAdmin = data.apps.filter(a => a.overallStatus === 'mentor_approved');
  const approved     = data.apps.filter(a => a.overallStatus === 'fully_approved').length;

  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <div className="kr-hero-banner">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
            Admin Panel
          </p>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Hi {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-white/60 mb-5">
            Manage students, mentors, internship listings, and application approvals.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#C8102E', boxShadow: '0 4px 12px rgba(200,16,46,0.40)' }}
            >
              Review Applications
              {pendingAdmin.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[11px] font-bold flex items-center justify-center"
                  style={{ color: '#C8102E' }}>
                  {pendingAdmin.length}
                </span>
              )}
            </Link>
            <Link to="/users"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         text-white hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <HiOutlineUsers /> Manage Users
            </Link>
            <Link to="/assign-mentor"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         text-white hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <HiOutlineUserAdd /> Assign Mentors
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Students"        value={data.stats.students || 0} icon={HiOutlineUsers}       color="blue" />
        <StatCard label="Mentors"         value={data.stats.mentors  || 0} icon={HiOutlineUsers}       color="green" />
        <StatCard label="Pending (Admin)" value={pendingAdmin.length}      icon={HiOutlineClock}       color="red"  sub="Awaiting your review" />
        <StatCard label="Fully Approved"  value={approved}                 icon={HiOutlineCheckCircle} color="teal" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* ── Applications to review ── */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              Applications to Review
              {pendingAdmin.length > 0 && (
                <span className="w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                  style={{ background: '#C8102E' }}>
                  {pendingAdmin.length}
                </span>
              )}
            </h3>
            <Link to="/applications"
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: KR_COLORS.blue }}>
              View all <HiOutlineArrowRight />
            </Link>
          </div>

          {pendingAdmin.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineCheckCircle className="text-4xl mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium text-gray-500">No pending admin reviews</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
              {pendingAdmin.slice(0, 5).map(app => (
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
                    <p className="text-xs text-gray-400 truncate">{app.internship?.title} · {app.internship?.company}</p>
                  </div>
                  <span className="badge-info">{STATUS_LABELS[app.overallStatus]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Internships ── */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900">Internship Listings</h3>
            <Link to="/internships"
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: KR_COLORS.blue }}>
              View all <HiOutlineArrowRight />
            </Link>
          </div>

          {data.internships.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No internships yet.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
              {data.internships.slice(0, 5).map(i => (
                <Link key={i._id} to={`/internships/${i._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 transition-colors group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                    {i.company?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                      {i.title}
                    </p>
                    <p className="text-xs text-gray-400">{i.company} · {i.seats} seats</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    i.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {i.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/internships', icon: HiOutlineBriefcase, label: 'Add Internship', color: KR_COLORS.blue },
          { to: '/users',       icon: HiOutlineUsers,    label: 'Manage Users',   color: '#059669' },
          { to: '/assign-mentor',icon: HiOutlineUserAdd, label: 'Assign Mentor',  color: '#d97706' },
          { to: '/documents',   icon: HiOutlineDocumentText, label: 'Documents',  color: '#7c3aed' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className="card-interactive p-4 text-center group"
            style={{ borderTop: `3px solid ${color}` }}>
            <Icon className="text-2xl mx-auto mb-2 transition-transform group-hover:scale-110"
              style={{ color }} />
            <p className="text-xs font-semibold text-gray-600">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
