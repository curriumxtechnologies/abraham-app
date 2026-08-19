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
  Home,
  Layers,
  DoorOpen,
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

// ─── API Hooks ──────────────────────────────────────────────────
import { useGetAllStudentsQuery } from '../../../slices/userApiSlice';
import { useGetAllCheckInsQuery } from '../../../slices/checkInApiSlice';
import { useGetComplaintsQuery } from '../../../slices/complaintApiSlice';
import {
  useGetHostelsQuery,
  useGetAllBunksQuery,
  useCreateHostelMutation,
  useCreateBuildingMutation,
  useCreateRoomMutation,
  useDeleteHostelMutation,
} from '../../../slices/hostelApiSlice';
import { useGetUserInfoQuery } from '../../../slices/userApiSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ─── Queries ──────────────────────────────────────────────────
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useGetAllStudentsQuery();
  const { data: checkInsData, isLoading: checkInsLoading, error: checkInsError } = useGetAllCheckInsQuery();
  const { data: complaintsData, isLoading: complaintsLoading, error: complaintsError } = useGetComplaintsQuery();
  const { data: userData, isLoading: userLoading } = useGetUserInfoQuery();

  // ─── Hostel Management Queries ──────────────────────────────
  const { data: hostelsData, isLoading: hostelsLoading, refetch: refetchHostels } = useGetHostelsQuery();
  const { data: allBunksData, isLoading: bunksLoading, refetch: refetchBunks } = useGetAllBunksQuery();

  // ─── Mutations ─────────────────────────────────────────────────
  const [createHostel, { isLoading: creatingHostel }] = useCreateHostelMutation();
  const [createBuilding, { isLoading: creatingBuilding }] = useCreateBuildingMutation();
  const [createRoom, { isLoading: creatingRoom }] = useCreateRoomMutation();
  const [deleteHostel, { isLoading: deletingHostel }] = useDeleteHostelMutation();

  // ─── Modal State ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);

  // New Hostel
  const [newHostelName, setNewHostelName] = useState('');
  const [newHostelType, setNewHostelType] = useState('male');
  const [newHostelDesc, setNewHostelDesc] = useState('');

  // New Building
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newBuildingDesc, setNewBuildingDesc] = useState('');

  // New Room
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBunkCount, setNewBunkCount] = useState(4);
  const [newRoomPrice, setNewRoomPrice] = useState(5000);

  // UI state
  const [activeTab, setActiveTab] = useState('hostels'); // 'hostels', 'buildings', 'rooms'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ─── Reset modal state on close ──────────────────────────────
  useEffect(() => {
    if (!showModal) {
      setNewHostelName('');
      setNewHostelType('male');
      setNewHostelDesc('');
      setSelectedHostelId('');
      setNewBuildingName('');
      setNewBuildingDesc('');
      setSelectedBuildingId('');
      setNewRoomNumber('');
      setNewBunkCount(4);
      setNewRoomPrice(5000);
      setActiveTab('hostels');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [showModal]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleCreateHostel = async () => {
    if (!newHostelName.trim()) {
      setErrorMsg('Hostel name is required');
      return;
    }
    try {
      await createHostel({ name: newHostelName, type: newHostelType, description: newHostelDesc }).unwrap();
      setSuccessMsg('Hostel created successfully!');
      setNewHostelName('');
      setNewHostelDesc('');
      await refetchHostels();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error?.data?.message || 'Failed to create hostel');
    }
  };

  const handleCreateBuilding = async () => {
    if (!selectedHostelId) {
      setErrorMsg('Please select a hostel');
      return;
    }
    if (!newBuildingName.trim()) {
      setErrorMsg('Building name is required');
      return;
    }
    try {
      await createBuilding({ hostelId: selectedHostelId, name: newBuildingName, description: newBuildingDesc }).unwrap();
      setSuccessMsg('Building created successfully!');
      setNewBuildingName('');
      setNewBuildingDesc('');
      await refetchHostels();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error?.data?.message || 'Failed to create building');
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedBuildingId) {
      setErrorMsg('Please select a building');
      return;
    }
    if (!newRoomNumber.trim()) {
      setErrorMsg('Room number is required');
      return;
    }
    if (newBunkCount < 1) {
      setErrorMsg('Bunk count must be at least 1');
      return;
    }
    try {
      await createRoom({
        buildingId: selectedBuildingId,
        roomNumber: newRoomNumber,
        bunkCount: newBunkCount,
        price: newRoomPrice,
      }).unwrap();
      setSuccessMsg(`Room ${newRoomNumber} created with ${newBunkCount} bunks!`);
      setNewRoomNumber('');
      setNewBunkCount(4);
      setNewRoomPrice(5000);
      await refetchHostels();
      await refetchBunks();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error?.data?.message || 'Failed to create room');
    }
  };

  const handleDeleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to delete this hostel and all its buildings/rooms/bunks?')) return;
    try {
      await deleteHostel(hostelId).unwrap();
      setSuccessMsg('Hostel deleted successfully!');
      await refetchHostels();
      await refetchBunks();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error?.data?.message || 'Failed to delete hostel');
    }
  };

  // ─── Derived stats ────────────────────────────────────────────
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
    const resolvedToday = complaints.filter(c => c.status === 'done' && new Date(c.updatedAt).toDateString() === today).length;

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

  // ─── Recent Activities ──────────────────────────────────────
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

  // ─── Recent Complaints ──────────────────────────────────────
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

  // ─── Occupancy from all bunks ──────────────────────────────
  const occupancyStats = useMemo(() => {
    if (!allBunksData?.data) return [];
    // Group by hostel -> building -> room
    const map = {};
    allBunksData.data.forEach(bunk => {
      const hostel = bunk.roomId?.buildingId?.hostelId?.name || 'Unknown Hostel';
      const building = bunk.roomId?.buildingId?.name || 'Unknown Building';
      const room = bunk.roomId?.roomNumber || 'Unknown Room';
      const key = `${hostel}|${building}|${room}`;
      if (!map[key]) {
        map[key] = { hostel, building, room, total: 0, occupied: 0 };
      }
      map[key].total++;
      if (!bunk.isAvailable) map[key].occupied++;
    });
    return Object.values(map);
  }, [allBunksData]);

  // ─── Loading / Error states ──────────────────────────────────
  const isLoading = studentsLoading || checkInsLoading || complaintsLoading || userLoading;
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
    },
    {
      title: 'Checked In Now',
      value: stats.checkedIn,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${Math.round((stats.checkedIn / (stats.totalStudents || 1)) * 100)}%`,
    },
    {
      title: 'Checked Out',
      value: stats.checkedOut,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Outside',
    },
    {
      title: 'Pending Complaints',
      value: stats.pendingComplaints,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: `${stats.resolvedToday} resolved today`,
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
                <span className="text-sm font-medium text-gray-500">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Chart */}
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

        {/* Occupancy Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Occupancy</h3>
            <button className="text-sm text-[#0E2F76] font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {occupancyStats.length > 0 ? occupancyStats.slice(0, 5).map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.hostel} - {item.building}</span>
                  <span className="text-gray-500">{item.occupied}/{item.total}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Room {item.room}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className={item.occupied === item.total ? 'text-red-500' : 'text-green-500'}>
                    {item.occupied === item.total ? 'Full' : `${item.total - item.occupied} available`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${item.occupied === item.total ? 'bg-red-500' : 'bg-[#0E2F76]'}`}
                    style={{ width: `${(item.occupied / item.total) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500">
                <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No rooms set up yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Manage Hostels" to add rooms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <p className="text-sm text-gray-500">Latest student actions</p>
            </div>
            <button className="text-sm text-[#0E2F76] font-medium hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                <div className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon size={18} className={activity.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{activity.action} • {activity.hostel}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{activity.time}</span>
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
            <button onClick={() => navigate('/admin/complaints')} className="text-sm text-[#0E2F76] font-medium hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentComplaints.length > 0 ? recentComplaints.map((complaint) => (
              <div key={complaint.id} onClick={() => navigate(`/admin/complaints/${complaint.id}`)} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{complaint.student}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{complaint.hostel}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    complaint.status === 'Submitted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    complaint.status === 'Acknowledged' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  } flex-shrink-0`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{complaint.issue}</p>
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
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Manage Hostels</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('hostels')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'hostels' ? 'text-[#0E2F76] border-b-2 border-[#0E2F76]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Home size={16} className="inline mr-2" />
                  Hostels
                </button>
                <button
                  onClick={() => setActiveTab('buildings')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'buildings' ? 'text-[#0E2F76] border-b-2 border-[#0E2F76]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Layers size={16} className="inline mr-2" />
                  Buildings
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'rooms' ? 'text-[#0E2F76] border-b-2 border-[#0E2F76]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <DoorOpen size={16} className="inline mr-2" />
                  Rooms
                </button>
              </div>

              {/* Error / Success messages */}
              {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{errorMsg}</div>}
              {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{successMsg}</div>}

              {/* ─── Hostels Tab ────────────────────────────────── */}
              {activeTab === 'hostels' && (
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Create New Hostel</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hostel Name</label>
                        <input
                          type="text"
                          value={newHostelName}
                          onChange={(e) => setNewHostelName(e.target.value)}
                          placeholder="e.g., Boys Hostel A"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={newHostelType}
                          onChange={(e) => setNewHostelType(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
                        <input
                          type="text"
                          value={newHostelDesc}
                          onChange={(e) => setNewHostelDesc(e.target.value)}
                          placeholder="Brief description"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCreateHostel}
                      disabled={creatingHostel}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#0E2F76] text-white rounded-lg text-sm font-medium hover:bg-[#0a2560] transition disabled:opacity-50"
                    >
                      {creatingHostel ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {creatingHostel ? 'Creating...' : 'Add Hostel'}
                    </button>
                  </div>

                  {/* List existing hostels */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Existing Hostels</h4>
                    {hostelsLoading ? (
                      <div className="text-center py-4"><Loader2 size={24} className="animate-spin text-[#0E2F76] mx-auto" /></div>
                    ) : hostelsData?.data?.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {hostelsData.data.map(hostel => (
                          <div key={hostel._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <div>
                              <span className="font-medium text-gray-900">{hostel.name}</span>
                              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${hostel.type === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {hostel.type}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">{hostel.buildings?.length || 0} buildings</span>
                            </div>
                            <button
                              onClick={() => handleDeleteHostel(hostel._id)}
                              disabled={deletingHostel}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              {deletingHostel ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No hostels created yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Buildings Tab ──────────────────────────────── */}
              {activeTab === 'buildings' && (
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Create New Building</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Select Hostel</label>
                        <select
                          value={selectedHostelId}
                          onChange={(e) => setSelectedHostelId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        >
                          <option value="">Select a hostel</option>
                          {hostelsData?.data?.map(hostel => (
                            <option key={hostel._id} value={hostel._id}>{hostel.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Building Name</label>
                        <input
                          type="text"
                          value={newBuildingName}
                          onChange={(e) => setNewBuildingName(e.target.value)}
                          placeholder="e.g., Block A"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
                        <input
                          type="text"
                          value={newBuildingDesc}
                          onChange={(e) => setNewBuildingDesc(e.target.value)}
                          placeholder="Brief description"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCreateBuilding}
                      disabled={creatingBuilding || !selectedHostelId}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#0E2F76] text-white rounded-lg text-sm font-medium hover:bg-[#0a2560] transition disabled:opacity-50"
                    >
                      {creatingBuilding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {creatingBuilding ? 'Creating...' : 'Add Building'}
                    </button>
                  </div>

                  {/* List buildings of selected hostel */}
                  {selectedHostelId && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Buildings in {hostelsData?.data?.find(h => h._id === selectedHostelId)?.name || 'Selected Hostel'}
                      </h4>
                      {hostelsLoading ? (
                        <div className="text-center py-4"><Loader2 size={24} className="animate-spin text-[#0E2F76] mx-auto" /></div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {hostelsData?.data?.find(h => h._id === selectedHostelId)?.buildings?.length > 0 ? (
                            hostelsData.data.find(h => h._id === selectedHostelId).buildings.map(building => (
                              <div key={building._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                <div>
                                  <span className="font-medium text-gray-900">{building.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">{building.rooms?.length || 0} rooms</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No buildings in this hostel yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Rooms Tab ──────────────────────────────────── */}
              {activeTab === 'rooms' && (
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Create New Room</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Select Building</label>
                        <select
                          value={selectedBuildingId}
                          onChange={(e) => setSelectedBuildingId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        >
                          <option value="">Select a building</option>
                          {hostelsData?.data?.flatMap(hostel =>
                            hostel.buildings?.map(building => (
                              <option key={building._id} value={building._id}>
                                {hostel.name} - {building.name}
                              </option>
                            )) || []
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                        <input
                          type="text"
                          value={newRoomNumber}
                          onChange={(e) => setNewRoomNumber(e.target.value)}
                          placeholder="e.g., 101"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Number of Bunks</label>
                        <input
                          type="number"
                          value={newBunkCount}
                          onChange={(e) => setNewBunkCount(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦)</label>
                        <input
                          type="number"
                          value={newRoomPrice}
                          onChange={(e) => setNewRoomPrice(parseInt(e.target.value) || 0)}
                          placeholder="e.g., 5000"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCreateRoom}
                      disabled={creatingRoom || !selectedBuildingId || !newRoomNumber}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#0E2F76] text-white rounded-lg text-sm font-medium hover:bg-[#0a2560] transition disabled:opacity-50"
                    >
                      {creatingRoom ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {creatingRoom ? 'Creating...' : 'Add Room'}
                    </button>
                  </div>

                  {/* List rooms in selected building */}
                  {selectedBuildingId && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Rooms in {hostelsData?.data?.flatMap(h => h.buildings || []).find(b => b._id === selectedBuildingId)?.name || 'Selected Building'}
                      </h4>
                      {hostelsLoading ? (
                        <div className="text-center py-4"><Loader2 size={24} className="animate-spin text-[#0E2F76] mx-auto" /></div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {hostelsData?.data?.flatMap(h => h.buildings || []).find(b => b._id === selectedBuildingId)?.rooms?.length > 0 ? (
                            hostelsData.data.flatMap(h => h.buildings || []).find(b => b._id === selectedBuildingId).rooms.map(room => (
                              <div key={room._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                <div>
                                  <span className="font-medium text-gray-900">Room {room.roomNumber}</span>
                                  <span className="text-sm text-gray-500 ml-2">{room.bunkCount} bunks</span>
                                  <span className={`text-xs ml-2 px-2 py-1 rounded-full ${room.isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {room.isFull ? 'Full' : 'Available'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No rooms in this building yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;