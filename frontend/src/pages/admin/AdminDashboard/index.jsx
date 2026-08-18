import { useState, useMemo, useEffect } from 'react';
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
  Filter,
  Loader2,
  Plus,
  X,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

// ─── API Hooks ──────────────────────────────────────────────────
import { useGetAllStudentsQuery } from '../../../slices/userApiSlice';
import { useGetAllCheckInsQuery } from '../../../slices/checkInApiSlice';
import { useGetComplaintsQuery } from '../../../slices/complaintApiSlice';
import { useGetAllTransactionsQuery, useSetupRoomsMutation } from '../../../slices/hostelApiSlice';
import { useGetUserInfoQuery } from '../../../slices/userApiSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ─── Queries ──────────────────────────────────────────────────
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useGetAllStudentsQuery();
  const { data: checkInsData, isLoading: checkInsLoading, error: checkInsError } = useGetAllCheckInsQuery();
  const { data: complaintsData, isLoading: complaintsLoading, error: complaintsError } = useGetComplaintsQuery();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetAllTransactionsQuery();
  const { data: userData, isLoading: userLoading } = useGetUserInfoQuery();

  // ─── Setup Rooms Mutation ─────────────────────────────────────
  const [setupRooms, { isLoading: setupLoading }] = useSetupRoomsMutation();

  // ─── Modal State ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [bunkCount, setBunkCount] = useState(4);
  const [price, setPrice] = useState(5000);
  const [roomsList, setRoomsList] = useState([]);
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');

  // ─── Auto-increment room number ──────────────────────────────
  const getNextRoomNumber = () => {
    if (roomsList.length === 0) return 1;
    const maxRoom = Math.max(...roomsList.map(r => r.roomNumber));
    return maxRoom + 1;
  };

  // Pre-fill room number when modal opens or list changes
  useEffect(() => {
    if (showModal) {
      setRoomNumber(getNextRoomNumber().toString());
      setSetupError('');
      setSetupSuccess('');
    }
  }, [showModal, roomsList]);

  // ─── Derived stats (unchanged) ──────────────────────────────
  const stats = useMemo(() => {
    const students = studentsData?.users || [];
    const checkIns = checkInsData?.data || [];
    const complaints = complaintsData?.data || [];

    const totalStudents = students.length;

    const studentCheckInMap = new Map();
    checkIns.forEach(record => {
      const userId = record.user?._id || record.user;
      if (!userId) return;
      const existing = studentCheckInMap.get(userId);
      if (!existing || new Date(record.checkoutTime) > new Date(existing.checkoutTime)) {
        studentCheckInMap.set(userId, record);
      }
    });
    const checkedIn = Array.from(studentCheckInMap.values()).filter(r => !r.returnTime).length;
    const checkedOut = totalStudents - checkedIn;

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const today = new Date().toDateString();
    const resolvedToday = complaints.filter(c => 
      c.status === 'done' && new Date(c.updatedAt).toDateString() === today
    ).length;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDate = new Date();
    const weekData = days.map((_, index) => {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - (6 - index));
      const dateString = date.toDateString();
      const count = checkIns.filter(r => new Date(r.checkoutTime).toDateString() === dateString).length;
      return count;
    });

    return {
      totalStudents,
      checkedIn,
      checkedOut,
      totalComplaints,
      pendingComplaints,
      resolvedToday,
      weekLabels: days,
      weekData,
    };
  }, [studentsData, checkInsData, complaintsData]);

  // ─── Recent Activities (unchanged) ───────────────────────────
  const recentActivities = useMemo(() => {
    const activities = [];
    const checkIns = checkInsData?.data || [];
    const complaints = complaintsData?.data || [];

    checkIns.slice(0, 5).forEach(record => {
      const isCheckIn = !!record.returnTime;
      activities.push({
        id: `check-${record._id}`,
        type: isCheckIn ? 'check-in' : 'check-out',
        student: record.user?.fullName || 'Unknown',
        action: isCheckIn ? 'Checked In' : 'Checked Out',
        hostel: record.bunk ? `Room ${record.bunk.roomNumber}` : 'N/A',
        time: new Date(isCheckIn ? record.returnTime : record.checkoutTime).toLocaleString(),
        icon: isCheckIn ? UserCheck : UserX,
        color: isCheckIn ? 'text-green-600' : 'text-orange-600',
        bgColor: isCheckIn ? 'bg-green-50' : 'bg-orange-50',
      });
    });

    complaints.slice(0, 3).forEach(comp => {
      const isResolved = comp.status === 'done';
      activities.push({
        id: `comp-${comp._id}`,
        type: isResolved ? 'complaint-resolved' : 'complaint',
        student: comp.user?.fullName || 'Anonymous',
        action: isResolved ? 'Complaint Resolved' : 'New Complaint',
        hostel: comp.category || 'General',
        time: new Date(comp.createdAt).toLocaleString(),
        icon: isResolved ? CheckCircle2 : AlertCircle,
        color: isResolved ? 'text-blue-600' : 'text-red-600',
        bgColor: isResolved ? 'bg-blue-50' : 'bg-red-50',
      });
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities.slice(0, 5);
  }, [checkInsData, complaintsData]);

  // ─── Recent Complaints (unchanged) ──────────────────────────
  const recentComplaints = useMemo(() => {
    return (complaintsData?.data || []).slice(0, 3).map(comp => ({
      id: comp._id,
      student: comp.user?.fullName || 'Anonymous',
      hostel: comp.category || 'General',
      issue: comp.title,
      type: comp.category || 'General',
      status: comp.status === 'pending' ? 'Submitted' :
              comp.status === 'read' ? 'Acknowledged' : 'Resolved',
      date: new Date(comp.createdAt).toLocaleDateString(),
    }));
  }, [complaintsData]);

  // ─── Hostel Occupancy (placeholder) ─────────────────────────
  const hostelStats = useMemo(() => {
    return [
      { name: 'Total Bunks', total: 0, occupied: 0, available: 0, color: 'bg-[#0E2F76]' },
    ];
  }, []);

  // ─── Modal Handlers ──────────────────────────────────────────
  const handleAddRoom = () => {
    const roomNum = parseInt(roomNumber);
    if (!roomNum || roomNum <= 0) {
      setSetupError('Please enter a valid room number');
      return;
    }
    if (roomsList.some(r => r.roomNumber === roomNum)) {
      setSetupError(`Room ${roomNum} is already in the list`);
      return;
    }
    if (bunkCount < 1) {
      setSetupError('Bunk count must be at least 1');
      return;
    }
    if (price < 1) {
      setSetupError('Price must be a positive number');
      return;
    }
    const bunks = Array.from({ length: bunkCount }, (_, i) => i + 1);
    setRoomsList(prev => [...prev, { roomNumber: roomNum, bunks, price }]);
    setSetupError('');
    // Auto-increment for next room
    setRoomNumber((roomNum + 1).toString());
  };

  const handleRemoveRoom = (index) => {
    setRoomsList(prev => prev.filter((_, i) => i !== index));
    // Optionally reset error
    setSetupError('');
  };

  const handleSubmitRooms = async () => {
    if (roomsList.length === 0) {
      setSetupError('Please add at least one room');
      return;
    }
    setSetupError('');
    setSetupSuccess('');
    try {
      const result = await setupRooms({ rooms: roomsList }).unwrap();
      setSetupSuccess(result.message || 'Rooms created successfully!');
      setRoomsList([]);
      setTimeout(() => {
        setShowModal(false);
        setSetupSuccess('');
      }, 2000);
    } catch (error) {
      setSetupError(error?.data?.message || 'Failed to create rooms');
    }
  };

  // ─── Loading / Error states ──────────────────────────────────
  const isLoading = studentsLoading || checkInsLoading || complaintsLoading || transactionsLoading || userLoading;
  const hasError = studentsError || checkInsError || complaintsError;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#0E2F76]" />
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (hasError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
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

  // ─── Stat Cards ──────────────────────────────────────────────
  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${stats.checkedIn} inside`,
      changeType: 'neutral',
    },
    {
      title: 'Checked In Now',
      value: stats.checkedIn,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${Math.round((stats.checkedIn / (stats.totalStudents || 1)) * 100)}%`,
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
      change: `${stats.resolvedToday} resolved today`,
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
              Welcome back, {userData?.user?.fullName || 'Administrator'}. Here's what's happening across your hostels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0E2F76] text-white rounded-xl text-sm font-medium hover:bg-[#0a2560] transition-all duration-200"
            >
              <Plus size={16} />
              Manage Hostels
            </button>
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

      {/* Stats Grid (unchanged) */}
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
                <span className="text-sm font-medium text-gray-500">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Three Column Layout (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
          <div className="flex items-end justify-between h-48 gap-2">
            {stats.weekData.map((value, index) => {
              const maxValue = Math.max(...stats.weekData, 1);
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
                  <span className="text-xs text-gray-500">{stats.weekLabels[index]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Occupancy</h3>
            <button className="text-sm text-[#0E2F76] font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {hostelStats.length > 0 ? hostelStats.map((hostel, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{hostel.name}</span>
                  <span className="text-sm text-gray-500">{hostel.occupied}/{hostel.total}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hostel.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(hostel.occupied / (hostel.total || 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{hostel.available} beds available</p>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500">
                <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No occupancy data available</p>
                <p className="text-xs text-gray-400 mt-1">Bunk allocation data will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities & Complaints (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
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
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Activity size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>

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
            {recentComplaints.length > 0 ? recentComplaints.map((complaint) => (
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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    complaint.status === 'Submitted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    complaint.status === 'Acknowledged' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  } flex-shrink-0`}>
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
            )) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No complaints yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Manage Hostels Modal ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Manage Hostels</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Form to add a room */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                    <input
                      type="number"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Auto-filled"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                    />
                    <p className="text-xs text-gray-400 mt-1">Next available: {getNextRoomNumber()}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Number of Bunks</label>
                    <input
                      type="number"
                      value={bunkCount}
                      onChange={(e) => setBunkCount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                      placeholder="e.g., 5000"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddRoom}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#0E2F76] text-white rounded-lg text-sm font-medium hover:bg-[#0a2560] transition"
                >
                  <Plus size={16} />
                  Add Room to List
                </button>
                {setupError && (
                  <p className="mt-2 text-xs text-red-500">{setupError}</p>
                )}
              </div>

              {/* Rooms list */}
              {roomsList.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Rooms to Create</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {roomsList.map((room, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <div>
                          <span className="font-medium text-gray-900">Room {room.roomNumber}</span>
                          <span className="text-sm text-gray-500 ml-3">
                            {room.bunks.length} bunks • ₦{room.price.toLocaleString()}
                          </span>
                        </div>
                        <button onClick={() => handleRemoveRoom(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  {setupSuccess && <p className="text-xs text-green-600">{setupSuccess}</p>}
                  {setupError && <p className="text-xs text-red-500">{setupError}</p>}
                </div>
                <button
                  onClick={handleSubmitRooms}
                  disabled={roomsList.length === 0 || setupLoading}
                  className="px-6 py-2.5 bg-[#0E2F76] text-white rounded-lg text-sm font-medium hover:bg-[#0a2560] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {setupLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Rooms'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;