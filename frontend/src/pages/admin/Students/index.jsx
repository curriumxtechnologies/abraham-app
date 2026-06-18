import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  ChevronRight,
  X,
  Building2,
  Bed,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Download,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const AdminStudents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [students] = useState([
    {
      id: 'STU/2024/001',
      name: 'John Doe',
      email: 'johndoe@school.edu',
      phone: '+234 801 234 5678',
      department: 'Computer Science',
      level: '200L',
      gender: 'Male',
      hostelName: 'Hostel A',
      roomNumber: 'Room 3',
      bunkNumber: 'Bunk 2',
      status: 'checked-in',
      lastCheckIn: 'Jun 18, 2026 - 08:30 AM',
      lastCheckOut: 'Jun 17, 2026 - 10:15 PM',
      totalCheckIns: 45,
      totalComplaints: 5,
    },
    {
      id: 'STU/2024/002',
      name: 'Jane Smith',
      email: 'janesmith@school.edu',
      phone: '+234 802 345 6789',
      department: 'Electrical Engineering',
      level: '300L',
      gender: 'Female',
      hostelName: 'Hostel B',
      roomNumber: 'Room 7',
      bunkNumber: 'Bunk 4',
      status: 'checked-out',
      lastCheckIn: 'Jun 17, 2026 - 06:00 PM',
      lastCheckOut: 'Jun 18, 2026 - 07:45 AM',
      totalCheckIns: 32,
      totalComplaints: 2,
    },
    {
      id: 'STU/2024/003',
      name: 'Mike Johnson',
      email: 'mikejohnson@school.edu',
      phone: '+234 803 456 7890',
      department: 'Mechanical Engineering',
      level: '400L',
      gender: 'Male',
      hostelName: 'Hostel A',
      roomNumber: 'Room 2',
      bunkNumber: 'Bunk 1',
      status: 'checked-in',
      lastCheckIn: 'Jun 18, 2026 - 09:15 AM',
      lastCheckOut: 'Jun 17, 2026 - 08:30 PM',
      totalCheckIns: 67,
      totalComplaints: 8,
    },
    {
      id: 'STU/2024/004',
      name: 'Sarah Williams',
      email: 'sarahwilliams@school.edu',
      phone: '+234 804 567 8901',
      department: 'Civil Engineering',
      level: '200L',
      gender: 'Female',
      hostelName: 'Hostel C',
      roomNumber: 'Room 5',
      bunkNumber: 'Bunk 3',
      status: 'checked-in',
      lastCheckIn: 'Jun 18, 2026 - 07:00 AM',
      lastCheckOut: 'Jun 17, 2026 - 06:00 PM',
      totalCheckIns: 28,
      totalComplaints: 1,
    },
    {
      id: 'STU/2024/005',
      name: 'David Brown',
      email: 'davidbrown@school.edu',
      phone: '+234 805 678 9012',
      department: 'Computer Science',
      level: '100L',
      gender: 'Male',
      hostelName: 'Hostel A',
      roomNumber: 'Room 1',
      bunkNumber: 'Bunk 6',
      status: 'checked-out',
      lastCheckIn: 'Jun 17, 2026 - 10:00 PM',
      lastCheckOut: 'Jun 18, 2026 - 06:30 AM',
      totalCheckIns: 15,
      totalComplaints: 0,
    },
    {
      id: 'STU/2024/006',
      name: 'Emily Davis',
      email: 'emilydavis@school.edu',
      phone: '+234 806 789 0123',
      department: 'Biochemistry',
      level: '300L',
      gender: 'Female',
      hostelName: 'Hostel B',
      roomNumber: 'Room 8',
      bunkNumber: 'Bunk 2',
      status: 'checked-in',
      lastCheckIn: 'Jun 18, 2026 - 08:00 AM',
      lastCheckOut: 'Jun 17, 2026 - 09:00 PM',
      totalCheckIns: 41,
      totalComplaints: 3,
    },
  ]);

  const hostels = ['all', 'Hostel A', 'Hostel B', 'Hostel C'];
  const levels = ['all', '100L', '200L', '300L', '400L'];
  const statuses = ['all', 'checked-in', 'checked-out'];

  const filteredStudents = students
    .filter(student => {
      if (filterHostel !== 'all' && student.hostelName !== filterHostel) return false;
      if (filterStatus !== 'all' && student.status !== filterStatus) return false;
      if (filterLevel !== 'all' && student.level !== filterLevel) return false;
      if (searchQuery && !student.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !student.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'level') return a.level.localeCompare(b.level);
      if (sortBy === 'hostel') return a.hostelName.localeCompare(b.hostelName);
      return 0;
    });

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'checked-in') {
      return {
        text: 'Checked In',
        color: 'bg-green-50 text-green-700 border-green-200',
        dot: 'bg-green-500',
      };
    }
    return {
      text: 'Checked Out',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
    };
  };

  const checkedInCount = students.filter(s => s.status === 'checked-in').length;
  const checkedOutCount = students.filter(s => s.status === 'checked-out').length;

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500 mt-1">
              {students.length} registered students • {checkedInCount} checked in • {checkedOutCount} checked out
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{checkedInCount}</p>
              <p className="text-xs text-gray-500">Checked In</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <UserX size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{checkedOutCount}</p>
              <p className="text-xs text-gray-500">Checked Out</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
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
                  {s === 'all' ? 'All Status' : s === 'checked-in' ? 'Checked In' : 'Checked Out'}
                </option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              {levels.map(l => (
                <option key={l} value={l}>{l === 'all' ? 'All Levels' : l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const statusInfo = getStatusBadge(student.status);
                return (
                  <tr 
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0E2F76]/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0E2F76]">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{student.id}</td>
                    <td className="p-4 text-sm text-gray-600">{student.department}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        {student.level}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{student.hostelName}</td>
                    <td className="p-4 text-sm text-gray-600">{student.roomNumber}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Students Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStudentModal(false)} />
          
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedStudent.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.id}</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusBadge(selectedStudent.status).color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedStudent.status).dot}`}></span>
                    {getStatusBadge(selectedStudent.status).text}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedStudent.department} • {selectedStudent.level}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hostel Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedStudent.hostelName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bed size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedStudent.roomNumber} • {selectedStudent.bunkNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedStudent.status === 'checked-in' ? 'Currently Inside' : 'Currently Outside'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{selectedStudent.totalCheckIns}</p>
                    <p className="text-xs text-gray-500">Total Check-ins</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{selectedStudent.totalComplaints}</p>
                    <p className="text-xs text-gray-500">Total Complaints</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>Last Check-in: {selectedStudent.lastCheckIn}</p>
                  <p>Last Check-out: {selectedStudent.lastCheckOut}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStudents;