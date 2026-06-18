import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  Activity,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  Building2
} from 'lucide-react';
import logoPath from '../assets/images/logo.png';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigationItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & analytics',
    },
    {
      path: '/admin/students',
      label: 'Students',
      icon: Users,
      description: 'Manage students',
    },
    {
      path: '/admin/attendance',
      label: 'Attendance',
      icon: Activity,
      description: 'Track check-ins/outs',
    },
    {
      path: '/admin/complaints',
      label: 'Complaints',
      icon: MessageSquare,
      description: 'Handle issues',
    },
    {
      path: '/admin/profile',
      label: 'Profile',
      icon: User,
      description: 'Your account',
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configure system',
    },
  ];

  const notifications = [
    { id: 1, message: 'New student registered', time: '5 min ago', type: 'info' },
    { id: 2, message: 'Complaint resolved: Room 3', time: '1 hour ago', type: 'success' },
    { id: 3, message: 'System update available', time: '2 hours ago', type: 'warning' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0E2F76] flex items-center justify-center shadow-lg shadow-[#0E2F76]/20">
              <img src={logoPath} alt="Hostix" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hostix</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Main Menu
          </p>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-[#0E2F76] text-white shadow-lg shadow-[#0E2F76]/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <div className="text-left">
                  <span>{item.label}</span>
                  <p className={`text-[10px] ${active ? 'text-white/60' : 'text-gray-400'} font-normal`}>
                    {item.description}
                  </p>
                </div>
                {active && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-[#0E2F76]" />
              <span className="text-xs font-semibold text-gray-700">Hostel Capacity</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Hostel A</span>
                  <span className="text-gray-700 font-medium">81%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div className="h-full bg-[#0E2F76] rounded-full" style={{ width: '81%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Hostel B</span>
                  <span className="text-gray-700 font-medium">80%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Hostel C</span>
                  <span className="text-gray-700 font-medium">74%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }} />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area - Takes remaining width */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <Menu size={22} className="text-gray-600" />
                </button>
                
                <div className="hidden sm:flex items-center">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students, complaints..."
                      className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0E2F76] focus:ring-2 focus:ring-[#0E2F76]/10 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Section */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map(notification => (
                            <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <button className="text-xs text-[#0E2F76] font-medium hover:underline">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0E2F76] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">Administrator</p>
                      <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 hidden md:block" />
                  </button>
                  
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">Administrator</p>
                          <p className="text-xs text-gray-500">admin@hostix.com</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/admin/profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all duration-200"
                        >
                          <User size={16} />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/admin/settings');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all duration-200"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content - Full width */}
        <main className="flex-1 p-6 lg:p-8 w-full">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 lg:px-8 py-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              © 2026 Hostix. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Terms of Service</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Help</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;