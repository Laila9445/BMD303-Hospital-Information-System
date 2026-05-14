import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const NavbarContainer = styled.nav`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  padding: 0 28px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 40;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;

  .wordmark {
    color: #f1f5f9;
  }

  .accent {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .pill {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 3px 8px;
    text-transform: uppercase;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserInfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const AvatarCircle = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  text-align: left;

  .name {
    font-size: 13px;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.2;
  }

  .role {
    font-size: 11px;
    color: #94a3b8;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.22);
    color: #fee2e2;
    border-color: rgba(239, 68, 68, 0.4);
    transform: translateY(-1px);
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const goToProfile = () => {
    if (user?.role === 'Doctor') navigate('/doctor/profile');
    else if (user?.role === 'Patient') navigate('/patient/profile');
  };

  const displayName =
    user?.role === 'Doctor'
      ? 'Ahmed Nabil'
      : [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email || 'User';

  const roleLabel = user?.role || 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <NavbarContainer>
      <Logo>
        <span className="wordmark">Orthopedic</span>
        <span className="accent">Clinic</span>
        <span className="pill">HMS</span>
      </Logo>

      <RightSection>
        <Divider />
        <UserInfoButton type="button" onClick={goToProfile} title="Go to profile">
          <AvatarCircle>{initials}</AvatarCircle>
          <UserDetails>
            <div className="name">{displayName}</div>
            <div className="role">{roleLabel}</div>
          </UserDetails>
        </UserInfoButton>

        <LogoutButton onClick={handleLogout}>
          <ArrowRightOnRectangleIcon style={{ width: '16px', height: '16px' }} />
          Logout
        </LogoutButton>
      </RightSection>
    </NavbarContainer>
  );
};

export default Navbar;
