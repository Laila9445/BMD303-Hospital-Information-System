import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../api/doctorService';
import referralService from '../../api/referralService';
import consultationService from '../../api/consultationService';
import { unwrapList, getApiErrorMessage } from '../../api/apiUtils';
import { resolveDoctorId } from '../../utils/doctorUtils';
import prescriptionService from '../../api/prescriptionService';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import HomeButton from '../../components/common/HomeButton';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ClipboardDocumentIcon, 
  ClockIcon,
  FolderIcon,
  BuildingLibraryIcon,
  ArrowRightCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getStatusColor, getStatusText } from '../../utils/statusUtils';
import ReferralModal from '../../components/medical/ReferralModal';

const PageContainer = styled.div`
  padding: 8px 12px 12px 12px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 8px;
  
  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 2px 0;
  }
  
  p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px !important;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eff6ff;
  
  svg {
    width: 24px;
    height: 24px;
    color: #2563eb;
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
    font-size: 12px;
    color: #6b7280;
    margin: 2px 0 0 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const ModuleCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MinimizeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
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

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const SearchIcon = styled(MagnifyingGlassIcon)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
`;

const ModuleIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor || '#eff6ff'};
  
  svg {
    width: 22px;
    height: 22px;
    color: ${props => props.color || '#2563eb'};
  }
`;

const ModuleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px 0;
`;

