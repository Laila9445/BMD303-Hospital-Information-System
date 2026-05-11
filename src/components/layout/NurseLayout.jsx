import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NurseSidebar from './NurseSidebar';
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

const NurseLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <LayoutContainer>
      <NurseSidebar 
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

export default NurseLayout;
