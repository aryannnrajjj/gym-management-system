import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import QRScanner from './pages/QRScanner';
import WorkoutPlans from './pages/WorkoutPlans';
import Subscriptions from './pages/Subscriptions';

// Protected Route — agar login nahi toh Login page pe bhejo
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-500 text-xl">Loading... 💪</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Layout — Sidebar + Main Content
function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/members" element={
        <ProtectedRoute>
          <AppLayout><Members /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute>
          <AppLayout><Attendance /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/qr-scanner" element={
        <ProtectedRoute>
          <AppLayout><QRScanner /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/workout" element={
        <ProtectedRoute>
          <AppLayout><WorkoutPlans /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/subscriptions" element={
        <ProtectedRoute>
          <AppLayout><Subscriptions /></AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#16213e',
              color: 'white',
              border: '1px solid #374151'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