const ModuleDescription = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    pendingConsultations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [minimizedModules, setMinimizedModules] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isPatientSearching, setIsPatientSearching] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // Get current user
  const currentUser = user || JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const domainDoctorId = await resolveDoctorId(user || currentUser);
      if (!domainDoctorId) {
        toast.error('Doctor profile not found. Log out and sign in again, or contact admin.');
        setTodayAppointments([]);
        setReferrals([]);
        setPrescriptions([]);
        setStats({ todayCount: 0, pendingConsultations: 0 });
        return;
      }

      const [appointmentsData, referralsData, prescriptionsData, pendingConsultations] = await Promise.all([
        doctorService.getTodayAppointments(),
        referralService.getDoctorReferrals(domainDoctorId).catch(() => []),
        prescriptionService.getDoctorPrescriptions(domainDoctorId).catch(() => []),
        consultationService.getDoctorPending().catch(() => []),
      ]);

      const appointmentList = unwrapList(appointmentsData);
      const pendingList = unwrapList(pendingConsultations);

      setTodayAppointments(appointmentList);
      setReferrals(unwrapList(referralsData));
      setPrescriptions(unwrapList(prescriptionsData));

      setStats({
        todayCount: appointmentList.length,
        pendingConsultations: pendingList.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data', error);
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard'));
      setTodayAppointments([]);
      setReferrals([]);
      setPrescriptions([]);
      setStats({ todayCount: 0, pendingConsultations: 0 });
    } finally {
      setLoading(false);
    }
  };

  const toggleMinimize = (index) => {
    setMinimizedModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSearchChange = (index, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handlePatientSearch = async (query) => {
    setPatientSearchQuery(query);
    
    if (!query || query.trim() === '') {
      setPatientSearchResults([]);
      setIsPatientSearching(false);
      return;
    }

    try {
      setIsPatientSearching(true);
      const results = await doctorService.searchPatients(query);
      setPatientSearchResults(Array.isArray(results) ? results : (results?.patients || results?.data || []));
    } catch (error) {
      toast.error('Failed to search patients');
      setPatientSearchResults([]);
    } finally {
      setIsPatientSearching(false);
    }
  };

  const modules = [
    {
      title: 'Appointments',
      description: 'Manage daily appointments and schedules',
      icon: CalendarDaysIcon,
      path: '/doctor/appointments',
      bgColor: '#dbeafe',
      color: '#1d4ed8',
      stat: `${stats.todayCount} Today`
    },
    {
      title: 'Consultations',
      description: 'Create and review consultations',
      icon: ClipboardDocumentIcon,
      path: '/doctor/consultations',
      bgColor: '#fef3c7',
      color: '#b45309',
      stat: `${stats.pendingConsultations} Pending`
    },
    {
      title: 'Schedule',
      description: 'View and manage your availability',
      icon: ClockIcon,
      path: '/doctor/schedule',
      bgColor: '#e0e7ff',
      color: '#4338ca',
      stat: 'Upcoming shifts'
    },
    {
      title: 'Medical Imaging',
      description: 'Review X-rays, MRIs, and scans',
      icon: FolderIcon,
      path: '/doctor/imaging',
      bgColor: '#fce7f3',
      color: '#be185d',
      stat: 'Pending reviews'
    },
    {
      title: 'Referrals',
      description: 'Manage specialist referrals',
      icon: BuildingLibraryIcon,
      path: '/doctor/referrals',
      bgColor: '#ccfbf1',
      color: '#0f766e',
      stat: 'Active referrals'
    },
    {
      title: 'Prescriptions',
      description: 'Manage patient prescriptions',
      icon: DocumentTextIcon,
      path: '/doctor/consultations',
      bgColor: '#fed7aa',
      color: '#c2410c',
      stat: 'Recent scripts'
    }
  ];

  return (
    <PageContainer>
      <HomeButton />
      <Header>
        <h1>Welcome back, {currentUser?.firstName || currentUser?.lastName || 'Doctor'}!</h1>
        <p>Access all your tools and manage patient care from one place</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <CalendarDaysIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.todayCount}</h3>
            <p>Today's Appointments</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon>
            <ClipboardDocumentIcon />
          </StatIcon>
          <StatInfo>
            <h3>{stats.pendingConsultations}</h3>
            <p>Pending Consultations</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <SectionTitle style={{ marginBottom: '12px', fontSize: '18px' }}>Quick Access Modules</SectionTitle>
      
      {/* Patient Search and Referrals - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* Patient Search Section */}
        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ModuleIcon bgColor="#d1fae5" color="#047857">
                <UserGroupIcon />
              </ModuleIcon>
              <div style={{ flex: 1 }}>
                <ModuleTitle>Patient Search</ModuleTitle>
                <ModuleDescription>Search for patients by ID or name</ModuleDescription>
              </div>
            </div>
            
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search by patient ID or name..."
                value={patientSearchQuery}
                onChange={(e) => handlePatientSearch(e.target.value)}
              />
            </SearchContainer>

            {isPatientSearching && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                Searching...
              </div>
            )}

            {patientSearchResults.length > 0 && (
              <div style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
                {patientSearchResults.slice(0, 3).map((patient) => (
                  <div
                    key={patient.patientId}
                    onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
                    style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#fff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          ID: {patient.patientId} • {patient.gender} • {patient.age || 'N/A'} years
                        </div>
                      </div>
                      <ArrowRightCircleIcon style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                    </div>
                  </div>
                ))}
                {patientSearchResults.length > 3 && (
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => navigate('/doctor/patients')}
                    style={{ marginTop: '8px' }}
                  >
                    View All Results ({patientSearchResults.length})
                  </Button>
                )}
              </div>
            )}

            {!isPatientSearching && patientSearchQuery && patientSearchResults.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
                No patients found. Try searching by ID or name.
              </div>
            )}
          </CardBody>
        </Card>

        {/* Referrals Section */}
        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ModuleIcon bgColor="#fef3c7" color="#b45309">
                <ArrowPathIcon />
              </ModuleIcon>
              <div style={{ flex: 1 }}>
                <ModuleTitle>Referrals</ModuleTitle>
                <ModuleDescription>Manage radiology & pharmacy referrals</ModuleDescription>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Create referrals for radiology, pharmacy, or specialist consultations.
              </p>
              
              <Button 
                variant="primary" 
                size="small" 
                onClick={() => setIsReferralModalOpen(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ArrowPathIcon style={{ width: '18px', height: '18px' }} />
                Create New Referral
              </Button>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Recent Referrals</span>
                <Button size="small" variant="outline" onClick={() => navigate('/doctor/referrals')}>
                  View All
                </Button>
              </div>
              {referrals.length > 0 ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {referrals.slice(0, 3).map((referral) => (
                    <div
                      key={referral.referralId}
                      style={{
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                            {referral.referralType?.charAt(0).toUpperCase() + referral.referralType?.slice(1)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Patient: {referral.patientId} • {referral.urgency}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                          {referral.status?.charAt(0).toUpperCase() + referral.status?.slice(1)}
                        </div>
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                        {referral.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>
                  No recent referrals yet.
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
      
      <ContentGrid>
        {modules.map((module, index) => {
          const IconComponent = module.icon;
          const isMinimized = minimizedModules[index];
          return (
            <ModuleCard key={index} size="large">
              <CardBody>
                <ModuleHeader>
                  <ModuleIcon bgColor={module.bgColor} color={module.color}>
                    <IconComponent />
                  </ModuleIcon>
                  <MinimizeButton onClick={() => toggleMinimize(index)}>
                    {isMinimized ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  </MinimizeButton>
                </ModuleHeader>
                <ModuleTitle>{module.title}</ModuleTitle>
                {!isMinimized && (
                  <>
                    <ModuleDescription>{module.description}</ModuleDescription>
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                        {module.stat}
                      </span>
                    </div>
                    <SearchContainer>
                      <SearchIcon />
                      <SearchInput
                        type="text"
                        placeholder={`Search ${module.title.toLowerCase()}...`}
                        value={searchQueries[index] || ''}
                        onChange={(e) => handleSearchChange(index, e.target.value)}
                      />
                    </SearchContainer>
                    {module.title === 'Appointments' && (
                      <div style={{ marginTop: '16px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Today's Appointments</h4>
                        {(() => {
                          const query = searchQueries[index] || '';
                          const filteredAppointments = todayAppointments.filter(appointment =>
                            appointment.patientName?.toLowerCase().includes(query.toLowerCase()) ||
                            appointment.reasonForVisit?.toLowerCase().includes(query.toLowerCase())
                          );
                          return filteredAppointments.length > 0 ? (
                            filteredAppointments.slice(0, 5).map((appointment) => (
                              <div key={appointment.appointmentId} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{appointment.patientName}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)}</div>
                                  </div>
                                  <div style={{ fontSize: '12px', color: getStatusColor(appointment.status), fontWeight: 500 }}>
                                    {getStatusText(appointment.status)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
                              {query ? 'No appointments match your search.' : 'No appointments today.'}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                    {module.title !== 'Appointments' && (
                      <>
                        {module.title === 'Referrals' && (
                          <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Recent Referrals</h4>
                            {referrals.length > 0 ? (
                              referrals.slice(0, 3).map((referral) => (
                                <div key={referral.referralId} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                        {referral.referralType?.charAt(0).toUpperCase() + referral.referralType?.slice(1)}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        Patient: {referral.patientId} • {referral.urgency}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                                      {referral.status?.charAt(0).toUpperCase() + referral.status?.slice(1)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
                                No referrals yet.
                              </p>
                            )}
                          </div>
                        )}

                        {module.title === 'Prescriptions' && (
                          <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Recent Prescriptions</h4>
                            {prescriptions.length > 0 ? (
                              prescriptions.slice(0, 3).map((prescription) => (
                                <div key={prescription.prescriptionId} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                        Prescription #{prescription.prescriptionId}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        Patient: {prescription.patientId}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                                      {prescription.status?.charAt(0).toUpperCase() + prescription.status?.slice(1)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
                                No prescriptions yet.
                              </p>
                            )}
                          </div>
                        )}

                        {module.title !== 'Referrals' && module.title !== 'Prescriptions' && (
                          <div style={{ marginTop: '16px' }}>
                            <Button 
                              size="small" 
                              variant="primary" 
                              style={{ width: '100%' }}
                              onClick={() => navigate(module.path)}
                            >
                              View All {module.title}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardBody>
            </ModuleCard>
          );
        })}
      </ContentGrid>

      {/* Referral Modal */}
      <ReferralModal 
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        onSuccess={() => {
          toast.success('Referral created successfully!');
          loadDashboardData();
        }}
      />
    </PageContainer>
  );
};

export default DoctorDashboard;
