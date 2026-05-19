import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const ProtectedRoute = ({ children, requireDoctor = false, requirePatient = false, requireNurse = false }) => {
  const { isAuthenticated, loading, isDoctor, isPatient, isNurse } = useAuth();

  console.log('ProtectedRoute Check:', {
    isAuthenticated,
    loading,
    isDoctor,
    isPatient,
    isNurse,
    requireDoctor,
    requirePatient,
    requireNurse
  });

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requireDoctor && !isDoctor) {
    console.log('Requires doctor but user is not doctor, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  if (requirePatient && !isPatient) {
    console.log('Requires patient but user is not patient, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireNurse && !isNurse) {
    console.log('Requires nurse but user is not nurse, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Access granted, rendering children');
  return children;
};

export default ProtectedRoute;
