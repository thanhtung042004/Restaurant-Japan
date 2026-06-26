import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Toaster } from 'react-hot-toast';
import { authAPI } from './api';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [socket, setSocket] = useState(null);

  // Fetch current user details if token exists
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      if (res.success) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Loi lay thong tin tai khoan:', err.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Initialize Socket.IO connection when user is logged in
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect socket using Vite proxy
    const newSocket = io(window.location.origin, {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected:', newSocket.id);
      
      // Join specific room based on user role
      if (['admin', 'manager'].includes(user.role)) {
        newSocket.emit('join:staff');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center gap-4">
        <div className="font-serif text-3xl tracking-[0.3em] text-gold animate-pulse-slow">SAKURA</div>
        <div className="font-jp text-xs text-muted tracking-[0.3em]">桜 — 日本料理</div>
        <div className="w-24 h-[1px] bg-wood-light relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gold animate-[preloaderBar_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#0e0a06',
            color: '#f2e8d5',
            border: '1px solid rgba(201, 164, 71, 0.18)',
            fontFamily: 'sans-serif',
          },
        }} 
      />
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage 
                user={user} 
                onLogout={handleLogout} 
                onOpenLogin={() => setShowLoginModal(true)} 
                showLoginModal={showLoginModal}
                onCloseLogin={() => setShowLoginModal(false)}
                onLoginSuccess={handleLogin}
              />
            )
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <DashboardPage 
                user={user} 
                socket={socket} 
                onLogout={handleLogout}
                onUserUpdate={setUser}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
