import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  QrCode, 
  MessageSquare, 
  Bell, 
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Bed,
  User,
  ArrowUpRight,
  LogOut,
  LogIn
} from 'lucide-react';
import FloatingShapes from '../../components/common/FloatingShapes';
import MainLayout from '../../layouts/MainLayout';

const HomePage = () => {
  const navigate = useNavigate();
  const [studentData] = useState({
    name: 'Abraham Uyottah',
    studentId: 'U1CS2222',
    department: 'Computer Science',
    level: '400L',
    hasAllocation: true,
    hostelName: 'Hostel A',
    roomNumber: 'Room 3',
    bunkNumber: 'Bunk 2',
    isInside: true,
    lastCheckIn: '2026-06-11 08:30 AM',
    lastCheckOut: '2026-06-10 10:15 PM',
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'check-in',
      title: 'Checked In',
      description: 'You scanned the QR code at Hostel A entrance',
      time: 'Today, 08:30 AM',
      icon: LogIn,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      type: 'complaint',
      title: 'Complaint Resolved',
      description: 'Water issue in Room 3 has been fixed',
      time: 'Yesterday, 04:15 PM',
      icon: CheckCircle2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 3,
      type: 'check-out',
      title: 'Checked Out',
      description: 'You left Hostel A for evening classes',
      time: 'Yesterday, 10:15 PM',
      icon: LogOut,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      id: 4,
      type: 'complaint',
      title: 'Complaint Submitted',
      description: 'Reported leaking pipe in bathroom',
      time: 'Jun 9, 02:30 PM',
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
  ]);

  const [complaints] = useState([
    {
      id: 1,
      title: 'Leaking Pipe',
      type: 'Water',
      status: 'In Progress',
      date: 'Jun 9, 2024',
      priority: 'High',
    },
    {
      id: 2,
      title: 'Broken Chair',
      type: 'Furniture',
      status: 'Submitted',
      date: 'Jun 8, 2024',
      priority: 'Medium',
    },
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: 'Hostel inspection scheduled for Friday',
      time: '2 hours ago',
      type: 'info',
    },
    {
      id: 2,
      message: 'Maintenance work in Block A this weekend',
      time: '1 day ago',
      type: 'warning',
    },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-yellow-50 text-yellow-600 border-yellow-200',
      'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
      'Resolved': 'bg-green-50 text-green-600 border-green-200',
      'Closed': 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return colors[status] || colors['Submitted'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-500 bg-red-50',
      'Medium': 'text-orange-500 bg-orange-50',
      'Low': 'text-green-500 bg-green-50',
    };
    return colors[priority] || colors['Medium'];
  };

  return (
    <MainLayout>
      <FloatingShapes />
      
      {/* Main Scrollable Content */}
      <div className="relative z-10">
        
        {/* Header Section */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">
                Hello, {studentData.name.split(' ')[0]} 👋
              </h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-0.5">
                {studentData.studentId}
              </p>
            </div>
            
            {/* Notification Bell */}
            <button className="relative w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#AAC0E1]/20 hover:bg-white/80 transition-all duration-300">
              <Bell size={20} className="text-[#0E2F76]" strokeWidth={2} />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Allocation Status Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">
                Hostel Allocation
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                studentData.hasAllocation 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {studentData.hasAllocation ? 'Allocated' : 'Not Allocated'}
              </span>
            </div>
            
            {studentData.hasAllocation ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                    <Home size={18} className="text-[#0E2F76]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0E2F76]">{studentData.hostelName}</p>
                    <p className="text-xs text-[#0E2F76]/50">
                      {studentData.roomNumber} • {studentData.bunkNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                    <User size={18} className="text-[#0E2F76]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0E2F76]">{studentData.department}</p>
                    <p className="text-xs text-[#0E2F76]/50">{studentData.level}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/gender-selection')}
                className="w-full py-3 bg-[#0E2F76] text-white rounded-[16px] text-sm font-semibold hover:bg-[#0a2560] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Bed size={16} />
                Select Hostel
              </button>
            )}
          </div>
          
          {/* Status Card - Inside/Outside */}
          <div className={`rounded-[24px] p-5 shadow-sm border mb-4 ${
            studentData.isInside 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  studentData.isInside ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <MapPin size={22} className={
                    studentData.isInside ? 'text-green-600' : 'text-orange-600'
                  } strokeWidth={2} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${
                    studentData.isInside ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {studentData.isInside ? 'Inside Hostel' : 'Outside Hostel'}
                  </p>
                  <p className="text-xs text-[#0E2F76]/50 mt-0.5">
                    {studentData.isInside 
                      ? `Since ${studentData.lastCheckIn}` 
                      : `Since ${studentData.lastCheckOut}`
                    }
                  </p>
                </div>
              </div>
              
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                studentData.isInside 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {studentData.isInside ? 'CHECKED IN' : 'CHECKED OUT'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="px-6 mb-6">
          <h3 className="text-sm font-semibold text-[#0E2F76] mb-3 font-inter">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* QR Check-in/out Button */}
            <button 
              onClick={() => navigate('/qr-scanner')}
              className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center mb-3">
                <QrCode size={22} className="text-[#0E2F76]" strokeWidth={2} />
              </div>
              <h4 className="text-sm font-semibold text-[#0E2F76] text-left">
                {studentData.isInside ? 'Check Out' : 'Check In'}
              </h4>
              <p className="text-xs text-[#0E2F76]/50 mt-1 text-left">
                Scan QR code at entrance
              </p>
            </button>
            
            {/* Attendance History */}
            <button 
              onClick={() => navigate('/attendance-history')}
              className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center mb-3">
                <Clock size={22} className="text-[#0E2F76]" strokeWidth={2} />
              </div>
              <h4 className="text-sm font-semibold text-[#0E2F76] text-left">
                History
              </h4>
              <p className="text-xs text-[#0E2F76]/50 mt-1 text-left">
                View attendance log
              </p>
            </button>
          </div>
        </div>
        
        {/* Complaints Summary */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">
              Recent Complaints
            </h3>
            <button 
              onClick={() => navigate('/complaints')}
              className="text-xs text-[#0E2F76]/60 hover:text-[#0E2F76] font-medium flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>
          
          {complaints.length > 0 ? (
            <div className="space-y-2">
              {complaints.slice(0, 2).map((complaint) => (
                <div 
                  key={complaint.id}
                  onClick={() => navigate(`/complaints/${complaint.id}`)}
                  className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-[#0E2F76]">
                      {complaint.title}
                    </h4>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#0E2F76]/40">{complaint.type}</span>
                    <span className="text-[#AAC0E1]">•</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className="text-[#AAC0E1]">•</span>
                    <span className="text-xs text-[#0E2F76]/40">{complaint.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#AAC0E1]/20 text-center">
              <MessageSquare size={32} className="text-[#AAC0E1] mx-auto mb-2" />
              <p className="text-sm text-[#0E2F76]/50">No complaints submitted yet</p>
            </div>
          )}
        </div>
        
        {/* Recent Activities */}
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">
              Recent Activities
            </h3>
          </div>
          
          <div className="space-y-2">
            {recentActivities.slice(0, 4).map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20"
              >
                <div className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon size={18} className={activity.color} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-[#0E2F76]">
                      {activity.title}
                    </h4>
                    <span className="text-[10px] text-[#0E2F76]/40 flex-shrink-0 ml-2">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#0E2F76]/50 mt-0.5">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;