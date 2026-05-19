import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import NurseSidebar from './NurseSidebar';
import Navbar from './Navbar';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

/* Navbar renders at the top and spans full viewport width */
/* Sidebar is fixed, starting below the navbar (top: 64px) */
/* MainContent shifts right by sidebar width and down by navbar height */

const MainContent = styled.div`
  margin-left: ${({ $sidebarCollapsed }) => ($sidebarCollapsed ? '80px' : '260px')};
  margin-top: 64px;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
`;

const NurseLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <LayoutContainer>
      {/* Navbar is a root-level sibling → spans full page width */}
      <Navbar />
      <NurseSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default NurseLayout;
