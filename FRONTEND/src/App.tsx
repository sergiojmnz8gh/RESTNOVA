import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <RouterProvider router={router} />
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
