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
} from 'lucide-react';
import FloatingShapes from '../../components/common/FloatingShapes';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/buttons/Button';
// ─── API hooks ───
import { useGetUserInfoQuery } from '../../slices/userApiSlice';
import { useGetMyAllocationQuery } from '../../slices/hostelApiSlice';
import { useGetMyHistoryQuery } from '../../slices/checkInApiSlice';
import { useGetComplaintsQuery } from '../../slices/complaintApiSlice';
import { useGetAvailableBunksQuery, useInitiatePaymentMutation } from '../../slices/hostelApiSlice';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Modal state ─────────────────────────────────────────────
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [selectedBunk, setSelectedBunk] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────
  const { data: userData, isLoading: userLoading, error: userError } = useGetUserInfoQuery();
  const { data: allocationData, isLoading: allocLoading, refetch: refetchAllocation } = useGetMyAllocationQuery();
  const { data: historyData, isLoading: historyLoading } = useGetMyHistoryQuery(undefined, {
    skip: !allocationData?.data, // only fetch if allocated
  });
  const { data: complaintsData, isLoading: complaintsLoading } = useGetComplaintsQuery();
  const { data: availableBunksData, isLoading: bunksLoading, refetch: refetchBunks } = useGetAvailableBunksQuery(undefined, {
    skip: !showHostelModal,
  });

  // ─── Mutations ───────────────────────────────────────────────
  const [initiatePayment] = useInitiatePaymentMutation();

  // ─── Derived state ────────────────────────────────────────────
  const user = userData?.user;
  const allocatedBunk = allocationData?.data;
  const checkInHistory = historyData?.data || [];
  const complaints = complaintsData?.data || [];

  // Determine current status (inside/outside) from most recent check-in
  const latestRecord = checkInHistory.length > 0 ? checkInHistory[0] : null;
  const isInside = allocatedBunk ? (latestRecord ? !!latestRecord.returnTime : true) : null;

  // ─── Recent activities (only if allocated) ──────────────────
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
          ? `You returned to Room ${allocatedBunk.roomNumber}`
          : `You left Room ${allocatedBunk.roomNumber}`,
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
    setSelectedBunk(bunkId);
  };

  const handleConfirmSelection = async () => {
    if (!selectedBunk) return;
    setPaymentLoading(true);
    try {
      const result = await initiatePayment({ bunkId: selectedBunk }).unwrap();
      if (result.success) {
        // Redirect to Paystack
        window.location.href = result.data.authorization_url;
      } else {
        alert(result.message || 'Payment initiation failed');
      }
    } catch (error) {
      alert(error?.data?.message || 'An error occurred');
    } finally {
      setPaymentLoading(false);
      setShowHostelModal(false);
      setSelectedBunk(null);
    }
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
              className="mt-4 px-6 py-2 bg-[#0E2F76] text-white rounded-[12px] text-sm font-medium hover:bg-[#0a2560] transition-all"
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
              <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">
                Hostel Allocation
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  allocatedBunk
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
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
                      Room {allocatedBunk.roomNumber}
                    </p>
                    <p className="text-xs text-[#0E2F76]/50">
                      Bunk {allocatedBunk.bunkNumber}
                    </p>
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
                <Bed size={16} />
                Select Hostel
              </button>
            )}
          </div>

          {/* Status Card - Inside/Outside (only if allocated) */}
          {allocatedBunk && (
            <div
              className={`rounded-[24px] p-5 shadow-sm border mb-4 ${
                isInside
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isInside ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    <MapPin
                      size={22}
                      className={isInside ? 'text-green-600' : 'text-orange-600'}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isInside ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
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
                    isInside
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
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
            <h3 className="text-sm font-semibold text-[#0E2F76] mb-3 font-inter">
              Quick Actions
            </h3>
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
                <p className="text-xs text-[#0E2F76]/50 mt-1 text-left">
                  Scan QR code at entrance
                </p>
              </button>
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
        )}

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
                  key={complaint._id}
                  onClick={() => navigate(`/complaints/${complaint._id}`)}
                  className="bg-white rounded-[20px] p-4 shadow-sm border border-[#AAC0E1]/20 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-[#0E2F76]">
                      {complaint.title}
                    </h4>
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
              <h3 className="text-sm font-semibold text-[#0E2F76] font-inter">
                Recent Activities
              </h3>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md max-h-[80vh] overflow-y-auto relative animate-slideUp">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-[#AAC0E1]/20 flex items-center justify-between rounded-t-[32px]">
              <h2 className="text-xl font-bold text-[#0E2F76] font-inter">
                Select a Bunk
              </h2>
              <button
                onClick={() => {
                  setShowHostelModal(false);
                  setSelectedBunk(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#AAC0E1]/10 transition-all"
              >
                <X size={22} className="text-[#0E2F76]" strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {bunksLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-[#0E2F76]" />
                </div>
              ) : availableBunksData?.data && Object.keys(availableBunksData.data).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(availableBunksData.data).map(([roomNumber, bunks]) => (
                    <div key={roomNumber} className="bg-[#F5FEFF] rounded-[16px] p-4 border border-[#AAC0E1]/20">
                      <h3 className="text-sm font-semibold text-[#0E2F76] mb-3">
                        Room {roomNumber}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {bunks.map((bunk) => (
                          <button
                            key={bunk._id}
                            onClick={() => handleSelectBunk(bunk._id)}
                            className={`p-3 rounded-[12px] border-2 text-sm font-medium transition-all ${
                              selectedBunk === bunk._id
                                ? 'border-[#0E2F76] bg-[#0E2F76]/5 text-[#0E2F76]'
                                : 'border-[#AAC0E1]/30 bg-white text-[#0E2F76]/70 hover:border-[#0E2F76]/30'
                            }`}
                          >
                            Bunk {bunk.bunkNumber}
                            <span className="block text-xs font-normal text-[#0E2F76]/50 mt-0.5">
                              ₦{bunk.price.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bed size={40} className="text-[#AAC0E1] mx-auto mb-3" />
                  <p className="text-[#0E2F76]/60">No available bunks at the moment.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-5 border-t border-[#AAC0E1]/20 rounded-b-[32px]">
              <Button
                variant="primary"
                fullWidth
                disabled={!selectedBunk || paymentLoading}
                onClick={handleConfirmSelection}
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Confirm Selection & Pay'
                )}
              </Button>
              <p className="text-xs text-[#0E2F76]/40 text-center mt-3">
                You will be redirected to Paystack to complete payment
              </p>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;