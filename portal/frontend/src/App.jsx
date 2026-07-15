import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth pages
import Login from './pages/auth/Login';
// No Register page — self-registration is disabled.
// All accounts are created by Admin/SuperAdmin via User Management.

// Shared pages
import Internships       from './pages/shared/Internships';
import InternshipDetail  from './pages/shared/InternshipDetail';
import Applications      from './pages/shared/Applications';
import ApplicationDetail from './pages/shared/ApplicationDetail';
import Documents         from './pages/shared/Documents';
import Meetings          from './pages/shared/Meetings';
import Marks             from './pages/shared/Marks';
import Notifications     from './pages/shared/Notifications';
import Profile           from './pages/shared/Profile';
import CgpaManagement    from './pages/shared/CgpaManagement';

// Dashboards
import StudentDashboard    from './pages/student/Dashboard';
import MentorDashboard     from './pages/mentor/Dashboard';
import AdminDashboard      from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/superadmin/Dashboard';

// Admin/SuperAdmin only
import UsersPage        from './pages/admin/Users';
import AssignMentorPage from './pages/admin/AssignMentor';

// Student only
import OffCampus from './pages/student/OffCampus';

// ── Route guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  const map = {
    student:    <StudentDashboard />,
    mentor:     <MentorDashboard />,
    admin:      <AdminDashboard />,
    superadmin: <SuperAdminDashboard />,
  };
  return map[user?.role] || <StudentDashboard />;
};

// Wrap each page in an ErrorBoundary so one crash doesn't kill the whole app
const Page = ({ children }) => <ErrorBoundary>{children}</ErrorBoundary>;

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/"         element={<Navigate to="/dashboard" />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

        {/* ── Common routes (all authenticated roles) ── */}
        <Route path="/dashboard"        element={<Page><DashboardRedirect /></Page>} />
        <Route path="/internships"      element={<Page><Internships /></Page>} />
        <Route path="/internships/:id"  element={<Page><InternshipDetail /></Page>} />
        <Route path="/applications"     element={<Page><Applications /></Page>} />
        <Route path="/applications/:id" element={<Page><ApplicationDetail /></Page>} />
        <Route path="/documents"        element={<Page><Documents /></Page>} />
        <Route path="/meetings"         element={<Page><Meetings /></Page>} />
        <Route path="/notifications"    element={<Page><Notifications /></Page>} />
        <Route path="/profile"          element={<Page><Profile /></Page>} />

        {/* ── Marks: student (view own) + mentor (give marks) ONLY ── */}
        <Route
          path="/marks"
          element={
            <ProtectedRoute roles={['student', 'mentor']}>
              <Page><Marks /></Page>
            </ProtectedRoute>
          }
        />

        {/* ── CGPA: student (view own) + mentor (manage) ONLY ── */}
        <Route
          path="/cgpa"
          element={
            <ProtectedRoute roles={['student', 'mentor']}>
              <Page><CgpaManagement /></Page>
            </ProtectedRoute>
          }
        />

        {/* ── Off-campus internship: student only ── */}
        <Route
          path="/off-campus"
          element={
            <ProtectedRoute roles={['student']}>
              <Page><OffCampus /></Page>
            </ProtectedRoute>
          }
        />

        {/* ── Admin / Super Admin only ── */}
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <Page><UsersPage /></Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assign-mentor"
          element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <Page><AssignMentorPage /></Page>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
