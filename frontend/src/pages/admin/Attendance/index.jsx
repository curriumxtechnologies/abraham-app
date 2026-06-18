import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Download,
  TrendingUp,
  TrendingDown,
  X,
  Activity
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const AdminAttendance = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [sortBy, setSortBy] = useState('time');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [attendanceRecords] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      status: 'check-in',
      date: 'Jun 18, 2026',
      time: '08:30 AM',
      location: 'Main Entrance',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      studentId: 'STU/2024/002',
      hostelName: 'Hostel B',
      roomNumber: 'Room 7',
      status: 'check-out',
      date: 'Jun 18, 2026',
      time: '07:45 AM',
      location: 'Main Entrance',
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      studentId: 'STU/2024/003',
      hostelName: 'Hostel A',
      roomNumber: 'Room 2',
      status: 'check-in',
      date: 'Jun 18, 2026',
      time: '09:15 AM',
      location: 'Main Entrance',
    },
    {
      id: 4,
      studentName: 'Sarah Williams',
      studentId: 'STU/2024/004',
      hostelName: 'Hostel C',
      roomNumber: 'Room 5',
      status: 'check-in',
      date: 'Jun 18, 2026',
      time: '07:00 AM',
      location: 'Gate B',
    },
    {
      id: 5,
      studentName: 'David Brown',
      studentId: 'STU/2024/005',
      hostelName: 'Hostel A',
      roomNumber: 'Room 1',
      status: 'check-out',
      date: 'Jun 18, 2026',
      time: '06:30 AM',
      location: 'Main Entrance',
    },
    {
      id: 6,
      studentName: 'Emily Davis',
      studentId: 'STU/2024/006',
      hostelName: 'Hostel B',
      roomNumber: 'Room 8',
      status: 'check-in',
      date: 'Jun 18, 2026',
      time: '08:00 AM',
      location: 'Main Entrance',
    },
    {
      id: 7,
      studentName: 'John Doe',
      studentId: 'STU/2024/001',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      status: 'check-out',
      date: 'Jun 17, 2026',
      time: '10:15 PM',
      location: 'Main Entrance',
    },
    {
      id: 8,
      studentName: 'Jane Smith',
      studentId: 'STU/2024/002',
      hostelName: 'Hostel B',
      roomNumber: 'Room 7',
      status: 'check-in',
      date: 'Jun 17, 2026',
      time: '06:00 PM',
      location: 'Gate B',
    },
  ]);

  const todayRecords = attendanceRecords.filter(r => r.date === 'Jun 18, 2026');
  const todayStats = {
    totalCheckIns: todayRecords.filter(r => r.status === 'check-in').length,
    totalCheckOuts: todayRecords.filter(r => r.status === 'check-out').length,
    currentlyInside: 189,
    currentlyOutside: 67,
  };

  const hostels = ['all', 'Hostel A', 'Hostel B', 'Hostel C'];
  const statuses = ['all', 'check-in', 'check-out'];

  const filteredRecords = attendanceRecords
    .filter(record => {
      if (filterHostel !== 'all' && record.hostelName !== filterHostel) return false;
      if (filterStatus !== 'all' && record.status !== filterStatus) return false;
      if (searchQuery && !record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !record.studentId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterDate === 'today' && record.date !== 'Jun 18, 2026') return false;
      if (filterDate === 'yesterday' && record.date !== 'Jun 17, 2026') return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'time') return b.time.localeCompare(a.time);
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'hostel') return a.hostelName.localeCompare(b.hostelName);
      return 0;
    });

  const handleStudentClick = (record) => {
    setSelectedStudent(record);
    setShowStudentModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'check-in') {
      return {
        text: 'Check In',
        color: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-500',
      };
    }
    return {
      text: 'Check Out',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
    };
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor student check-ins and check-outs in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.totalCheckIns}</p>
          <p className="text-xs text-gray-500 mt-1">Today's Check-ins</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <UserX size={20} className="text-orange-600" />
            </div>
            <TrendingDown size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.totalCheckOuts}</p>
          <p className="text-xs text-gray-500 mt-1">Today's Check-outs</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.currentlyInside}</p>
          <p className="text-xs text-gray-500 mt-1">Currently Inside</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.currentlyOutside}</p>
          <p className="text-xs text-gray-500 mt-1">Currently Outside</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              {hostels.map(h => (
                <option key={h} value={h}>{h === 'all' ? 'All Hostels' : h}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              {statuses.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Status' : s === 'check-in' ? 'Check In' : 'Check Out'}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="time">Sort by Time</option>
              <option value="name">Sort by Name</option>
              <option value="hostel">Sort by Hostel</option>
            </select>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex gap-2">
          {[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterDate(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterDate === filter.value
                  ? 'bg-[#0E2F76] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const statusInfo = getStatusBadge(record.status);
                return (
                  <tr 
                    key={record.id}
                    onClick={() => handleStudentClick(record)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0E2F76]/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0E2F76]">
                            {record.studentName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{record.studentName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{record.studentId}</td>
                    <td className="p-4 text-sm text-gray-600">{record.hostelName}</td>
                    <td className="p-4 text-sm text-gray-600">{record.roomNumber}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        <p>{record.date}</p>
                        <p className="text-xs text-gray-400">{record.time}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{record.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Records Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or date range</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStudentModal(false)} />
          
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Attendance Detail</h2>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {(() => {
                const statusInfo = getStatusBadge(selectedStudent.status);
                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {selectedStudent.studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedStudent.studentName}</h3>
                        <p className="text-sm text-gray-500">{selectedStudent.studentId}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${statusInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hostel Info</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedStudent.hostelName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedStudent.roomNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Scan Info</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedStudent.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedStudent.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedStudent.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAttendance;