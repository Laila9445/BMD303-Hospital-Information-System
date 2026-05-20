import { useState, useEffect } from 'react';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import { getApiErrorMessage } from '../../api/apiUtils';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel } from '../../components/common/Input';
import { MagnifyingGlassIcon, UserCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-end;
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const PatientCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  
  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 32px;
      height: 32px;
      color: #2563eb;
    }
  }
  
  .info {
    flex: 1;
    
    h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }
`;

const PatientDetails = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  
  p {
    margin: 8px 0;
    font-size: 14px;
    color: #374151;
    
    strong {
      color: #6b7280;
    }
  }
`;

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load all patients on initial load for demo
    loadAllPatients();
  }, []);

  const normalizePatient = (p) => ({
    patientId: p.patientId ?? p.PatientId ?? p.userId,
    firstName: p.firstName ?? p.FirstName ?? '',
    lastName: p.lastName ?? p.LastName ?? '',
    email: p.email ?? p.Email ?? '',
    phoneNumber: p.phoneNumber ?? p.PhoneNumber ?? '',
    dateOfBirth: p.dateOfBirth ?? p.DateOfBirth ?? null,
    gender: p.gender ?? p.Gender ?? '',
  });

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllPatients();
      setPatients((Array.isArray(data) ? data : []).map(normalizePatient));
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error(getApiErrorMessage(error, 'Failed to load patients'));
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all patients
      loadAllPatients();
      return;
    }

    try {
      setLoading(true);
      
      const data = await doctorService.searchPatients(searchQuery.trim());
      setPatients((Array.isArray(data) ? data : []).map(normalizePatient));
      
      if (results.length === 0) {
        toast.info('No patients found matching your search');
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search for patients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <h1>Patient Records</h1>
        <p>Search and view patient medical records</p>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Search for a Patient</h3>
        </CardHeader>
        <CardBody>
          <SearchBar>
            <div style={{ flex: 1 }}>
              <InputWithLabel
                label="Search by patient name or email"
                placeholder="Type patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="primary" onClick={handleSearch} disabled={loading}>
              <MagnifyingGlassIcon style={{ width: '20px', height: '20px' }} />
              Search
            </Button>
          </SearchBar>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Searching...
            </div>
          )}

          {!loading && patients.length > 0 && (
            <PatientGrid>
              {patients.map((patient) => (
                <PatientCard 
                  key={patient.patientId}
                  onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
                >
                  <PatientInfo>
                    <div className="avatar">
                      <UserCircleIcon />
                    </div>
                    <div className="info">
                      <h3>{patient.firstName} {patient.lastName}</h3>
                      <p>{patient.email}</p>
                    </div>
                  </PatientInfo>
                  
                  <PatientDetails>
                    <p>
                      <strong>Date of Birth:</strong>{' '}
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US') : 'Not Available'}
                    </p>
                    <p>
                      <strong>Gender:</strong>{' '}
                      {patient.gender === 'Male' ? 'Male' : patient.gender === 'Female' ? 'Female' : 'Not Specified'}
                    </p>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      <Button size="small" variant="primary">
                        <DocumentTextIcon style={{ width: '16px', height: '16px' }} />
                        View Medical Record
                      </Button>
                    </div>
                  </PatientDetails>
                </PatientCard>
              ))}
            </PatientGrid>
          )}

          {!loading && searchQuery && patients.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <UserCircleIcon style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Patients Found</h3>
              <p>Try searching for: Mohamed, Sarah, Omar, Fatima, or Khaled</p>
            </div>
          )}
          
          {!loading && !searchQuery && patients.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <UserCircleIcon style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Patients Registered</h3>
              <p>No patients have registered yet.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Patients;
