import BottomNav from '../components/bottomNav/BottomNav';

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#F5FEFF] pb-20">
      {children}
      <BottomNav />
    </div>
  );
};

export default MainLayout;