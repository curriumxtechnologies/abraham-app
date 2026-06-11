import { LogIn, Home, QrCode, MessageSquare } from 'lucide-react';
import Button from '../../components/buttons/Button';
import FloatingShapes from '../../components/common/FloatingShapes';
import logoPath from '../../assets/images/logo.png';

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-[#F5FEFF] overflow-hidden">
      <FloatingShapes />
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8">
        
        {/* Top Section - Logo and Brand */}
        <div className="flex-1 flex flex-col items-center justify-center mt-8">
          {/* Logo Container */}
          <div className="mb-8 p-4 bg-white rounded-[30px] shadow-lg shadow-[#0E2F76]/5">
            <img 
              src={logoPath} 
              alt="Hostix Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-5xl font-bold text-[#0E2F76] mb-3 font-inter tracking-tight">
            Hostix
          </h1>
          
          {/* Subtitle */}
          <p className="text-center text-[#0E2F76]/70 text-lg leading-relaxed max-w-sm font-inter">
            Digital platform for hostel accommodation, attendance tracking, and complaint management.
          </p>
        </div>
        
        {/* Middle Section - Features */}
        <div className="my-8 space-y-4 px-2">
          <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-[20px] shadow-sm border border-[#AAC0E1]/20">
            <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center flex-shrink-0">
              <Home size={24} className="text-[#0E2F76]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-[#0E2F76] text-sm">Smart Hostel Selection</h3>
              <p className="text-[#0E2F76]/50 text-xs mt-0.5">View and select available rooms and bunks in real-time</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-[20px] shadow-sm border border-[#AAC0E1]/20">
            <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center flex-shrink-0">
              <QrCode size={24} className="text-[#0E2F76]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-[#0E2F76] text-sm">QR Attendance Tracking</h3>
              <p className="text-[#0E2F76]/50 text-xs mt-0.5">Check in and out with QR codes at hostel entrances</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-[20px] shadow-sm border border-[#AAC0E1]/20">
            <div className="w-12 h-12 rounded-full bg-[#AAC0E1]/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={24} className="text-[#0E2F76]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-[#0E2F76] text-sm">Complaint Management</h3>
              <p className="text-[#0E2F76]/50 text-xs mt-0.5">Report hostel issues with automatic room and bunk details</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Login Button Only */}
        <div className="space-y-3 pb-6">
          <Button 
            variant="primary" 
            to="/login"
            icon={LogIn}
            iconPosition="left"
          >
            Login
          </Button>
          
        </div>
      </div>
    </div>
  );
};

export default Landing;