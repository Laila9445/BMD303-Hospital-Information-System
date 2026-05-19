import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { UserCircleIcon } from '@heroicons/react/24/outline';

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

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  color: white;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 60px;
    height: 60px;
    color: white;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }
  
  p {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }
`;

const NurseProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    department: 'Emergency Care',
    employeeId: 'N' + (user?.userId || '200'),
    shift: 'Morning Shift'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <PageContainer>
      <Header>
        <h1>My Profile</h1>
        <p>View and update your personal information</p>
      </Header>

      <ProfileContainer>
        <Card size="large">
          <CardBody>
            <ProfileHeader>
              <Avatar>
                <UserCircleIcon />
              </Avatar>
              <ProfileInfo>
                <h2>{formData.firstName} {formData.lastName}</h2>
                <p>{formData.email}</p>
                <p style={{ marginTop: '4px', fontWeight: 600 }}>Nurse - {formData.department}</p>
              </ProfileInfo>
            </ProfileHeader>

            <FormGrid>
              <FormGroup>
                <label>First Name</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <label>Last Name</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <label>Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <label>Phone Number</label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <label>Employee ID</label>
                <Input
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <label>Department</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <label>Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Morning Shift">Morning Shift (6AM - 2PM)</option>
                  <option value="Afternoon Shift">Afternoon Shift (2PM - 10PM)</option>
                  <option value="Night Shift">Night Shift (10PM - 6AM)</option>
                </select>
              </FormGroup>
            </FormGrid>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <Button type="submit">
                Save Changes
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </ProfileContainer>
    </PageContainer>
  );
};

export default NurseProfile;
