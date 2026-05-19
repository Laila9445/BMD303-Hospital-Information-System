import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarDaysIcon,
  ClockIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

const MainContent = styled.main`
  margin-left: ${({ $sidebarMinimized }) => ($sidebarMinimized ? '80px' : '280px')};
  margin-top: 64px;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
`;

const SidebarContainer = styled.aside`
  width: ${({ $minimized }) => ($minimized ? '80px' : '280px')};
  background-color: #ffffff;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
  padding: 24px 16px;
  position: fixed;
  left: 0;
  top: 80px;
  bottom: 0;
  overflow-y: auto;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const NavSection = styled.div`
  flex: 1;
  margin-bottom: 16px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-left: 12px;
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${({ $active }) => ($active ? '#eff6ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#2563eb' : '#374151')};
  justify-content: ${({ $minimized }) => ($minimized ? 'center' : 'flex-start')};

  &:hover {
    background-color: #f9fafb;
    transform: translateX(4px);
  }

  span {
    font-size: 15px;
    font-weight: 500;
    display: ${({ $minimized }) => ($minimized ? 'none' : 'block')};
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  padding: 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${({ $minimized }) => ($minimized ? 'none' : 'block')};
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
  padding: 0 12px;
  display: ${({ $minimized }) => ($minimized ? 'none' : 'block')};
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fecaca;
  }
`;

const RadiologySidebar = ({ minimized, onToggleMinimize }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isRadiology } = useAuth();

  const isDoctorViewer = user?.role === 'Doctor';
  const dashboardPath = isDoctorViewer ? '/radiology/dashboard' : '/radiology/staff';
  const schedulePath = isDoctorViewer ? '/doctor/schedule' : '/radiology/schedule';

  const menuItems = [
    {
      icon: HomeIcon,
      label: 'Dashboard',
      path: dashboardPath,
      key: 'dashboard',
      match: (p) => p === '/radiology/staff' || p === '/radiology/dashboard',
    },
    {
      icon: CalendarDaysIcon,
      label: 'Appointments',
      path: '/radiology/appointments',
      key: 'appointments',
      match: (p) => p === '/radiology/appointments',
    },
    {
      icon: ClockIcon,
      label: 'Schedule',
      path: schedulePath,
      key: 'schedule',
      match: (p) =>
        p === '/radiology/schedule' || (isDoctorViewer && p === '/doctor/schedule'),
    },
    {
      icon: Squares2X2Icon,
      label: 'Services',
      path: '/radiology/services',
      key: 'services',
      match: (p) => p === '/radiology/services',
    },
  ];

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email || 'User';

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarContainer $minimized={minimized}>
      <div
        style={{
          display: 'flex',
          justifyContent: minimized ? 'center' : 'flex-end',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={onToggleMinimize}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {minimized ? (
            <Bars3Icon style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          ) : (
            <XMarkIcon style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          )}
        </button>
      </div>

      <NavSection>
        {!minimized && <h4>RADIOLOGY</h4>}
        {menuItems.map((item) => (
          <NavItem
            key={item.key}
            $active={item.match(location.pathname)}
            $minimized={minimized}
            onClick={() => navigate(item.path)}
          >
            <IconWrapper>
              <item.icon style={{ width: '22px', height: '22px' }} />
            </IconWrapper>
            <span>{item.label}</span>
          </NavItem>
        ))}
      </NavSection>

      <SidebarFooter>
        <UserName $minimized={minimized}>{displayName}</UserName>
        <UserRole $minimized={minimized}>
          {isRadiology ? 'Radiologist' : user?.role || 'Radiologist'}
        </UserRole>
        <LogoutButton type="button" onClick={handleLogout} title="Log out">
          <ArrowRightOnRectangleIcon style={{ width: '18px', height: '18px' }} />
          {!minimized && 'Logout'}
        </LogoutButton>
      </SidebarFooter>
    </SidebarContainer>
  );
};

const RadiologyLayout = ({ children }) => {
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  return (
    <LayoutContainer>
      <Navbar />
      <RadiologySidebar
        minimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
      />
      <MainContent $sidebarMinimized={sidebarMinimized}>{children}</MainContent>
    </LayoutContainer>
  );
};

export default RadiologyLayout;
