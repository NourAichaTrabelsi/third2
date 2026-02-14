import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) localStorage.setItem('user', JSON.stringify(currentUser));
    else localStorage.removeItem('user');
  }, [currentUser]);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  return (
    <Routes>
      <Route path="/login" element={
        currentUser ? <Navigate to={currentUser.role === 'admin' ? '/admin' : '/technician'} replace /> : <Login onLogin={handleLogin} />
      } />
      <Route path="/" element={<Layout user={currentUser} onLogout={handleLogout} />}>
        <Route index element={<Navigate to={currentUser ? (currentUser.role === 'admin' ? '/admin' : '/technician') : '/login'} replace />} />
        <Route path="admin" element={
          currentUser?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="technician" element={
          currentUser?.role === 'technician' ? <TechnicianDashboard /> : <Navigate to="/login" replace />
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
