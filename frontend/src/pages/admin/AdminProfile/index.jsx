import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  Users,
  MessageSquare,
  Activity,
  Award,
  Briefcase,
  Star,
  Edit3,
  Clock
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [adminData] = useState({
    name: 'Administrator',
    email: 'admin@hostix.com',
    phone: '+234 800 000 0000',
    role: 'Hostel Administrator',
    employeeId: 'ADM/2024/001',
    department: 'Student Affairs',
    joinedDate: 'January 15, 2024',
    managedHostels: ['Hostel A', 'Hostel B', 'Hostel C'],
    totalStudents: 256,
    totalStaff: 12,
    yearsOfService: 2,
  });

  const [stats] = useState({
    studentsManaged: 256,
    complaintsResolved: 89,
    attendanceRecords: 1250,
    satisfactionRate: '94%',
  });

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: Edit3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/admin/edit-profile'),
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/admin/settings'),
    },
    {
      id: 'logout',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: LogOut,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => setShowLogoutConfirm(true),
      isDanger: true,
    },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/admin/login');
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Your account information and statistics
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#0E2F76] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0E2F76]/20">
                <span className="text-white text-3xl font-bold">
                  {adminData.name.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {adminData.name}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <Shield size={14} className="text-gray-400" />
                  <p className="text-sm text-gray-500">{adminData.role}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{adminData.employeeId}</p>
              </div>
              
              <button
                onClick={() => navigate('/admin/edit-profile')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0E2F76] text-white rounded-lg text-sm font-medium hover:bg-[#0a2560] transition-all duration-200"
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700">{adminData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-gray-700">{adminData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm text-gray-700">{adminData.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-sm text-gray-700">{adminData.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <Users size={18} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.studentsManaged}</p>
              <p className="text-xs text-gray-500 mt-1">Students Managed</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                <Star size={18} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.complaintsResolved}</p>
              <p className="text-xs text-gray-500 mt-1">Complaints Resolved</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                <Activity size={18} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRecords}</p>
              <p className="text-xs text-gray-500 mt-1">Attendance Records</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                <Award size={18} className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}</p>
              <p className="text-xs text-gray-500 mt-1">Satisfaction Rate</p>
            </div>
          </div>

          {/* Managed Hostels */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Managed Hostels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {adminData.managedHostels.map((hostel, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100"
                >
                  <Building2 size={20} className="text-[#0E2F76]" />
                  <span className="text-sm font-medium text-gray-700">{hostel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Info & Menu */}
        <div className="space-y-6">
          
          {/* Quick Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Staff</p>
                    <p className="text-xs text-gray-400">In your team</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{adminData.totalStaff}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Clock size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Years of Service</p>
                    <p className="text-xs text-gray-400">Since joining</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{adminData.yearsOfService} yrs</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Building2 size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hostels</p>
                    <p className="text-xs text-gray-400">Under management</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{adminData.managedHostels.length}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === menuItems.length - 1;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 ${
                    !isLast ? 'border-b border-gray-50' : ''
                  } ${item.isDanger ? 'hover:bg-red-50/50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                    <Icon size={18} className={item.color} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${item.isDanger ? 'text-red-600' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={18} className={`${item.isDanger ? 'text-red-300' : 'text-gray-300'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to log out of the admin portal?
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-all duration-200"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProfile;