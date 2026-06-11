import { useLocation, useNavigate } from 'react-router-dom';
import { Home, QrCode, MessageSquare, User } from 'lucide-react';

const navItems = [
  {
    path: '/home',
    label: 'Home',
    icon: Home,
  },
  {
    path: '/qr-scanner',
    label: 'QR Scan',
    icon: QrCode,
  },
  {
    path: '/complaints',
    label: 'Complaints',
    icon: MessageSquare,
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
  },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#AAC0E1]/20 z-50">
      <div className="max-w-md mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  active ? 'text-[#0E2F76]' : 'text-[#AAC0E1] hover:text-[#0E2F76]'
                }`}
              >
                <Icon 
                  size={22} 
                  strokeWidth={active ? 2.5 : 2} 
                />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe Area for iPhone */}
      <div className="h-safe-area bg-white/95" />
    </div>
  );
};

export default BottomNav;