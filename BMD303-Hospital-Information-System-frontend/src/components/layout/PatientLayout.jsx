import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from './PatientSidebar';
import Navbar from './Navbar';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f9fafb;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: ${({ sidebarCollapsed }) => (sidebarCollapsed ? '80px' : '260px')};
  transition: margin-left 0.3s ease;
  overflow-y: auto;
`;

const PatientLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <LayoutContainer>
      <PatientSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Navbar onLogout={handleLogout} />
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default PatientLayout;
