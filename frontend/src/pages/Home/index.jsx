import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
  LogIn,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import FloatingShapes from '../../components/common/FloatingShapes';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/buttons/Button';
// ─── API hooks ───
import { useGetUserInfoQuery } from '../../slices/userApiSlice';
import {
  useGetMyAllocationQuery,
  useGetHostelsQuery,
  useAllocateBunkMutation,
  useGetAllBunksQuery, // ✅ added
} from '../../slices/hostelApiSlice';
import { useGetMyHistoryQuery } from '../../slices/checkInApiSlice';
import { useGetComplaintsQuery } from '../../slices/complaintApiSlice';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Modal state ─────────────────────────────────────────────
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [selectedBunkId, setSelectedBunkId] = useState(null);
  const [allocating, setAllocating] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState('');

  // ─── Queries ──────────────────────────────────────────────────
  const { data: userData, isLoading: userLoading, error: userError, refetch: refetchUser } = useGetUserInfoQuery();
  const { data: allocationData, isLoading: allocLoading, refetch: refetchAllocation } = useGetMyAllocationQuery();
  const { data: historyData, isLoading: historyLoading } = useGetMyHistoryQuery(undefined, {
    skip: !allocationData?.data,
  });
  const { data: complaintsData, isLoading: complaintsLoading } = useGetComplaintsQuery();
  const {
    data: hostelsData,
    isLoading: hostelsLoading,
    refetch: refetchHostels,
  } = useGetHostelsQuery(undefined, {
    skip: !showHostelModal,
  });

  // ✅ Fetch all bunks separately (fallback)
  const {
    data: allBunksData,
    isLoading: bunksLoading,
    refetch: refetchAllBunks,
  } = useGetAllBunksQuery(undefined, {
    skip: !showHostelModal,
  });

  // ─── Mutation ───────────────────────────────────────────────
  const [allocateBunk, { isLoading: allocateLoading }] = useAllocateBunkMutation();

  // ─── Derived state ────────────────────────────────────────────
  const user = userData?.user;
  const allocatedBunk = allocationData?.data;
  const checkInHistory = historyData?.data || [];
  const complaints = complaintsData?.data || [];
  const hostels = hostelsData?.data || [];

  // Determine current status (inside/outside) from most recent check-in
  const latestRecord = checkInHistory.length > 0 ? checkInHistory[0] : null;
  const isInside = allocatedBunk ? (latestRecord ? !!latestRecord.returnTime : true) : null;

  // ─── Memoized lists for dropdowns ────────────────────────────
  const hostelOptions = useMemo(() => hostels, [hostels]);

  const buildingOptions = useMemo(() => {
    if (!selectedHostelId) return [];
    const hostel = hostels.find((h) => h._id === selectedHostelId);
    return hostel?.buildings || [];
  }, [selectedHostelId, hostels]);

  // ✅ Merge bunks from allBunksData into rooms
  const roomOptions = useMemo(() => {
    if (!selectedBuildingId) return [];
    const hostel = hostels.find((h) => h._id === selectedHostelId);
    const building = hostel?.buildings?.find((b) => b._id === selectedBuildingId);
    const rooms = building?.rooms || [];

    // If we have bunks from the separate query, attach them
    if (allBunksData?.data) {
      const bunkMap = {};
      allBunksData.data.forEach((bunk) => {
        const roomId = bunk.roomId?._id || bunk.roomId;
        if (!bunkMap[roomId]) bunkMap[roomId] = [];
        bunkMap[roomId].push(bunk);
      });
      // Add bunks to each room
      return rooms.map((room) => ({
        ...room,
        bunks: bunkMap[room._id] || room.bunks || [], // prefer existing, else fallback
      }));
    }
    return rooms;
  }, [selectedHostelId, selectedBuildingId, hostels, allBunksData]);

  // ─── Debug log ──────────────────────────────────────────────
  useEffect(() => {
    if (hostelsData?.data && selectedHostelId) {
      const hostel = hostelsData.data.find((h) => h._id === selectedHostelId);
      console.log('🏢 Selected hostel:', hostel);
      if (hostel?.buildings) {
        hostel.buildings.forEach((b) => {
          console.log(`  - ${b.name}: ${b.rooms?.length || 0} rooms`);
          b.rooms?.forEach((room) => {
            console.log(`    Room ${room.roomNumber}: ${room.bunks?.length || 0} bunks`);
          });
        });
      }
    }
  }, [hostelsData, selectedHostelId]);

  // Auto-select first hostel/building if only one available
  useEffect(() => {
    if (showHostelModal && !selectedHostelId && hostelOptions.length === 1) {
      setSelectedHostelId(hostelOptions[0]._id);
    }
  }, [showHostelModal, hostelOptions, selectedHostelId]);

  useEffect(() => {
    if (selectedHostelId && !selectedBuildingId && buildingOptions.length === 1) {
      setSelectedBuildingId(buildingOptions[0]._id);
    }
  }, [selectedHostelId, buildingOptions, selectedBuildingId]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!showHostelModal) {
      setSelectedBunkId(null);
      setSelectedHostelId('');
      setSelectedBuildingId('');
    }
  }, [showHostelModal]);

  // ─── Recent activities ──────────────────────────────────────
  const recentActivities = useMemo(() => {
    if (!allocatedBunk) return [];
    const activities = [];
    if (latestRecord) {
      const isCheckIn = !!latestRecord.returnTime;
      activities.push({
        id: 'latest-check',
        type: isCheckIn ? 'check-in' : 'check-out',
        title: isCheckIn ? 'Checked In' : 'Checked Out',
        description: isCheckIn
          ? `You returned to Room ${allocatedBunk.roomId?.roomNumber || allocatedBunk.roomNumber}`
          : `You left Room ${allocatedBunk.roomId?.roomNumber || allocatedBunk.roomNumber}`,
        time: new Date(isCheckIn ? latestRecord.returnTime : latestRecord.checkoutTime).toLocaleString(),
        icon: isCheckIn ? LogIn : LogOut,
        color: isCheckIn ? 'text-green-500' : 'text-orange-500',
        bgColor: isCheckIn ? 'bg-green-50' : 'bg-orange-50',
      });
    }
    if (complaints.length > 0) {
      const latestComplaint = complaints[0];
      activities.push({
        id: 'latest-complaint',
        type: 'complaint',
        title: latestComplaint.status === 'done' ? 'Complaint Resolved' : 'Complaint Submitted',
        description: latestComplaint.title || 'Complaint update',
        time: new Date(latestComplaint.createdAt).toLocaleString(),
        icon: latestComplaint.status === 'done' ? CheckCircle2 : AlertCircle,
        color: latestComplaint.status === 'done' ? 'text-blue-500' : 'text-yellow-500',
        bgColor: latestComplaint.status === 'done' ? 'bg-blue-50' : 'bg-yellow-50',
      });
    }
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities.slice(0, 4);
  }, [latestRecord, complaints, allocatedBunk]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleSelectBunk = (bunkId) => {
    setSelectedBunkId(bunkId);
  };

  const handleConfirmAllocation = async () => {
    if (!selectedBunkId) return;
    setAllocating(true);
    try {
      const result = await allocateBunk({ bunkId: selectedBunkId }).unwrap();
      if (result.success) {
        await refetchAllocation();
        await refetchUser();
        setShowHostelModal(false);
        setSelectedBunkId(null);
        setSelectedHostelId('');
        setSelectedBuildingId('');
      } else {
        alert(result.message || 'Allocation failed');
      }
    } catch (error) {
      alert(error?.data?.message || 'An error occurred during allocation');
    } finally {
      setAllocating(false);
    }
  };

  // ─── Custom Dropdown ──────────────────────────────────────────
  const CustomDropdown = ({ options, value, onChange, placeholder, label, disabled }) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((opt) => opt._id === value);

    return (
      <div className="relative">
        {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2F76]/10 transition-all duration-200 ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300'
          }`}
          disabled={disabled}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.name || selectedOption.roomNumber : placeholder}
          </span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && !disabled && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No options available</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt._id}
                  type="button"
                  onClick={() => {
                    onChange(opt._id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#AAC0E1]/10 transition-all duration-200 ${
                    opt._id === value ? 'bg-[#AAC0E1]/20 text-[#0E2F76] font-medium' : 'text-gray-700'
                  }`}
                >
                  {opt.name || opt.roomNumber}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Loading / Error states ──────────────────────────────────
  if (userLoading || allocLoading || historyLoading || complaintsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#AAC0E1] border-t-[#0E2F76] rounded-full animate-spin" />
            <p className="text-[#0E2F76]/60 text-sm font-inter">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (userError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-inter">Failed to load user data. Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#0E2F76] text-white rounded-[12px] text-sm font-medium hover:bg-[#0a2560]"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ─── UI helpers ──────────────────────────────────────────────
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      read: 'bg-blue-50 text-blue-600 border-blue-200',
      done: 'bg-green-50 text-green-600 border-green-200',
    };
    return colors[status] || colors.pending;
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <MainLayout>
      <FloatingShapes />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">
                Hello, {user?.fullName?.split(' ')[0] || 'User'} 👋
              </h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-0.5">
                {user?.studentId || ''}
              </p>
            </div>
            <button className="relative w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#AAC0E1]/20 hover:bg-white/80 transition-all duration-300">
              <Bell size={20} className="text-[#0E2F76]" strokeWidth={2} />
            </button>
          </div>

          {/* Allocation Status Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">Hostel Allocation</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  allocatedBunk ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {allocatedBunk ? 'Allocated' : 'Not Allocated'}
              </span>
            </div>

            {allocatedBunk ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                    <Home size={18} className="text-[#0E2F76]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0E2F76]">
                      Room {allocatedBunk.roomId?.roomNumber || allocatedBunk.roomNumber}
                    </p>
                    <p className="text-xs text-[#0E2F76]/50">Bunk {allocatedBunk.bunkNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                    <User size={18} className="text-[#0E2F76]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0E2F76]">{user?.department || ''}</p>
                    <p className="text-xs text-[#0E2F76]/50">Level {user?.yearOfStudy || ''}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowHostelModal(true)}
                className="w-full py-3 bg-[#0E2F76] text-white rounded-[16px] text-sm font-semibold hover:bg-[#0a2560] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Bed size={16} /> Select Hostel
              </button>
            )}
          </div>

          {/* Status Card */}
          {allocatedBunk && (
            <div
              className={`rounded-[24px] p-5 shadow-sm border mb-4 ${
                isInside ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isInside ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    <MapPin size={22} className={isInside ? 'text-green-600' : 'text-orange-600'} strokeWidth={2} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isInside ? 'text-green-700' : 'text-orange-700'}`}>
                      {isInside ? 'Inside Hostel' : 'Outside Hostel'}
                    </p>
                    <p className="text-xs text-[#0E2F76]/50 mt-0.5">
                      {latestRecord ? (
                        isInside
                          ? `Returned ${new Date(latestRecord.returnTime).toLocaleString()}`
                          : `Left ${new Date(latestRecord.checkoutTime).toLocaleString()}`
                      ) : (
                        'No recent check-in'
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    isInside ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {isInside ? 'CHECKED IN' : 'CHECKED OUT'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions – only if allocated */}
        {allocatedBunk && (
          <div className="px-6 mb-6">
            <h3 className="text-sm font-semibold text-[#0E2F76] mb-3 font-inter">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/qr-scanner')}
                className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center mb-3">
                  <QrCode size={22} className="text-[#0E2F76]" strokeWidth={2} />
                </div>
                <h4 className="text-sm font-semibold text-[#0E2F76] text-left">
                  {isInside ? 'Check Out' : 'Check In'}
                </h4>
                <p className="text-xs text-[#0E2F76]/50 mt-1 text-left">Scan QR code at entrance</p>
              </button>
              <button
                onClick={() => navigate('/attendance-history')}
                className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center mb-3">
                  <Clock size={22} className="text-[#0E2F76]" strokeWidth={2} />
                </div>
                <h4 className="text-sm font-semibold text-[#0E2F76] text-left">History</h4>
                <p className="text-xs text-[#0E2F76]/50 mt-1 text-left">View attendance log</p>
              </button>
            </div>
          </div>
        )}

        {/* Complaints Summary */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">Recent Complaints</h3>
            <button
              onClick={() => navigate('/complaints')}
              className="text-xs text-[#0E2F76]/60 hover:text-[#0E2F76] font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          {complaints.length > 0 ? (
            <div className="space-y-2">
              {complaints.slice(0, 2).map((complaint) => (
                <div
                  key={complaint._id}
                  className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-[#0E2F76]">{complaint.title}</h4>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status === 'pending'
                        ? 'Submitted'
                        : complaint.status === 'read'
                        ? 'In Progress'
                        : 'Resolved'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#0E2F76]/40">{complaint.category}</span>
                    <span className="text-[#AAC0E1]">•</span>
                    <span className="text-xs text-[#0E2F76]/40">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
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

        {/* Recent Activities – only if allocated */}
        {allocatedBunk && (
          <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">Recent Activities</h3>
            </div>
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <activity.icon size={18} className={activity.color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-[#0E2F76]">{activity.title}</h4>
                        <span className="text-[10px] text-[#0E2F76]/40 flex-shrink-0 ml-2">{activity.time}</span>
                      </div>
                      <p className="text-xs text-[#0E2F76]/50 mt-0.5">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#AAC0E1]/20 text-center">
                  <Clock size={32} className="text-[#AAC0E1] mx-auto mb-2" />
                  <p className="text-sm text-[#0E2F76]/50">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Hostel Selection Modal ────────────────────────────── */}
      {showHostelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md max-h-[85vh] overflow-y-auto relative mt-8 md:mt-0">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-[#AAC0E1]/20 flex items-center justify-between rounded-t-[32px]">
              <h2 className="text-xl font-bold text-[#0E2F76] font-inter">Select a Bunk</h2>
              <button
                onClick={() => {
                  setShowHostelModal(false);
                  setSelectedBunkId(null);
                  setSelectedHostelId('');
                  setSelectedBuildingId('');
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#AAC0E1]/10 transition-all"
              >
                <X size={22} className="text-[#0E2F76]" strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {hostelsLoading || bunksLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-[#0E2F76]" />
                </div>
              ) : hostels.length > 0 ? (
                <div className="space-y-4">
                  {/* Hostel Dropdown */}
                  <CustomDropdown
                    label="Select Hostel"
                    options={hostelOptions}
                    value={selectedHostelId}
                    onChange={(id) => {
                      setSelectedHostelId(id);
                      setSelectedBuildingId('');
                      setSelectedBunkId(null);
                    }}
                    placeholder="-- Choose Hostel --"
                    disabled={hostels.length === 1}
                  />

                  {/* Building Dropdown */}
                  <CustomDropdown
                    label="Select Building"
                    options={buildingOptions}
                    value={selectedBuildingId}
                    onChange={(id) => {
                      setSelectedBuildingId(id);
                      setSelectedBunkId(null);
                    }}
                    placeholder="-- Choose Building --"
                    disabled={!selectedHostelId || buildingOptions.length === 1}
                  />

                  {/* Rooms & Bunks */}
                  {selectedBuildingId && (
                    <div className="space-y-3 mt-2">
                      {roomOptions.length > 0 ? (
                        roomOptions.map((room) => {
                          const availableBunks = room.bunks?.filter((b) => b.isAvailable) || [];
                          const allBunks = room.bunks || [];
                          const isFull = allBunks.length > 0 && availableBunks.length === 0;

                          return (
                            <div key={room._id} className="bg-[#F5FEFF] rounded-[16px] p-4 border border-[#AAC0E1]/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-[#0E2F76]">Room {room.roomNumber}</h3>
                                {isFull && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Full</span>
                                )}
                                {!isFull && allBunks.length > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {availableBunks.length} available
                                  </span>
                                )}
                              </div>
                              {availableBunks.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {availableBunks.map((bunk) => (
                                    <button
                                      key={bunk._id}
                                      onClick={() => handleSelectBunk(bunk._id)}
                                      className={`p-3 rounded-[12px] border-2 text-sm font-medium transition-all ${
                                        selectedBunkId === bunk._id
                                          ? 'border-[#0E2F76] bg-[#0E2F76]/5 text-[#0E2F76]'
                                          : 'border-[#AAC0E1]/30 bg-white text-[#0E2F76]/70 hover:border-[#0E2F76]/30'
                                      }`}
                                    >
                                      Bunk {bunk.bunkNumber}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-2">
                                  <p className="text-sm text-[#0E2F76]/40">
                                    {allBunks.length === 0
                                      ? 'No bunks have been added to this room. Contact admin.'
                                      : 'All bunks are occupied.'}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-sm text-[#0E2F76]/50">
                          No rooms found in this building. Contact admin.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bed size={40} className="text-[#AAC0E1] mx-auto mb-3" />
                  <p className="text-[#0E2F76]/60">No hostels or bunks available at the moment.</p>
                  <p className="text-xs text-[#0E2F76]/40 mt-1">Contact admin for assistance.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-5 border-t border-[#AAC0E1]/20 rounded-b-[32px]">
              <Button
                variant="primary"
                fullWidth
                disabled={!selectedBunkId || allocating || allocateLoading}
                onClick={handleConfirmAllocation}
              >
                {allocating || allocateLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> Allocating...
                  </div>
                ) : (
                  'Confirm Allocation'
                )}
              </Button>
              <p className="text-xs text-[#0E2F76]/40 text-center mt-3">
                You can only allocate one bunk. This action is final.
              </p>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;