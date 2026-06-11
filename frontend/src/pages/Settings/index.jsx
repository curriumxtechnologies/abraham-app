import { useState } from 'react';
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
  Globe,
  Star,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import FloatingShapes from '../../components/common/FloatingShapes';

const Settings = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    attendanceAlerts: true,
    complaintUpdates: true,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
          onClick: () => navigate('/edit-profile'),
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
          onClick: () => {},
        },
        {
          id: 'report-issue',
          title: 'Report App Issue',
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          onClick: () => {},
        },
        {
          id: 'faqs',
          title: 'FAQs',
          icon: HelpCircle,
          color: 'text-teal-500',
          bgColor: 'bg-teal-50',
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
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          onClick: () => {},
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: Shield,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          onClick: () => {},
        },
        {
          id: 'terms',
          title: 'Terms & Conditions',
          icon: FileText,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          onClick: () => {},
        },
      ],
    },
  ];

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
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
              <h1 className="text-2xl font-bold text-[#0E2F76] font-inter">
                Settings
              </h1>
              <p className="text-[#0E2F76]/50 text-sm font-inter mt-1">
                Manage your app preferences
              </p>
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
                        <span className="flex-1 text-sm font-medium text-[#0E2F76]">
                          {item.title}
                        </span>
                        <button
                          onClick={item.onToggle}
                          className="relative inline-flex items-center"
                        >
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
                      <span className="flex-1 text-left text-sm font-medium text-[#0E2F76]">
                        {item.title}
                      </span>
                      <ChevronRight size={18} className="text-[#AAC0E1]" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* App Version */}
          <div className="text-center pt-4">
            <p className="text-xs text-[#0E2F76]/30">
              Hostix v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          
          <div className="relative bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0E2F76] mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-[#0E2F76]/60">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
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
    </MainLayout>
  );
};

export default Settings;