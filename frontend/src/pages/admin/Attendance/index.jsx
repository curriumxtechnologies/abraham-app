import { useState, useMemo, useRef } from 'react';
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
  Activity,
  QrCode,
  Printer,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';
import QRCode from 'react-qr-code';

// ─── API Hooks ──────────────────────────────────────────────────
import { useGetAllCheckInsQuery } from '../../../slices/checkInApiSlice';
import { useGetAllStudentsQuery } from '../../../slices/userApiSlice';

const AdminAttendance = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);

  // ─── State ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [sortBy, setSortBy] = useState('time');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────
  const {
    data: checkInsData,
    isLoading: checkInsLoading,
    error: checkInsError,
  } = useGetAllCheckInsQuery();

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetAllStudentsQuery();

  // ─── Build enriched attendance records ──────────────────────
  const attendanceRecords = useMemo(() => {
    if (!checkInsData?.data || !studentsData?.users) return [];

    // Map student ID -> student object for quick lookup
    const studentMap = {};
    studentsData.users.forEach((s) => {
      studentMap[s._id] = s;
    });

    return checkInsData.data.map((record) => {
      const student = studentMap[record.user?._id || record.user];
      const bunk = record.bunk || {};
      return {
        id: record._id,
        studentName: student?.fullName || 'Unknown',
        studentId: student?.studentId || 'N/A',
        hostelName: bunk?.roomNumber ? `Room ${bunk.roomNumber}` : 'Not Allocated',
        roomNumber: bunk?.roomNumber || 'N/A',
        status: record.returnTime ? 'check-out' : 'check-in',
        date: new Date(record.checkoutTime).toLocaleDateString(),
        time: new Date(record.checkoutTime).toLocaleTimeString(),
        location: 'Main Entrance', // placeholder
        returnTime: record.returnTime,
      };
    });
  }, [checkInsData, studentsData]);

  // ─── Today's statistics ──────────────────────────────────────
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = attendanceRecords.filter(
      (r) => new Date(r.date).toDateString() === today
    );
    const checkIns = todayRecords.filter((r) => r.status === 'check-in').length;
    const checkOuts = todayRecords.filter((r) => r.status === 'check-out').length;
    // Currently inside: students whose latest record is check-in
    const latestPerStudent = {};
    attendanceRecords.forEach((r) => {
      const key = r.studentId;
      if (!latestPerStudent[key] || new Date(r.date) > new Date(latestPerStudent[key].date)) {
        latestPerStudent[key] = r;
      }
    });
    const inside = Object.values(latestPerStudent).filter((r) => r.status === 'check-in').length;
    const outside = Object.values(latestPerStudent).filter((r) => r.status === 'check-out').length;

    return {
      totalCheckIns: checkIns,
      totalCheckOuts: checkOuts,
      currentlyInside: inside,
      currentlyOutside: outside,
    };
  }, [attendanceRecords]);

  // ─── Filter and sort ──────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return attendanceRecords
      .filter((record) => {
        if (filterHostel !== 'all' && record.hostelName !== filterHostel) return false;
        if (filterStatus !== 'all' && record.status !== filterStatus) return false;
        if (searchQuery && !record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !record.studentId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterDate === 'today') {
          const today = new Date().toDateString();
          return new Date(record.date).toDateString() === today;
        }
        if (filterDate === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return new Date(record.date).toDateString() === yesterday.toDateString();
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
        if (sortBy === 'hostel') return a.hostelName.localeCompare(b.hostelName);
        return 0;
      });
  }, [attendanceRecords, filterHostel, filterStatus, searchQuery, filterDate, sortBy]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleStudentClick = (record) => {
    setSelectedRecord(record);
    setShowStudentModal(true);
  };

  const handlePrintQR = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        const content = printRef.current.innerHTML;
        printWindow.document.write(`
          <html>
            <head>
              <title>Entrance QR Code</title>
              <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: white; }
                .qr-container { text-align: center; padding: 20px; }
                .qr-container h2 { margin-bottom: 10px; color: #1a1a2e; }
                .qr-container p { color: #666; margin: 5px 0; }
                .qr-code { display: flex; justify-content: center; margin: 20px 0; }
                .qr-footer { margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleCopyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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

  // ─── QR token (central) ──────────────────────────────────────
  const entranceToken = 'HOSTEL-ENTRANCE-001'; // In production, use a JWT from backend

  // ─── Loading / Error states ──────────────────────────────────
  if (checkInsLoading || studentsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#0E2F76]" />
          <span className="ml-3 text-gray-600">Loading attendance data...</span>
        </div>
      </AdminLayout>
    );
  }

  if (checkInsError || studentsError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load data. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#0E2F76] text-white rounded-xl text-sm font-medium hover:bg-[#0a2560]"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* ─── QR Code Display Card ───────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Entrance QR Code</h2>
            <p className="text-sm text-gray-500 mt-1">
              Students scan this QR code at the entrance to check in/out.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0E2F76] text-white rounded-xl text-sm font-medium hover:bg-[#0a2560] transition-all duration-200"
              >
                <QrCode size={18} />
                View QR Code
              </button>
              <button
                onClick={handlePrintQR}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
          <div className="flex justify-center p-3 bg-gray-50 rounded-xl border border-gray-200">
            <QRCode value={entranceToken} size={120} bgColor="#ffffff" fgColor="#0E2F76" />
          </div>
        </div>
      </div>

      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500 mt-1">
              {attendanceRecords.length} total records • {todayStats.currentlyInside} inside • {todayStats.currentlyOutside} outside
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────── */}
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

      {/* ─── Filters Bar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="all">All Hostels</option>
              <option value="Room 1">Room 1</option>
              <option value="Room 2">Room 2</option>
              <option value="Room 3">Room 3</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0E2F76]"
            >
              <option value="all">All Status</option>
              <option value="check-in">Check In</option>
              <option value="check-out">Check Out</option>
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
        <div className="flex gap-2">
          {['today', 'yesterday', 'week', 'month'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterDate(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterDate === filter
                  ? 'bg-[#0E2F76] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
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

      {/* ─── QR Code Modal (central) ────────────────────────────── */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQRModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Entrance QR Code</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div ref={printRef} className="text-center">
                <div className="flex justify-center my-4">
                  <QRCode value={entranceToken} size={200} bgColor="#ffffff" fgColor="#0E2F76" />
                </div>
                <p className="text-sm text-gray-600">Scan to check in/out</p>
                <p className="text-xs text-gray-400 mt-2">Token: {entranceToken}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handlePrintQR}
                  className="flex-1 py-3 bg-[#0E2F76] text-white rounded-xl font-semibold text-sm hover:bg-[#0a2560] flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Print
                </button>
                <button
                  onClick={() => handleCopyToken(entranceToken)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <><Check size={18} className="text-green-500" /> Copied!</>
                  ) : (
                    <><Copy size={18} /> Copy Token</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Student Detail Modal ───────────────────────────────── */}
      {showStudentModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStudentModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Attendance Detail</h2>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{selectedRecord.studentName.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedRecord.studentName}</h3>
                  <p className="text-sm text-gray-500">{selectedRecord.studentId}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hostel Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedRecord.hostelName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedRecord.roomNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Scan Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedRecord.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedRecord.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-gray-700">{selectedRecord.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAttendance;