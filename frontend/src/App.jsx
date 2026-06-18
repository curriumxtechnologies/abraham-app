import { RouterProvider, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import router from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;