import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
  Smartphone,
  Activity,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  ArrowUpRight,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';

// ─── API & Redux ────────────────────────────────────────────────
import { useGetUserInfoQuery } from '../../slices/userApiSlice';
import { useGetMyAllocationQuery } from '../../slices/hostelApiSlice';
import { useGetMyHistoryQuery } from '../../slices/checkInApiSlice';
import { useGetComplaintsQuery } from '../../slices/complaintApiSlice';
import { useLogoutMutation } from '../../slices/userApiSlice';
import { logout } from '../../slices/authSlice';
import { apiSlice } from '../../slices/apiSlice';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Local state ──────────────────────────────────────────────
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserInfoQuery();

  const { data: allocationData, isLoading: allocLoading } = useGetMyAllocationQuery();
  const { data: historyData, isLoading: historyLoading } = useGetMyHistoryQuery(undefined, {
    skip: !allocationData?.data,
  });
  const { data: complaintsData, isLoading: complaintsLoading } = useGetComplaintsQuery();

  // ─── Logout mutation ──────────────────────────────────────────
  const [logoutMutation, { isLoading: logoutLoading }] = useLogoutMutation();

  // ─── Derived state ────────────────────────────────────────────
  const user = userData?.user;
  const allocatedBunk = allocationData?.data;
  const checkInHistory = historyData?.data || [];
  const complaints = complaintsData?.data || [];

  const stats = useMemo(() => {
    const totalCheckIns = checkInHistory.filter((r) => r.returnTime).length;
    const totalCheckOuts = checkInHistory.filter((r) => !r.returnTime).length;
    const totalComplaints = complaints.length;
    let daysInHostel = 0;
    if (checkInHistory.length > 0) {
      const firstRecord = checkInHistory[checkInHistory.length - 1];
      const startDate = new Date(firstRecord.checkoutTime);
      const now = new Date();
      daysInHostel = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    }
    return {
      checkIns: totalCheckIns,
      checkOuts: totalCheckOuts,
      complaintsSubmitted: totalComplaints,
      daysInHostel: daysInHostel || 0,
    };
  }, [checkInHistory, complaints]);

  // ─── Menu items ──────────────────────────────────────────────
  const menuItems = [
    {
      id: 'hostel',
      title: 'Hostel Information',
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      onClick: () => setShowHostelModal(true),
    },
    {
      id: 'attendance',
      title: 'Attendance History',
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      onClick: () => setShowAttendanceModal(true),
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
      onClick: () => setShowHelpModal(true),
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

  // ─── Handlers ──────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
      dispatch(apiSlice.util.resetApiState());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
      dispatch(apiSlice.util.resetApiState());
      navigate('/login');
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────
  if (userLoading || allocLoading || historyLoading || complaintsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#0E2F76]" />
          <p className="text-[#0E2F76]/60 text-sm font-inter ml-4">Loading profile...</p>
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
            <p className="text-red-600 font-inter">Failed to load profile.</p>
            <button
              onClick={refetchUser}
              className="mt-4 px-6 py-2 bg-[#0E2F76] text-white rounded-[12px] text-sm font-medium hover:bg-[#0a2560]"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <MainLayout>
      <FloatingShapes />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">Profile</h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-1">Your account information</p>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#AAC0E1]/20 hover:bg-white/80"
            >
              <Settings size={20} className="text-[#0E2F76]" strokeWidth={2} />
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#0E2F76] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">
                  {user?.fullName?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#0E2F76]">{user?.fullName || 'User'}</h2>
                <p className="text-sm text-[#0E2F76]/50">{user?.studentId || ''}</p>
                <p className="text-sm text-[#0E2F76]/50">{user?.department || ''}</p>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-[#AAC0E1]/10">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone size={14} className="text-[#AAC0E1]" />
                <span className="text-[#0E2F76]/60">Not provided</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-[#AAC0E1]" />
                <span className="text-[#0E2F76]/60">{user?.institutionalEmail || ''}</span>
              </div>
            </div>
          </div>

          {/* Hostel Allocation (quick view) */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <h3 className="text-sm font-semibold text-[#0E2F76] mb-4">Hostel Allocation</h3>
            {allocatedBunk ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                    <Home size={18} className="text-[#0E2F76]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0E2F76]">Room {allocatedBunk.roomNumber}</p>
                    <p className="text-xs text-[#0E2F76]/50">Room</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                    <Bed size={18} className="text-[#0E2F76]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0E2F76]">Bunk {allocatedBunk.bunkNumber}</p>
                    <p className="text-xs text-[#0E2F76]/50">Bunk</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#0E2F76]/60">No hostel allocated yet</p>
                <button
                  onClick={() => navigate('/home')}
                  className="mt-3 text-sm text-[#0E2F76] font-medium underline"
                >
                  Select a hostel
                </button>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#AAC0E1]/20 mb-4">
            <h3 className="text-sm font-semibold text-[#0E2F76] mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={16} className="text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Check-ins</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.checkIns}</p>
              </div>
              <div className="bg-orange-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={16} className="text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Check-outs</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{stats.checkOuts}</p>
              </div>
              <div className="bg-purple-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={16} className="text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">Complaints</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{stats.complaintsSubmitted}</p>
              </div>
              <div className="bg-blue-50 rounded-[16px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Days</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{stats.daysInHostel}</p>
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
                <span className="flex-1 text-left text-sm font-medium text-[#0E2F76]">{item.title}</span>
                <ChevronRight size={18} className="text-[#AAC0E1]" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Logout Confirmation Modal ────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0E2F76] mb-2">Confirm Logout</h3>
              <p className="text-sm text-[#0E2F76]/60">Are you sure you want to log out of your account?</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full py-3 bg-red-500 text-white rounded-[16px] font-semibold text-sm hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
              >
                {logoutLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Logging out...
                  </>
                ) : (
                  'Yes, Logout'
                )}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={logoutLoading}
                className="w-full py-3 bg-[#AAC0E1]/10 text-[#0E2F76] rounded-[16px] font-semibold text-sm hover:bg-[#AAC0E1]/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hostel Information Modal ────────────────────────── */}
      {showHostelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHostelModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Hostel Information</h2>
              <button onClick={() => setShowHostelModal(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {allocatedBunk ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                      <Home size={22} className="text-[#0E2F76]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="text-lg font-bold text-[#0E2F76]">Room {allocatedBunk.roomNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center">
                      <Bed size={22} className="text-[#0E2F76]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bunk</p>
                      <p className="text-lg font-bold text-[#0E2F76]">Bunk {allocatedBunk.bunkNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#0E2F76]/60">You have not been allocated a bunk yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Attendance History Modal ────────────────────────── */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAttendanceModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Attendance History</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {checkInHistory.length > 0 ? (
                <div className="space-y-3">
                  {checkInHistory.slice(0, 10).map((record, index) => {
                    const isCheckIn = !!record.returnTime;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCheckIn ? 'bg-green-100' : 'bg-orange-100'}`}>
                          {isCheckIn ? <CheckCircle2 size={18} className="text-green-600" /> : <LogOut size={18} className="text-orange-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0E2F76]">
                            {isCheckIn ? 'Checked In' : 'Checked Out'}
                          </p>
                          <p className="text-xs text-[#0E2F76]/50">
                            {new Date(isCheckIn ? record.returnTime : record.checkoutTime).toLocaleString()}
                          </p>
                        </div>
                        {isCheckIn && (
                          <span className="text-xs text-green-600 font-medium">Returned</span>
                        )}
                      </div>
                    );
                  })}
                  {checkInHistory.length > 10 && (
                    <p className="text-xs text-center text-[#0E2F76]/40 mt-2">
                      Showing last 10 of {checkInHistory.length} records
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#0E2F76]/60">No attendance records yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Help & Support Modal ────────────────────────────── */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHelpModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Help & Support</h2>
              <button onClick={() => setShowHelpModal(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0E2F76]">Email Support</p>
                      <p className="text-xs text-[#0E2F76]/60">support@hostix.com</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0E2F76]">Phone Support</p>
                      <p className="text-xs text-[#0E2F76]/60">+234 800 000 0000</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building2 size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0E2F76]">Hostel Office</p>
                      <p className="text-xs text-[#0E2F76]/60">Visit the hostel admin office</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-start gap-3">
                    <MessageSquare size={18} className="text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#0E2F76]">Report Issues</p>
                      <p className="text-xs text-[#0E2F76]/60">
                        Use the "Complaint History" option to report issues in your hostel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Profile;