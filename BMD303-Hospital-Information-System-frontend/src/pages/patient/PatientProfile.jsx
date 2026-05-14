import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import HomeButton from '../../components/common/HomeButton';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import mockDatabase from '../../api/mockDatabase';

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

const ProfileCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  margin-bottom: 32px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  
  svg {
    width: 72px;
    height: 72px;
    color: white;
  }
`;

const Name = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 8px 0;
`;

const Email = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const PatientIdBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 24px;
  background-color: white;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  span {
    font-size: 20px;
    font-weight: 700;
    color: #2563eb;
    letter-spacing: 1px;
  }
  
  label {
    font-size: 13px;
    color: #9ca3af;
    text-transform: uppercase;
    font-weight: 600;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InfoItem = styled.div`
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
  
  label {
    display: block;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 6px;
  }
  
  .value {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: #111827;
    font-weight: 500;
    
    svg {
      width: 18px;
      height: 18px;
      color: #6b7280;
    }
  }
`;

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser) {
        toast.error('User not found. Please login again.');
        navigate('/login');
        return;
      }

      // Get full patient data from mock database
      const allUsers = mockDatabase.users.findAll();
      const patient = allUsers.find(u => u.userId === currentUser.userId);
      
      setPatientData(patient || currentUser);
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <HomeButton />
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HomeButton />
      <Header>
        <h1>My Profile</h1>
        <p>View and manage your personal information</p>
      </Header>

      <ProfileCard size="large">
        <CardBody>
          {/* Profile Header with Avatar */}
          <ProfileHeader>
            <Avatar>
              <UserCircleIcon />
            </Avatar>
            
            <Name>
              {patientData?.firstName || user?.firstName} {patientData?.lastName || user?.lastName}
            </Name>
            
            <Email>
              {patientData?.email || user?.email}
            </Email>
            
            <PatientIdBadge>
              <IdentificationIcon style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              <div>
                <label>Patient ID</label>
                <span>#{patientData?.userId || user?.userId || user?.id}</span>
              </div>
            </PatientIdBadge>
          </ProfileHeader>

          {/* Personal Information */}
          <InfoSection>
            <SectionTitle>Personal Information</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <label>Email Address</label>
                <div className="value">
                  <EnvelopeIcon />
                  {patientData?.email || user?.email}
                </div>
              </InfoItem>
              
              <InfoItem>
                <label>Phone Number</label>
                <div className="value">
                  <PhoneIcon />
                  {patientData?.phoneNumber || 'Not provided'}
                </div>
              </InfoItem>
              
              <InfoItem>
                <label>Date of Birth</label>
                <div className="value">
                  <CalendarIcon />
                  {patientData?.dateOfBirth 
                    ? new Date(patientData.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Not provided'}
                </div>
              </InfoItem>
              
              <InfoItem>
                <label>Gender</label>
                <div className="value">
                  {patientData?.gender || 'Not specified'}
                </div>
              </InfoItem>
              
              <InfoItem>
                <label>Patient ID</label>
                <div className="value" style={{ color: '#2563eb', fontWeight: '700' }}>
                  #{patientData?.userId || user?.userId || user?.id}
                </div>
              </InfoItem>
              
              <InfoItem>
                <label>Account Type</label>
                <div className="value">
                  {patientData?.role || user?.role || 'Patient'}
                </div>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            
            
            <Button 
              variant="secondary" 
              style={{ flex: 1 }}
              onClick={() => {
                toast.info('Profile editing will be available soon');
              }}
            >
              Edit Profile
            </Button>
          </div>
        </CardBody>
      </ProfileCard>
    </PageContainer>
  );
};

export default PatientProfile;
