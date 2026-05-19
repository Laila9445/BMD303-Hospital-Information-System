import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  UserCircleIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const SidebarContainer = styled.div`
  width: ${({ collapsed }) => (collapsed ? '80px' : '260px')};
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  height: calc(100vh - 64px);
  z-index: 30;
  overflow-y: auto;
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

const SubMenuList = styled.ul`
  list-style: none;
  padding: 0 0 0 36px;
  margin: 4px 0 0 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${({ $open }) => ($open ? '500px' : '0')};
`;

const SubMenuItem = styled.li`
  margin-bottom: 4px;
`;

const SubMenuLink = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  background-color: ${({ active }) => (active ? '#eff6ff' : 'transparent')};
  
  &:hover {
    background-color: #f9fafb;
    color: #2563eb;
  }
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  
  span {
    font-size: 13px;
    font-weight: 500;
  }
`;

const billingSubItems = [
  { icon: ChartBarIcon, label: 'Dashboard', path: '/nurse/billing/dashboard', key: 'billing-dashboard' },
  { icon: DocumentTextIcon, label: 'Invoices', path: '/nurse/billing/invoices', key: 'billing-invoices' },
  { icon: CurrencyDollarIcon, label: 'Payments', path: '/nurse/billing/payments', key: 'billing-payments' },
  { icon: Cog6ToothIcon, label: 'Service Prices', path: '/nurse/billing/services', key: 'billing-services' },
  { icon: ClipboardDocumentListIcon, label: 'Reports', path: '/nurse/billing/reports', key: 'billing-reports' },
];

const nurseMenuItems = [
  { icon: HomeIcon, label: 'Dashboard', path: '/nurse/dashboard', key: 'dashboard' },
  { icon: CalendarDaysIcon, label: 'Appointments', path: '/nurse/appointments', key: 'appointments' },
  { icon: UserGroupIcon, label: 'Patients', path: '/nurse/patients', key: 'patients' },
  { icon: BanknotesIcon, label: 'Billing', path: '/nurse/billing/dashboard', key: 'billing', hasSubItems: true },
  { icon: ClockIcon, label: 'Schedule', path: '/nurse/schedule', key: 'schedule' },
  { icon: UserCircleIcon, label: 'Profile', path: '/nurse/profile', key: 'profile' },
];

const NurseSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [billingOpen, setBillingOpen] = useState(
    location.pathname.startsWith('/nurse/billing')
  );

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isBillingActive = location.pathname.startsWith('/nurse/billing');

  return (
    <SidebarContainer collapsed={collapsed}>
      <LogoSection>
        <Logo collapsed={collapsed}>
          <UserGroupIcon />
          <span>Clinic</span>
        </Logo>
        <ToggleButton onClick={onToggle}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </ToggleButton>
      </LogoSection>

      <MenuList>
        {nurseMenuItems.map((item) => {
          const isActive = item.hasSubItems
            ? isBillingActive
            : location.pathname === item.path;
          return (
            <MenuItem key={item.key}>
              <MenuLink 
                active={isActive} 
                collapsed={collapsed} 
                onClick={() => {
                  if (item.hasSubItems) {
                    setBillingOpen(!billingOpen);
                    if (collapsed) {
                      onToggle();
                    }
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <item.icon />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.hasSubItems && !collapsed && (
                  <ChevronDownIcon
                    style={{
                      width: '16px',
                      height: '16px',
                      transition: 'transform 0.2s',
                      transform: billingOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                )}
              </MenuLink>
              {item.hasSubItems && !collapsed && (
                <SubMenuList $open={billingOpen}>
                  {billingSubItems.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <SubMenuItem key={subItem.key}>
                        <SubMenuLink
                          active={isSubActive}
                          onClick={() => handleNavigation(subItem.path)}
                        >
                          <subItem.icon />
                          <span>{subItem.label}</span>
                        </SubMenuLink>
                      </SubMenuItem>
                    );
                  })}
                </SubMenuList>
              )}
            </MenuItem>
          );
        })}
      </MenuList>
    </SidebarContainer>
  );
};

export default NurseSidebar;
