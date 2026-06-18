import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Database,
  Trash2,
  ChevronRight,
  Info,
  FileText,
  HelpCircle,
  AlertCircle,
  Download,
  Upload,
  Clock
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      studentAlerts: true,
      complaintAlerts: true,
      attendanceReports: false,
      systemUpdates: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: true,
    },
    preferences: {
      language: 'English',
      timezone: 'GMT+1 (West Africa)',
      dateFormat: 'MM/DD/YYYY',
    },
  });

  const toggleSetting = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          description: 'Update your personal information',
          icon: User,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          onClick: () => navigate('/admin/edit-profile'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          description: 'Receive push notifications',
          icon: Smartphone,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          isToggle: true,
          value: settings.notifications.pushNotifications,
          onToggle: () => toggleSetting('notifications', 'pushNotifications'),
        },
        {
          id: 'email-notif',
          title: 'Email Notifications',
          description: 'Receive email notifications',
          icon: Mail,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          isToggle: true,
          value: settings.notifications.emailNotifications,
          onToggle: () => toggleSetting('notifications', 'emailNotifications'),
        },
        {
          id: 'student-alerts',
          title: 'Student Alerts',
          description: 'Get notified about student activities',
          icon: Bell,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          isToggle: true,
          value: settings.notifications.studentAlerts,
          onToggle: () => toggleSetting('notifications', 'studentAlerts'),
        },
        {
          id: 'complaint-alerts',
          title: 'Complaint Alerts',
          description: 'Get notified about new complaints',
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          isToggle: true,
          value: settings.notifications.complaintAlerts,
          onToggle: () => toggleSetting('notifications', 'complaintAlerts'),
        },
        {
          id: 'attendance-reports',
          title: 'Attendance Reports',
          description: 'Receive daily attendance summaries',
          icon: FileText,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          isToggle: true,
          value: settings.notifications.attendanceReports,
          onToggle: () => toggleSetting('notifications', 'attendanceReports'),
        },
        {
          id: 'system-updates',
          title: 'System Updates',
          description: 'Get notified about system updates',
          icon: Info,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          isToggle: true,
          value: settings.notifications.systemUpdates,
          onToggle: () => toggleSetting('notifications', 'systemUpdates'),
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: '2fa',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          icon: Shield,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          isToggle: true,
          value: settings.security.twoFactorAuth,
          onToggle: () => toggleSetting('security', 'twoFactorAuth'),
        },
        {
          id: 'login-alerts',
          title: 'Login Alerts',
          description: 'Get notified of new logins',
          icon: Bell,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          isToggle: true,
          value: settings.security.loginAlerts,
          onToggle: () => toggleSetting('security', 'loginAlerts'),
        },
        {
          id: 'session-timeout',
          title: 'Session Timeout',
          description: 'Auto logout after inactivity',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          isToggle: true,
          value: settings.security.sessionTimeout,
          onToggle: () => toggleSetting('security', 'sessionTimeout'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          description: 'Switch between light and dark theme',
          icon: darkMode ? Moon : Sun,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          isToggle: true,
          value: darkMode,
          onToggle: () => setDarkMode(!darkMode),
        },
        {
          id: 'language',
          title: 'Language',
          description: settings.preferences.language,
          icon: Globe,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          onClick: () => {},
        },
        {
          id: 'timezone',
          title: 'Timezone',
          description: settings.preferences.timezone,
          icon: Clock,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'export-data',
          title: 'Export Data',
          description: 'Download all hostel data',
          icon: Download,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          onClick: () => {},
        },
        {
          id: 'import-data',
          title: 'Import Data',
          description: 'Upload student or hostel data',
          icon: Upload,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          onClick: () => {},
        },
        {
          id: 'backup',
          title: 'Backup Database',
          description: 'Create a backup of all records',
          icon: Database,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'about',
          title: 'About Hostix',
          description: 'Version 1.0.0',
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          onClick: () => {},
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          description: 'How we handle your data',
          icon: Shield,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          onClick: () => {},
        },
        {
          id: 'terms',
          title: 'Terms & Conditions',
          description: 'Terms of service',
          icon: FileText,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          onClick: () => {},
        },
        {
          id: 'help',
          title: 'Help & Support',
          description: 'Get assistance',
          icon: HelpCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'delete-account',
          title: 'Delete Account',
          description: 'Permanently remove your account',
          icon: Trash2,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          onClick: () => setShowDeleteConfirm(true),
          isDanger: true,
        },
      ],
    },
  ];

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    navigate('/admin/login');
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/profile')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your admin preferences and system configuration
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={`${section.title === 'Notifications' || section.title === 'About' ? 'lg:col-span-2' : ''}`}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isLast = itemIndex === section.items.length - 1;
                
                if (item.isToggle) {
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-all duration-200 ${
                        !isLast ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={item.onToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                          item.value ? 'bg-[#0E2F76]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-all duration-200 ${
                      !isLast ? 'border-b border-gray-50' : ''
                    } ${item.isDanger ? 'hover:bg-red-50/30' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={item.color} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-medium ${item.isDanger ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight size={18} className={`flex-shrink-0 ${item.isDanger ? 'text-red-300' : 'text-gray-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* App Version */}
      <div className="text-center mt-8 pb-8">
        <p className="text-xs text-gray-400">
          Hostix Admin v1.0.0 • Build 2024.06.18
        </p>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete Admin Account
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to permanently delete your admin account? This action cannot be undone and all data will be lost.
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-all duration-200"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;