import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminStudents from '../pages/admin/Students';
import AdminAttendance from '../pages/admin/Attendance';
import AdminComplaints from '../pages/admin/Complaints';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminSettings from '../pages/admin/AdminSettings';
import EditProfile from '../pages/admin/EditProfile';

const adminRoutes = [
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/students',
    element: <AdminStudents />,
  },
  {
    path: '/admin/attendance',
    element: <AdminAttendance />,
  },
  {
    path: '/admin/complaints',
    element: <AdminComplaints />,
  },
  {
    path: '/admin/profile',
    element: <AdminProfile />,
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
  },
  {
    path: '/admin/edit-profile',
    element: <EditProfile />,
  },
];

export default adminRoutes;