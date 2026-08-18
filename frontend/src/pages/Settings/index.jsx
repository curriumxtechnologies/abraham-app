import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Bell,
  Phone,
  AlertCircle,
  HelpCircle,
  Info,
  Shield,
  FileText,
  Trash2,
  ChevronRight,
  Smartphone,
  Mail,
  ToggleLeft,
  ToggleRight,
  X,
  Camera,
  Loader2,
  Save,
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';
import { useGetUserInfoQuery, useUpdateProfileMutation } from '../../slices/userApiSlice';

const Settings = () => {
  const navigate = useNavigate();

  // ─── Modals state ──────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // ─── Edit Profile state ──────────────────────────────────────
  const { data: userData, isLoading, refetch } = useGetUserInfoQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const user = userData?.user;

  useEffect(() => {
    if (user?.profilePicture) {
      setPreviewUrl(user.profilePicture);
    }
  }, [user]);

  // ─── Notification toggles ─────────────────────────────────────
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    attendanceAlerts: true,
    complaintUpdates: true,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ─── Edit Profile handlers ────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    setPreviewUrl(user?.profilePicture || null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditErrors({});
    setSuccessMessage('');
    setErrorMessage('');

    if (password && password.length < 6) {
      setEditErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    if (password && password !== confirmPassword) {
      setEditErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const formData = new FormData();
    if (profilePicture) formData.append('profilePicture', profilePicture);
    if (password) formData.append('password', password);

    if (!profilePicture && !password) {
      setErrorMessage('No changes to save. Select a new picture or enter a new password.');
      return;
    }

    try {
      const result = await updateProfile(formData).unwrap();
      setSuccessMessage(result.message || 'Profile updated successfully!');
      await refetch();
      setPassword('');
      setConfirmPassword('');
      setProfilePicture(null);
      if (result.user?.profilePicture) {
        setPreviewUrl(result.user.profilePicture);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to update profile.');
    }
  };

  // ─── Settings sections ──────────────────────────────────────
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          icon: User,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          onClick: () => setShowEditProfileModal(true),
        },
        {
          id: 'delete-account',
          title: 'Delete Account',
          icon: Trash2,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          onClick: () => setShowDeleteConfirm(true),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          icon: Smartphone,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          isToggle: true,
          value: notifications.pushNotifications,
          onToggle: () => toggleNotification('pushNotifications'),
        },
        {
          id: 'email',
          title: 'Email Notifications',
          icon: Mail,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          isToggle: true,
          value: notifications.emailNotifications,
          onToggle: () => toggleNotification('emailNotifications'),
        },
        {
          id: 'attendance-alerts',
          title: 'Attendance Alerts',
          icon: Bell,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          isToggle: true,
          value: notifications.attendanceAlerts,
          onToggle: () => toggleNotification('attendanceAlerts'),
        },
        {
          id: 'complaint-updates',
          title: 'Complaint Updates',
          icon: AlertCircle,
          color: 'text-cyan-500',
          bgColor: 'bg-cyan-50',
          isToggle: true,
          value: notifications.complaintUpdates,
          onToggle: () => toggleNotification('complaintUpdates'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'contact-admin',
          title: 'Contact Administration',
          icon: Phone,
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-50',
          onClick: () => setShowContactModal(true),
        },
        {
          id: 'report-issue',
          title: 'Report App Issue',
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          onClick: () => setShowReportModal(true),
        },
        {
          id: 'faqs',
          title: 'FAQs',
          icon: HelpCircle,
          color: 'text-teal-500',
          bgColor: 'bg-teal-50',
          onClick: () => setShowFaqModal(true),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'about',
          title: 'About Hostix',
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          onClick: () => setShowAboutModal(true),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: Shield,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          onClick: () => setShowPrivacyModal(true),
        },
        {
          id: 'terms',
          title: 'Terms & Conditions',
          icon: FileText,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          onClick: () => setShowTermsModal(true),
        },
      ],
    },
  ];

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    // In a real app, you'd call an API to delete the account
    navigate('/');
  };

  return (
    <MainLayout>
      <FloatingShapes />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-[#AAC0E1]/20 shadow-sm hover:bg-white transition-all duration-300"
            >
              <ArrowLeft size={20} className="text-[#0E2F76]" strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">Settings</h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-1">Manage your app preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 pb-8 space-y-4">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-semibold text-[#0E2F76]/40 uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h3>
              <div className="bg-white rounded-[20px] shadow-sm border border-[#AAC0E1]/20 overflow-hidden">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isLast = itemIndex === section.items.length - 1;

                  if (item.isToggle) {
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 hover:bg-[#AAC0E1]/5 transition-all duration-300 ${
                          !isLast ? 'border-b border-[#AAC0E1]/10' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                          <Icon size={18} className={item.color} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-[#0E2F76]">{item.title}</span>
                        <button onClick={item.onToggle} className="relative inline-flex items-center">
                          {item.value ? (
                            <ToggleRight size={44} className="text-[#0E2F76]" strokeWidth={1.5} />
                          ) : (
                            <ToggleLeft size={44} className="text-[#AAC0E1]" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-[#AAC0E1]/5 transition-all duration-300 ${
                        !isLast ? 'border-b border-[#AAC0E1]/10' : ''
                      }`}
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
          ))}

          <div className="text-center pt-4">
            <p className="text-xs text-[#0E2F76]/30">Hostix v1.0.0</p>
          </div>
        </div>
      </div>

      {/* ─── Delete Account Modal ────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0E2F76] mb-2">Delete Account</h3>
              <p className="text-sm text-[#0E2F76]/60">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be
                permanently removed.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-red-500 text-white rounded-[16px] font-semibold text-sm hover:bg-red-600 transition-all duration-300"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 bg-[#AAC0E1]/10 text-[#0E2F76] rounded-[16px] font-semibold text-sm hover:bg-[#AAC0E1]/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Profile Modal ──────────────────────────────── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditProfileModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Edit Profile</h2>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-[#0E2F76] flex items-center justify-center overflow-hidden shadow-lg">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {user?.fullName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="profilePictureInput"
                    className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  >
                    <Camera size={16} className="text-gray-600" />
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#0E2F76]/50 mt-2">Tap camera to change picture</p>
              </div>

              {/* Read‑only info */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#0E2F76]/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0E2F76]/70 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.institutionalEmail || ''}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Password change */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#0E2F76]/70 mb-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                      editErrors.password
                        ? 'border-red-300 focus:ring-red-500/10'
                        : 'border-gray-200 focus:ring-[#0E2F76]/10'
                    }`}
                  />
                  {editErrors.password && <p className="mt-1 text-xs text-red-500">{editErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0E2F76]/70 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                      editErrors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500/10'
                        : 'border-gray-200 focus:ring-[#0E2F76]/10'
                    }`}
                  />
                  {editErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{editErrors.confirmPassword}</p>}
                </div>
                <p className="text-xs text-[#0E2F76]/40">Leave blank to keep current password</p>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3 bg-[#0E2F76] text-white rounded-xl font-medium text-sm hover:bg-[#0a2560] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Contact Administration Modal ────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Contact Administration</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-[#0E2F76]">📧 Email</p>
                  <p className="text-sm text-[#0E2F76]/60 mt-1">support@hostix.com</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm font-medium text-[#0E2F76]">📞 Phone</p>
                  <p className="text-sm text-[#0E2F76]/60 mt-1">+234 800 000 0000</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm font-medium text-[#0E2F76]">🏢 Office</p>
                  <p className="text-sm text-[#0E2F76]/60 mt-1">Hostel Administration Building, Room 101</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Report App Issue Modal ──────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Report App Issue</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-sm font-medium text-[#0E2F76]">📝 Describe the issue</p>
                <p className="text-sm text-[#0E2F76]/60 mt-2">
                  Please send a detailed description of the problem you're experiencing to our support team:
                </p>
                <p className="text-sm text-[#0E2F76] font-medium mt-2">support@hostix.com</p>
                <p className="text-xs text-[#0E2F76]/40 mt-2">We'll get back to you within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FAQs Modal ───────────────────────────────────────── */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFaqModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Frequently Asked Questions</h2>
              <button
                onClick={() => setShowFaqModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-semibold text-[#0E2F76]">How do I check in/out?</h4>
                <p className="text-xs text-[#0E2F76]/60 mt-1">
                  Go to the QR Scanner page and scan the QR code at the hostel entrance.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-semibold text-[#0E2F76]">How do I report a complaint?</h4>
                <p className="text-xs text-[#0E2F76]/60 mt-1">
                  Go to the Complaints page and click the "Report an Issue" button.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-semibold text-[#0E2F76]">How do I change my password?</h4>
                <p className="text-xs text-[#0E2F76]/60 mt-1">
                  Go to Edit Profile in Settings and enter a new password.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── About Hostix Modal ──────────────────────────────── */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAboutModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">About Hostix</h2>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-[#0E2F76] flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl font-bold">H</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0E2F76] text-center">Hostix v1.0.0</h3>
              <p className="text-sm text-[#0E2F76]/60 text-center mt-1">
                Hostel Management System for universities and student accommodations.
              </p>
              <div className="mt-6 space-y-2 text-sm text-[#0E2F76]/60 text-center">
                <p>© 2026 Hostix. All rights reserved.</p>
                <p>Built with ❤️ for better hostel management.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Privacy Policy Modal ────────────────────────────── */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivacyModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-sm text-[#0E2F76]/80">
                <p>We collect the following information to provide our services:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Name and contact information</li>
                  <li>Student ID and institutional email</li>
                  <li>Hostel allocation details</li>
                  <li>Attendance records</li>
                </ul>
                <p>Your data is stored securely and is not shared with third parties.</p>
                <p>You can request deletion of your data at any time.</p>
                <p className="text-xs text-[#0E2F76]/40">Last updated: June 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Terms & Conditions Modal ────────────────────────── */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTermsModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#0E2F76]">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-sm text-[#0E2F76]/80">
                <p>By using Hostix, you agree to:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Provide accurate information</li>
                  <li>Use the system responsibly</li>
                  <li>Comply with hostel rules and regulations</li>
                  <li>Report any issues promptly</li>
                </ul>
                <p>We reserve the right to suspend accounts that violate these terms.</p>
                <p className="text-xs text-[#0E2F76]/40">Last updated: June 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Settings;