import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import HomePage from '../pages/Home';
import QRScanner from '../pages/QRScanner';
import Complaints from '../pages/Complaints';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import adminRoutes from './adminRoutes';

const router = createBrowserRouter([
  // Student Routes
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: <HomePage />,
  },
  {
    path: '/qr-scanner',
    element: <QRScanner />,
  },
  {
    path: '/complaints',
    element: <Complaints />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  
  ...adminRoutes,
]);

export default router;