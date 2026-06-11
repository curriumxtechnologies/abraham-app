import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Home,
  Bed,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  HelpCircle,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
  Smartphone,
  Bell,
  Award,
  Activity
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';

const Profile = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [studentData] = useState({
    name: 'John Doe',
    studentId: 'STU/2024/001',
    email: 'johndoe@school.edu',
    phone: '+234 801 234 5678',
    department: 'Computer Science',
    level: '200 Level',
    gender: 'Male',
    hostelName: 'Hostel A',
    roomNumber: 'Room 3',
    bunkNumber: 'Bunk 2',
    checkIns: 45,
    checkOuts: 44,
    complaintsSubmitted: 5,
    complaintsResolved: 3,
    daysInHostel: 120,
  });

  const menuItems = [
    {
      id: 'hostel',
      title: 'Hostel Information',
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      onClick: () => {},
    },
    {
      id: 'attendance',
      title: 'Attendance History',
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      onClick: () => navigate('/attendance-history'),
    },
    {
      id: 'complaints',
      title: 'Complaint History',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/complaints'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      onClick: () => {},
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogOut,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      onClick: () => setShowLogoutConfirm(true),
    },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <MainLayout>
      <FloatingShapes />
      
      <div className="relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">
                Profile
              </h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-1">
                Your account information
              </p>
            </div>
            
            {/* Settings Icon */}
            <button
              onClick={() => navigate('/settings')}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#AAC0E1]/20 hover:bg-white/80 transition-all duration-300"
            >
              <Settings size={20} className="text-[#0E2F76]" strokeWidth={2} />
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">
                  {studentData.name.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#0E2F76]">
                  {studentData.name}
                </h2>
                <p className="text-sm text-[#0E2F76]/50">{studentData.studentId}</p>
                <p className="text-sm text-[#0E2F76]/50">{studentData.department}</p>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 pt-4 border-t border-[#AAC0E1]/10">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone size={14} className="text-[#AAC0E1]" />
                <span className="text-[#0E2F76]/60">{studentData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-[#AAC0E1]" />
                <span className="text-[#0E2F76]/60">{studentData.email}</span>
              </div>
            </div>
          </div>

          {/* Hostel Allocation Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <h3 className="text-sm font-semibold text-[#0E2F76] mb-4">
              Hostel Allocation
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                  <Home size={18} className="text-[#0E2F76]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0E2F76]">{studentData.hostelName}</p>
                  <p className="text-xs text-[#0E2F76]/50">Hostel</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                  <Bed size={18} className="text-[#0E2F76]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0E2F76]">{studentData.roomNumber}</p>
                  <p className="text-xs text-[#0E2F76]/50">Room</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                  <MapPin size={18} className="text-[#0E2F76]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0E2F76]">{studentData.bunkNumber}</p>
                  <p className="text-xs text-[#0E2F76]/50">Bunk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <h3 className="text-sm font-semibold text-[#0E2F76] mb-4">
              Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={16} className="text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Check-ins</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{studentData.checkIns}</p>
              </div>
              
              <div className="bg-orange-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={16} className="text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Check-outs</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{studentData.checkOuts}</p>
              </div>
              
              <div className="bg-purple-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={16} className="text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">Complaints</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{studentData.complaintsSubmitted}</p>
              </div>
              
              <div className="bg-blue-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Days</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{studentData.daysInHostel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 pb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-[20px] shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 mb-2"
              >
                <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                  <Icon size={18} className={item.color} />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-[#0E2F76]">
                  {item.title}
                </span>
                <ChevronRight size={18} className="text-[#AAC0E1]" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          
          <div className="relative bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0E2F76] mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-[#0E2F76]/60">
                Are you sure you want to log out of your account?
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500 text-white rounded-[16px] font-semibold text-sm hover:bg-red-600 transition-all duration-300"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 bg-[#AAC0E1]/10 text-[#0E2F76] rounded-[16px] font-semibold text-sm hover:bg-[#AAC0E1]/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Profile;