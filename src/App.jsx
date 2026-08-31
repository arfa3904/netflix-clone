import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteLoading from './components/RouteLoading';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import './styles/variables.css';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <div className="app">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movie/:id"
                element={
                  <ProtectedRoute>
                    <MovieDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <Watchlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </WatchlistProvider>
    </AuthProvider>
  );
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  if (user) return <Navigate to="/" replace />;
  return children;
}
