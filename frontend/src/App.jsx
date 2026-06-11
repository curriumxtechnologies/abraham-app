import { RouterProvider } from 'react-router-dom';
import router from './routes';

function App() {
  return (
    <div className="max-w-md mx-auto relative">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;