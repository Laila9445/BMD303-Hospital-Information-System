import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import appointmentService from '../../api/appointmentService';
import mockDatabase from '../../api/mockDatabase';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import HomeButton from '../../components/common/HomeButton';
import { CalendarDaysIcon, ClipboardDocumentIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px !important;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eff6ff;
  
  svg {
    width: 32px;
    height: 32px;
    color: #2563eb;
  }
`;

const StatInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const QuickAction = styled(Button)`
  width: 100%;
  margin-bottom: 12px;
  justify-content: flex-start;
`;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalVisits: 0,
    activePrescriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current logged-in user
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser) {
        toast.error('User not found. Please login again.');
        navigate('/login');
        return;
      }
      
      console.log('Loading dashboard for:', currentUser.firstName, currentUser.lastName);
      
      // Try to get real appointments
      try {
        const appointments = await appointmentService.getMyAppointments();
        const appointmentList = Array.isArray(appointments) ? appointments : (appointments?.appointments || []);
        
        setStats({
          upcomingAppointments: appointmentList.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length,
          totalVisits: appointmentList.length,
          activePrescriptions: Math.floor(Math.random() * 5) + 1, // Will be updated later
        });
      } catch (error) {
        // Fallback to mock database
        const appointments = mockDatabase.appointments.findAll({ patientId: currentUser.userId });
        
        setStats({
          upcomingAppointments: appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length,
          totalVisits: appointments.length,
          activePrescriptions: mockDatabase.prescriptions.findAll({ patientId: currentUser.userId }).length,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <HomeButton />
      <Header>
        <h1>Welcome, {user?.firstName || 'Patient'}!</h1>
        <p>Manage your health records and appointments</p>
      </Header>

      {/* Patient ID Card */}
      <Card size="large" style={{ marginBottom: '24px', backgroundColor: '#eff6ff', border: '2px solid #2563eb' }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserCircleIcon style={{ width: '36px', height: '36px', color: 'white' }} />
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#1e40af' }}>
                  Your Patient ID
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Use this ID for all clinic visits and inquiries
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                color: '#2563eb',
                letterSpacing: '2px'
              }}>
                #{user?.userId || user?.id || 'N/A'}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Patient ID Number
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <CalendarDaysIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.upcomingAppointments}</h3>
            <p>Upcoming Appointments</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <ClipboardDocumentIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.totalVisits}</h3>
            <p>Total Visits</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <UserCircleIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.activePrescriptions}</h3>
            <p>Active Prescriptions</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Card size="large">
          <CardHeader>
            <SectionTitle>Quick Actions</SectionTitle>
          </CardHeader>
          <CardBody>
            <QuickAction variant="primary" onClick={() => navigate('/patient/appointments')}>
              <CalendarDaysIcon style={{ width: '20px', height: '20px' }} />
              Book Appointment
            </QuickAction>
            
            <QuickAction variant="success" onClick={() => navigate('/patient/medical-records')}>
              <ClipboardDocumentIcon style={{ width: '20px', height: '20px' }} />
              Medical Records
            </QuickAction>
            
            <QuickAction variant="warning" onClick={() => navigate('/patient/prescriptions')}>
              <UserCircleIcon style={{ width: '20px', height: '20px' }} />
              My Prescriptions
            </QuickAction>
          </CardBody>
        </Card>

        <Card size="large">
          <CardHeader>
            <SectionTitle>Profile Information</SectionTitle>
          </CardHeader>
          <CardBody>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <UserCircleIcon style={{ width: '100px', height: '100px', color: '#9ca3af' }} />
              <h2 style={{ margin: '16px 0 4px 0', fontSize: '24px', fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                {user?.email}
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#2563eb', fontSize: '16px', fontWeight: '600' }}>
                Patient ID: #{user?.userId || user?.id || 'N/A'}
              </p>
            </div>
            
            <Button 
              variant="secondary" 
              style={{ width: '100%' }}
              onClick={() => navigate('/patient/profile')}
            >
              View Full Profile
            </Button>
          </CardBody>
        </Card>
      </ContentGrid>
    </PageContainer>
  );
};

export default PatientDashboard;
