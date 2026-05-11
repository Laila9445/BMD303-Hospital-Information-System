import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const NavbarContainer = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;

  .accent {
    color: #2563eb;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
`;

const UserInfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: #f9fafb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #fecaca;
    transform: translateY(-2px);
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    if (user?.role === 'Doctor') navigate('/doctor/profile');
    else if (user?.role === 'Patient') navigate('/patient/profile');
  };

  const displayName = user?.role === 'Doctor' ? 'Ahmed Nabil' : `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  return (
    <NavbarContainer>
      <Logo>
        <span>Orthopedic</span>
        <span className="accent">Clinic</span>
      </Logo>
      
      <RightSection>
        <UserInfoButton type="button" onClick={goToProfile} title="Go to profile">
          <UserCircleIcon style={{ width: '32px', height: '32px', color: '#6b7280' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {user?.role === 'Doctor' ? 'Doctor' : user?.role === 'Patient' ? 'Patient' : 'Staff'}
            </div>
          </div>
        </UserInfoButton>
        
        <LogoutButton onClick={handleLogout}>
          <ArrowRightOnRectangleIcon style={{ width: '18px', height: '18px' }} />
          Logout
        </LogoutButton>
      </RightSection>
    </NavbarContainer>
  );
};

export default Navbar;
