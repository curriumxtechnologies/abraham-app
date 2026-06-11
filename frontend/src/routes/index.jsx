import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import HomePage from '../pages/Home';
import QRScanner from '../pages/QRScanner';
import Complaints from '../pages/Complaints';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

const router = createBrowserRouter([
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
]);

export default router;