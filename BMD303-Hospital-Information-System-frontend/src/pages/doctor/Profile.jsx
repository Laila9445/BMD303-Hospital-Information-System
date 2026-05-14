import { useState, useEffect } from 'react';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel } from '../../components/common/Input';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
`;

const ProfileCard = styled(Card)`
  text-align: center;
`;

const AvatarSection = styled.div`
  padding: 32px 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
  
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    margin: 0 auto 16px;
    background-color: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 80px;
      height: 80px;
      color: #2563eb;
    }
  }
  
  h2 {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 600;
    color: #111827;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
`;

const InfoItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 16px;
    color: #111827;
    font-weight: 500;
  }
`;

const DoctorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    specialization: '',
    licenseNumber: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getProfile();
      setProfile(data);
      if (data) {
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          specialization: data.specialization || '',
          licenseNumber: data.licenseNumber || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await doctorService.updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditMode(false);
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          Loading...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <h1>Profile</h1>
        <p>View and update your personal information</p>
      </Header>

      <ContentGrid>
        <ProfileCard size="large">
          <AvatarSection>
            <div className="avatar">
              <UserCircleIcon />
            </div>
            <h2>Dr. {profile?.firstName} {profile?.lastName}</h2>
            <p>{profile?.specialization || 'Orthopedic Specialist'}</p>
          </AvatarSection>

          <CardBody>
            <InfoItem>
              <div className="label">Email Address</div>
              <div className="value">{profile?.email || user?.email}</div>
            </InfoItem>
            
            <InfoItem>
              <div className="label">Phone Number</div>
              <div className="value">{profile?.phoneNumber || 'Not Available'}</div>
            </InfoItem>
            
            <InfoItem>
              <div className="label">Specialization</div>
              <div className="value">{profile?.specialization || 'Orthopedic Specialist'}</div>
            </InfoItem>
            
            <InfoItem>
              <div className="label">License Number</div>
              <div className="value">{profile?.licenseNumber || 'Not Available'}</div>
            </InfoItem>
          </CardBody>
        </ProfileCard>

        <Card size="large">
          <CardHeader>
            <h3>Personal Information</h3>
            {!editMode && (
              <Button 
                size="small" 
                variant="primary"
                onClick={() => setEditMode(true)}
                style={{ float: 'right' }}
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardBody>
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <InputWithLabel
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />

                <InputWithLabel
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />

                <InputWithLabel
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />

                <InputWithLabel
                  label="Specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Orthopedic Specialist"
                  required
                />

                <InputWithLabel
                  label="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <Button type="submit" variant="primary" style={{ flex: 1 }}>
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <InfoItem>
                  <div className="label">Full Name</div>
                  <div className="value">{profile?.firstName} {profile?.lastName}</div>
                </InfoItem>
                
                <InfoItem>
                  <div className="label">Phone Number</div>
                  <div className="value">{profile?.phoneNumber || 'Not Available'}</div>
                </InfoItem>
                
                <InfoItem>
                  <div className="label">Specialization</div>
                  <div className="value">{profile?.specialization || 'Orthopedic Specialist'}</div>
                </InfoItem>
                
                <InfoItem>
                  <div className="label">License Number</div>
                  <div className="value">{profile?.licenseNumber || 'Not Available'}</div>
                </InfoItem>
              </div>
            )}
          </CardBody>
        </Card>
      </ContentGrid>
    </PageContainer>
  );
};

export default DoctorProfile;
