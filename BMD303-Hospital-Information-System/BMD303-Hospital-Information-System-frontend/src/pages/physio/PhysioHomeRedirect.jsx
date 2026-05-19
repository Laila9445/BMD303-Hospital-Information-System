import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Sends physiotherapists to the staff queue; everyone else to the doctor-style dashboard. */
const PhysioHomeRedirect = () => {
  const { isPhysio } = useAuth();
  return <Navigate to={isPhysio ? '/physio/staff' : '/physio/dashboard'} replace />;
};

export default PhysioHomeRedirect;
