import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  BeakerIcon,
  DocumentTextIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

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
`;

const NavSection = styled.div`
  margin-bottom: 32px;
  
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

const Sidebar = ({ minimized, onToggleMinimize }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDoctor } = useAuth();

  const doctorMenuItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/doctor/dashboard', key: 'dashboard' },
    { icon: CalendarDaysIcon, label: 'Appointments', path: '/doctor/appointments', key: 'appointments' },
    { icon: UserGroupIcon, label: 'Patients', path: '/doctor/patients', key: 'patients' },
    { icon: ClipboardDocumentIcon, label: 'Consultations', path: '/doctor/consultations', key: 'consultations' },
    { icon: BeakerIcon, label: 'Prescriptions', path: '/doctor/prescriptions', key: 'prescriptions' },
    { icon: BeakerIcon, label: 'Medical Imaging', path: '/doctor/imaging', key: 'imaging' },
    { icon: DocumentTextIcon, label: 'Referrals', path: '/doctor/referrals', key: 'referrals' },
    { icon: UserIcon, label: 'Profile', path: '/doctor/profile', key: 'profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <SidebarContainer $minimized={minimized}>
      <div style={{ display: 'flex', justifyContent: minimized ? 'center' : 'flex-end', marginBottom: '16px' }}>
        <button
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
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          {minimized ? <Bars3Icon style={{ width: '20px', height: '20px', color: '#6b7280' }} /> : <XMarkIcon style={{ width: '20px', height: '20px', color: '#6b7280' }} />}
        </button>
      </div>
      <NavSection>
        {!minimized && <h4>Main Menu</h4>}
        
        {isDoctor && doctorMenuItems.map((item) => (
          <NavItem
            key={item.key}
            $active={isActive(item.path)}
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
    </SidebarContainer>
  );
};

export default Sidebar;
