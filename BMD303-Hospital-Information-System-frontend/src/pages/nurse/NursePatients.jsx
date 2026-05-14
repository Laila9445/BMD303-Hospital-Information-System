import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import mockDatabase from '../../api/mockDatabase';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { UserGroupIcon, MagnifyingGlassIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

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

const SearchContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const PatientCard = styled(Card)`
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const NursePatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('Loading all patients from database...');
      
      // Get all patients from mock database
      const allUsers = mockDatabase.users.findAll();
      const patients = allUsers.filter(u => u.role === 'Patient');
      
      console.log('Loaded patients:', patients);
      
      // Enrich with appointment data
      const patientsWithAppointments = patients.map(patient => {
        const patientAppointments = mockDatabase.appointments.findAll({ patientId: patient.userId });
        const upcomingAppointments = patientAppointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed');
        const completedAppointments = patientAppointments.filter(a => a.status === 'Completed');
        
        return {
          patientId: patient.userId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          dateOfBirth: patient.dateOfBirth || '1990-01-01',
          gender: patient.gender || 'Not specified',
          lastVisit: completedAppointments.length > 0 
            ? completedAppointments[completedAppointments.length - 1].appointmentDate 
            : 'N/A',
          appointments: patientAppointments.map(appt => ({
            id: appt.appointmentId,
            date: appt.appointmentDate,
            time: appt.startTime,
            status: appt.status.toLowerCase(),
            type: appt.reasonForVisit || 'Appointment'
          }))
        };
      });
      
      setPatients(patientsWithAppointments);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase().trim();
    
    // If no search query, show all patients
    if (!query) return true;
    
    // Search by name (first or last)
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    
    // Search by ID
    const idMatch = String(patient.patientId).includes(query);
    
    // Search by name
    const nameMatch = fullName.includes(query) || 
                      patient.firstName.toLowerCase().includes(query) || 
                      patient.lastName.toLowerCase().includes(query);
    
    // Search by email
    const emailMatch = patient.email.toLowerCase().includes(query);
    
    return idMatch || nameMatch || emailMatch;
  });

  return (
    <PageContainer>
      <Header>
        <h1>Patient Directory</h1>
        <p>Search patients and view their upcoming / past appointments</p>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search by patient ID, name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Showing {filteredPatients.length} of {patients.length} patients
        </p>
        {searchQuery && (
          <Button 
            size="small" 
            variant="outline" 
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </Button>
        )}
      </div>

      <Card size="large">
        <CardBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading patients...
            </div>
          ) : filteredPatients.length > 0 ? (
            <PatientsGrid>
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.patientId}>
                  <CardBody>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <UserGroupIcon style={{ width: '40px', height: '40px', color: '#2563eb' }} />
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                          ID: {patient.patientId}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>
                        <strong>Email:</strong> {patient.email}
                      </p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>
                        <strong>Phone:</strong> {patient.phoneNumber}
                      </p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>
                        <strong>Gender:</strong> {patient.gender}
                      </p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>
                        <strong>Last Visit:</strong> {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      size="small"
                      variant="outline"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/nurse/appointments?patientId=${patient.patientId}`)}
                    >
                      View Appointments
                    </Button>
                  </CardBody>
                </PatientCard>
              ))}
            </PatientsGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <UserGroupIcon style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Patients Found</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {searchQuery ? 'Try a different search term.' : 'No patients registered yet.'}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default NursePatients;
