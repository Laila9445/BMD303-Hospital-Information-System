import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import mockDatabase from '../../api/mockDatabase';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import HomeButton from '../../components/common/HomeButton';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ClipboardDocumentIcon,
  ClockIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../billing';
import { formatCurrency } from '../../billing/billingUtils';

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #dbeafe;
  
  svg {
    width: 28px;
    height: 28px;
    color: #1d4ed8;
  }
`;

const StatInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  
  p {
    font-size: 13px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const QuickActionCard = styled(Card)`
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background-color: ${props => props.bgColor || '#dbeafe'};
  
  svg {
    width: 32px;
    height: 32px;
    color: ${props => props.color || '#1d4ed8'};
  }
`;

const ActionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const ActionDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuickAction = styled(Button)`
  width: 100%;
  margin-bottom: 12px;
  justify-content: flex-start;
`;

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invoicesState, paymentsState } = useBilling();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  const billingStats = useMemo(() => {
    const invoices = invoicesState.items || [];
    const payments = paymentsState.items || [];
    const today = new Date().toISOString().slice(0, 10);
    const todaysRevenue = payments
      .filter((p) => p.date === today)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingPayments = invoices.filter((i) => i.status === 'Pending').length;
    const paidInvoices = invoices.filter((i) => i.status === 'Paid').length;
    const activeAppointments = invoices.filter(
      (i) => i.status === 'Pending' && i.referenceType === 'Appointment'
    ).length;
    return { todaysRevenue, pendingPayments, paidInvoices, activeAppointments };
  }, [invoicesState.items, paymentsState.items]);

  console.log('NurseDashboard - User:', user);
  console.log('NurseDashboard - Rendering with stats:', stats);

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
      
      console.log('Loading nurse dashboard for:', currentUser.firstName, currentUser.lastName);
      
      // Get all appointments for today
      const today = new Date().toISOString().split('T')[0];
      const allAppointments = mockDatabase.appointments.findAll({ date: today });
      const allPatients = mockDatabase.users.findAll().filter(u => u.role === 'Patient');
      
      setStats({
        todayAppointments: allAppointments.length,
        totalPatients: allPatients.length,
        pendingTasks: allAppointments.filter(a => a.status === 'Scheduled').length,
      });
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
        <h1>Welcome, {user?.firstName || 'Nurse'}!</h1>
        <p>Manage patient appointments and assist with daily operations</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <CalendarDaysIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <UserGroupIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <ClipboardDocumentIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.pendingTasks}</h3>
            <p>Pending Tasks</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Billing Overview Section */}
      <SectionTitle>
        <BanknotesIcon style={{ width: '24px', height: '24px' }} />
        Billing Overview
      </SectionTitle>

      <StatsGrid>
        <StatCard>
          <StatIcon style={{ backgroundColor: '#dcfce7' }}>
            <CurrencyDollarIcon style={{ color: '#15803d' }} />
          </StatIcon>
          <StatInfo>
            <h3>{formatCurrency(billingStats.todaysRevenue)}</h3>
            <p>Today's Revenue</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon style={{ backgroundColor: '#fef3c7' }}>
            <ChartBarIcon style={{ color: '#b45309' }} />
          </StatIcon>
          <StatInfo>
            <h3>{billingStats.pendingPayments}</h3>
            <p>Pending Payments</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon style={{ backgroundColor: '#dbeafe' }}>
            <ClipboardDocumentIcon style={{ color: '#1d4ed8' }} />
          </StatIcon>
          <StatInfo>
            <h3>{billingStats.paidInvoices}</h3>
            <p>Paid Invoices</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon style={{ backgroundColor: '#fce7f3' }}>
            <CalendarDaysIcon style={{ color: '#be185d' }} />
          </StatIcon>
          <StatInfo>
            <h3>{billingStats.activeAppointments}</h3>
            <p>Awaiting Payment</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Quick Actions Section */}
      <SectionTitle>
        <Cog6ToothIcon style={{ width: '24px', height: '24px' }} />
        Quick Actions
      </SectionTitle>
      
      <ContentGrid>
        <QuickActionCard onClick={() => navigate('/nurse/appointments')}>
          <CardBody>
            <ActionIcon bgColor="#dbeafe" color="#1d4ed8">
              <CalendarDaysIcon />
            </ActionIcon>
            <ActionTitle>Appointments</ActionTitle>
            <ActionDescription>
              View, book, and manage all patient appointments. Check patients in and update status.
            </ActionDescription>
            <Button variant="outline" size="small" style={{ width: '100%' }}>
              Manage Appointments
            </Button>
          </CardBody>
        </QuickActionCard>

        <QuickActionCard onClick={() => navigate('/nurse/patients')}>
          <CardBody>
            <ActionIcon bgColor="#dcfce7" color="#15803d">
              <UserGroupIcon />
            </ActionIcon>
            <ActionTitle>Patients</ActionTitle>
            <ActionDescription>
              Browse patient records, view contact information, and access medical history.
            </ActionDescription>
            <Button variant="outline" size="small" style={{ width: '100%' }}>
              View Patients
            </Button>
          </CardBody>
        </QuickActionCard>

        <QuickActionCard onClick={() => navigate('/nurse/billing/dashboard')}>
          <CardBody>
            <ActionIcon bgColor="#fef3c7" color="#b45309">
              <BanknotesIcon />
            </ActionIcon>
            <ActionTitle>Billing Dashboard</ActionTitle>
            <ActionDescription>
              Track revenue, manage invoices, confirm payments, and view billing reports.
            </ActionDescription>
            <Button variant="outline" size="small" style={{ width: '100%' }}>
              Open Billing
            </Button>
          </CardBody>
        </QuickActionCard>

        <QuickActionCard onClick={() => navigate('/nurse/billing/services')}>
          <CardBody>
            <ActionIcon bgColor="#ede9fe" color="#7c3aed">
              <Cog6ToothIcon />
            </ActionIcon>
            <ActionTitle>Service Pricing</ActionTitle>
            <ActionDescription>
              Manage service prices dynamically. Update consultation, imaging, and physio fees.
            </ActionDescription>
            <Button variant="outline" size="small" style={{ width: '100%' }}>
              Manage Prices
            </Button>
          </CardBody>
        </QuickActionCard>

        <QuickActionCard onClick={() => navigate('/nurse/schedule')}>
          <CardBody>
            <ActionIcon bgColor="#e0e7ff" color="#4338ca">
              <ClockIcon />
            </ActionIcon>
            <ActionTitle>Schedule</ActionTitle>
            <ActionDescription>
              Manage clinic schedules, working hours, and appointment availability.
            </ActionDescription>
            <Button variant="outline" size="small" style={{ width: '100%' }}>
              View Schedule
            </Button>
          </CardBody>
        </QuickActionCard>
      </ContentGrid>

    </PageContainer>
  );
};

export default NurseDashboard;
