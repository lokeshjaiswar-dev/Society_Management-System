import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Public components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Verification from './components/Auth/Verification';
import MainPage from './components/MainPage/MainPage';

// Protected components - MAKE SURE THESE IMPORTS ARE CORRECT
import Dashboard from './components/Dashboard/Dashboard';
import Flats from './components/Flats/Flats';
import Notices from './components/Notices/Notices';
import Complaints from './components/Complaints/Complaints';
import Maintenance from './components/Maintenance/Maintenance';
import MemoryLane from './components/MemoryLane/MemoryLane';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  console.log('App component rendered'); // Debug log

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-black to-emerald-900">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainPage />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/verify" 
              element={
                <PublicRoute>
                  <Verification />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/flats" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Flats />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notices" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notices />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complaints" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Complaints />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Maintenance />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/memory-lane" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <MemoryLane />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #059669'
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;