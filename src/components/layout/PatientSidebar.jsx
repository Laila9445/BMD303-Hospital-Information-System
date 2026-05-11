import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const SidebarContainer = styled.div`
  width: ${({ collapsed }) => (collapsed ? '80px' : '260px')};
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 10;
`;

const LogoSection = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  min-height: 70px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2563eb;
  
  svg {
    width: 32px;
    height: 32px;
  }
  
  span {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    ${({ collapsed }) => collapsed && 'display: none;'}
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #6b7280;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 16px 12px;
  margin: 0;
  flex: 1;
`;

const MenuItem = styled.li`
  margin-bottom: 8px;
`;

const MenuLink = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: #374151;
  background-color: ${({ active }) => (active ? '#eff6ff' : 'transparent')};
  
  &:hover {
    background-color: #f9fafb;
    color: #2563eb;
  }
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  
  span {
    font-size: 15px;
    font-weight: 500;
    ${({ collapsed }) => collapsed && 'display: none;'}
  }
`;

const patientMenuItems = [
  { icon: HomeIcon, label: 'Dashboard', path: '/patient/dashboard', key: 'dashboard' },
  { icon: CalendarDaysIcon, label: 'Appointments', path: '/patient/appointments', key: 'appointments' },
  { icon: ClipboardDocumentIcon, label: 'Medical Records', path: '/patient/medical-records', key: 'records' },
  { icon: UserCircleIcon, label: 'Profile', path: '/patient/profile', key: 'profile' },
];

const PatientSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <SidebarContainer collapsed={collapsed}>
      <LogoSection>
        <Logo collapsed={collapsed}>
          <ClipboardDocumentIcon />
          <span>Clinic</span>
        </Logo>
        <ToggleButton onClick={onToggle}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </ToggleButton>
      </LogoSection>

      <MenuList>
        {patientMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <MenuItem key={item.key}>
              <MenuLink 
                active={isActive} 
                collapsed={collapsed} 
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon />
                <span>{item.label}</span>
              </MenuLink>
            </MenuItem>
          );
        })}
      </MenuList>
    </SidebarContainer>
  );
};

export default PatientSidebar;
