import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false, requireEmployee = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to sign in
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  
  // If admin access is required but user is not admin, redirect
  if (requireAdmin && user?.role !== 'Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If employee access is required but user is not an employee, redirect
  if (requireEmployee && user?.role !== 'Employee') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has appropriate role
  return <Outlet />;
};

export default ProtectedRoute;