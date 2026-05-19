import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const ProtectedRoute = ({
  children,
  requireDoctor = false,
  requirePatient = false,
  requireNurse = false,
  requireRadiologist = false,
  requirePhysio = false,
  requireScheduleProvider = false,
}) => {
  const { isAuthenticated, loading, isDoctor, isPatient, isNurse, isRadiology, isPhysio } = useAuth();
  const canManageSchedule = isDoctor || isRadiology || isPhysio;

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireDoctor && !isDoctor) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requirePatient && !isPatient) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireNurse && !isNurse) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireRadiologist && !isRadiology) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requirePhysio && !isPhysio) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireScheduleProvider && !canManageSchedule) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
