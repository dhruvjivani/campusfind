import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Home from './pages/Home';
import BrowseItems from './pages/BrowseItems';
import ItemDetail from './pages/ItemDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PostItem from './pages/PostItem';
import EditItem from './pages/EditItem';
import MyClaims from './pages/MyClaims';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';
import apiService from './services/api';

// Redirects unauthenticated users to /login, preserving the intended URL
function RequireAuth({ user, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Same as RequireAuth but also checks for the staff role
function RequireStaff({ user, children }) {
  const location = useLocation();
  if (!user || user.role !== 'staff') return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On mount: verify any saved JWT with the server
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    } else {
      setAuthLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getMyProfile();
      setUser(response.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => setUser(userData);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p>Loading CampusFind…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {/* Public routes */}
        <Route path="/"          element={<Home user={user} />} />
        <Route path="/browse"    element={<BrowseItems user={user} />} />
        <Route path="/items/:id" element={<ItemDetail user={user} />} />

        {/* Redirect logged-in users away from auth pages */}
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register onLoginSuccess={handleLoginSuccess} />} />

        {/* Protected routes (login required) */}
        <Route path="/post"      element={<RequireAuth user={user}><PostItem user={user} /></RequireAuth>} />
        <Route path="/edit/:id"  element={<RequireAuth user={user}><EditItem user={user} /></RequireAuth>} />
        <Route path="/my-claims" element={<RequireAuth user={user}><MyClaims user={user} /></RequireAuth>} />

        {/* Staff-only route */}
        <Route path="/staff" element={<RequireStaff user={user}><StaffDashboard user={user} /></RequireStaff>} />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
