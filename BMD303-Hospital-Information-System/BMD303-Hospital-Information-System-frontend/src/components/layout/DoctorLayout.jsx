import styled from 'styled-components';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

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

const DoctorLayout = ({ children }) => {
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  return (
    <LayoutContainer>
      <Navbar />
      <Sidebar minimized={sidebarMinimized} onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)} />
      <MainContent $sidebarMinimized={sidebarMinimized}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default DoctorLayout;
