import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getStoredUser } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './styles/variables.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginOrRedirect />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function LoginOrRedirect() {
  const user = getStoredUser();
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}
