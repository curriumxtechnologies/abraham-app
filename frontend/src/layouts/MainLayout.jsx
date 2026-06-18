import BottomNav from '../components/bottomNav/BottomNav';

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#F5FEFF] pb-20 max-w-md mx-auto">
      {children}
      <BottomNav />
    </div>
  );
};

export default MainLayout;