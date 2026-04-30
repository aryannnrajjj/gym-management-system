import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Loading — check karo token valid hai ya nahi
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <LoadingSpinner size="lg" text="Verifying access..." />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — agar allowedRoles specify kiya ho
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="card p-8 text-center max-w-sm">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-white font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-5">
            Tumhare role ({user.role}) ke paas is page ka access nahi hai.
          </p>
          <a href="/dashboard" className="btn-primary inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}