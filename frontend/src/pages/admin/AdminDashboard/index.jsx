import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  UserCheck,
  UserX,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Building2,
  Activity,
  TrendingUp,
  TrendingDown,
  Bed,
  Calendar,
  Clock,
  MoreHorizontal,
  Download,
  Filter
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats] = useState({
    totalStudents: 256,
    checkedIn: 189,
    checkedOut: 67,
    totalComplaints: 45,
    pendingComplaints: 12,
    resolvedToday: 8,
    totalRooms: 120,
    occupiedRooms: 98,
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'check-in',
      student: 'John Doe',
      action: 'Checked In',
      hostel: 'Hostel A, Room 3',
      time: '5 minutes ago',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      type: 'check-out',
      student: 'Jane Smith',
      action: 'Checked Out',
      hostel: 'Hostel B, Room 7',
      time: '12 minutes ago',
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 3,
      type: 'complaint',
      student: 'Mike Johnson',
      action: 'New Complaint',
      hostel: 'Hostel A, Room 2 - Leaking Pipe',
      time: '25 minutes ago',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 4,
      type: 'check-in',
      student: 'Sarah Williams',
      action: 'Checked In',
      hostel: 'Hostel C, Room 5',
      time: '45 minutes ago',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 5,
      type: 'complaint-resolved',
      student: 'David Brown',
      action: 'Complaint Resolved',
      hostel: 'Hostel A, Room 1 - Fixed Socket',
      time: '1 hour ago',
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ]);

  const [recentComplaints] = useState([
    {
      id: 1,
      student: 'John Doe',
      hostel: 'Hostel A, Room 3',
      issue: 'Leaking Pipe in Bathroom',
      type: 'Plumbing',
      status: 'In Progress',
      date: 'Jun 18, 2026',
    },
    {
      id: 2,
      student: 'Jane Smith',
      hostel: 'Hostel B, Room 7',
      issue: 'Broken Study Chair',
      type: 'Furniture',
      status: 'Submitted',
      date: 'Jun 18, 2026',
    },
    {
      id: 3,
      student: 'Mike Johnson',
      hostel: 'Hostel C, Room 2',
      issue: 'Faulty Electrical Socket',
      type: 'Electrical',
      status: 'Acknowledged',
      date: 'Jun 17, 2026',
    },
  ]);

  const [hostelStats] = useState([
    { name: 'Hostel A', total: 80, occupied: 65, available: 15, color: 'bg-[#0E2F76]' },
    { name: 'Hostel B', total: 60, occupied: 48, available: 12, color: 'bg-green-500' },
    { name: 'Hostel C', total: 70, occupied: 52, available: 18, color: 'bg-purple-500' },
  ]);

  const [attendanceOverview] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [45, 52, 38, 55, 48, 30, 25],
  });

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Acknowledged': 'bg-blue-50 text-blue-700 border-blue-200',
      'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Resolved': 'bg-green-50 text-green-700 border-green-200',
      'Closed': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[status] || colors['Submitted'];
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12',
      changeType: 'increase',
    },
    {
      title: 'Checked In Now',
      value: stats.checkedIn,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${Math.round((stats.checkedIn / stats.totalStudents) * 100)}%`,
      changeType: 'neutral',
    },
    {
      title: 'Checked Out',
      value: stats.checkedOut,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Outside',
      changeType: 'decrease',
    },
    {
      title: 'Pending Complaints',
      value: stats.pendingComplaints,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: `${stats.resolvedToday} resolved`,
      changeType: 'neutral',
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, Administrator. Here's what's happening across your hostels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              <Download size={16} />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              <Calendar size={16} />
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <button className="text-gray-300 hover:text-gray-500">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' :
                  stat.changeType === 'decrease' ? 'text-orange-600' :
                  'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Attendance Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
              <p className="text-sm text-gray-500">Check-ins per day this week</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-[#0E2F76] text-white rounded-lg">Week</button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Month</button>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-2">
            {attendanceOverview.data.map((value, index) => {
              const maxValue = Math.max(...attendanceOverview.data);
              const heightPercent = (value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                    <div 
                      className="w-full max-w-[40px] bg-[#0E2F76] rounded-t-lg hover:bg-[#0a2560] transition-all duration-300 cursor-pointer relative group"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value} students
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{attendanceOverview.labels[index]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hostel Occupancy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Occupancy</h3>
            <button className="text-sm text-[#0E2F76] font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {hostelStats.map((hostel, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{hostel.name}</span>
                  <span className="text-sm text-gray-500">{hostel.occupied}/{hostel.total}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${hostel.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(hostel.occupied / hostel.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{hostel.available} beds available</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout - Activities & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <p className="text-sm text-gray-500">Latest student actions</p>
            </div>
            <button className="text-sm text-[#0E2F76] font-medium hover:underline flex items-center gap-1">
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon size={18} className={activity.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.student}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {activity.action} • {activity.hostel}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
              <p className="text-sm text-gray-500">Issues requiring attention</p>
            </div>
            <button 
              onClick={() => navigate('/admin/complaints')}
              className="text-sm text-[#0E2F76] font-medium hover:underline flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentComplaints.map((complaint) => (
              <div 
                key={complaint.id}
                onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {complaint.student}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {complaint.hostel}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)} flex-shrink-0`}>
                    {complaint.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {complaint.issue}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{complaint.type}</span>
                  <span>•</span>
                  <span>{complaint.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;