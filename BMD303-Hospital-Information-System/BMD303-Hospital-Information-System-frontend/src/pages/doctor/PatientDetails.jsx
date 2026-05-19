import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import appointmentService from '../../api/appointmentService';
import { unwrapApiResponse } from '../../api/apiUtils';
import { addRecentPatient } from '../../utils/patientSearchUtils';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowRightIcon, UserCircleIcon, CalendarIcon, ClipboardDocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import UploadMedicalImageModal from '../../components/medical/UploadMedicalImageModal';
import { unwrapList } from '../../api/apiUtils';
import { getStatusText } from '../../utils/statusUtils';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #f3f4f6;
    }
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    flex: 1;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
`;

const InfoSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  span:first-child {
    color: #6b7280;
    font-weight: 500;
  }
  
  span:last-child {
    color: #111827;
    font-weight: 400;
  }
`;

const MedicalHistoryItem = styled.div`
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
  }
`;

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [medicalImages, setMedicalImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState([]);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);

      const patientData = unwrapApiResponse(await doctorService.getPatientRecord(patientId));
      if (!patientData) {
        toast.error('Patient not found');
        navigate('/doctor/patients');
        return;
      }

      setPatient(patientData);
      addRecentPatient(patientData);
      setMedicalRecord(patientData?.medicalRecord || patientData?.medicalHistory || null);

      const images = await doctorService.getPatientMedicalImages(patientId);
      setMedicalImages(unwrapList(images));

      const embedded = patientData?.appointments || patientData?.upcomingAppointments;
      if (Array.isArray(embedded) && embedded.length > 0) {
        setPatientAppointments(embedded);
      } else {
        try {
          const allAppts = unwrapList(await appointmentService.getDoctorAppointments());
          setPatientAppointments(
            allAppts.filter((a) => String(a.patientId ?? a.PatientId) === String(patientId))
          );
        } catch {
          setPatientAppointments([]);
        }
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
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

  if (!patient) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Patient not found
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Button onClick={() => navigate('/doctor/patients')}>
          <ArrowRightIcon style={{ width: '24px', height: '24px' }} />
        </Button>
        <h1>Patient Medical Record</h1>
      </Header>

      <ContentGrid>
        <div>
          <Card size="large">
            <CardHeader>
              <h3>Personal Information</h3>
            </CardHeader>
            <CardBody>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <UserCircleIcon style={{ width: '100px', height: '100px', color: '#9ca3af' }} />
                <h2 style={{ margin: '16px 0 4px 0', fontSize: '24px', fontWeight: 600 }}>
                  {patient.firstName} {patient.lastName}
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  {patient.email}
                </p>
              </div>

              <InfoSection>
                <InfoRow>
                  <span>Date of Birth</span>
                  <span>
                    {new Date(patient.dateOfBirth).toLocaleDateString('en-US')} 
                    ({Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))} years)
                  </span>
                </InfoRow>
                <InfoRow>
                  <span>Gender</span>
                  <span>{patient.gender === 'Male' ? 'Male' : patient.gender === 'Female' ? 'Female' : 'Not Specified'}</span>
                </InfoRow>
                <InfoRow>
                  <span>Address</span>
                  <span>{patient.address || 'Not Available'}</span>
                </InfoRow>
                <InfoRow>
                  <span>Phone Number</span>
                  <span>{patient.phoneNumber || 'Not Available'}</span>
                </InfoRow>
                <InfoRow>
                  <span>Emergency Contact</span>
                  <span>{patient.emergencyContact || 'Not Available'}</span>
                </InfoRow>
              </InfoSection>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card size="large">
            <CardHeader>
              <h3>Medical Record</h3>
            </CardHeader>
            <CardBody>
              {!medicalRecord ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                  No medical record available for this patient yet
                </div>
              ) : (
                <>
                  <MedicalHistoryItem>
                    <h4>🤒 Allergies</h4>
                    <p>{medicalRecord.allergies || 'None'}</p>
                  </MedicalHistoryItem>

                  <MedicalHistoryItem>
                    <h4>🏥 Chronic Conditions</h4>
                    <p>{medicalRecord.chronicConditions || 'None'}</p>
                  </MedicalHistoryItem>

                  <MedicalHistoryItem>
                    <h4>💊 Current Medications</h4>
                    <p>{medicalRecord.currentMedications || 'None'}</p>
                  </MedicalHistoryItem>

                  <MedicalHistoryItem>
                    <h4>🔪 Surgical History</h4>
                    <p>{medicalRecord.surgicalHistory || 'None'}</p>
                  </MedicalHistoryItem>

                  <MedicalHistoryItem>
                    <h4>👨‍👩‍👧 Family History</h4>
                    <p>{medicalRecord.familyHistory || 'None'}</p>
                  </MedicalHistoryItem>
                </>
              )}
            </CardBody>
            <CardFooter style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Button variant="primary" onClick={() => navigate(`/doctor/patients/${patientId}/consultation`)}>
                <ClipboardDocumentIcon style={{ width: '20px', height: '20px' }} />
                New Consultation
              </Button>
              <Button variant="secondary" onClick={() => setUploadModalOpen(true)}>
                <PhotoIcon style={{ width: '20px', height: '20px' }} />
                Add Medical Image
              </Button>
            </CardFooter>
          </Card>

          <Card size="large" style={{ marginTop: '24px' }}>
            <CardHeader>
              <h3>Appointments ({patientAppointments.length})</h3>
            </CardHeader>
            <CardBody>
              {patientAppointments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', margin: 0 }}>No appointments on record.</p>
              ) : (
                patientAppointments.slice(0, 8).map((appt) => (
                  <div
                    key={appt.appointmentId}
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2563eb',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {appt.appointmentDate
                        ? new Date(appt.appointmentDate).toLocaleDateString()
                        : '—'}{' '}
                      {appt.startTime?.substring?.(0, 5) || ''}
                      {appt.doctorName ? ` · ${appt.doctorName}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>
                      {getStatusText(appt.status)} · {appt.reasonForVisit || 'Visit'}
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card size="large" style={{ marginTop: '24px' }}>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Medical Images ({medicalImages.length})</h3>
              <Button variant="secondary" size="small" onClick={() => setUploadModalOpen(true)}>
                  Add image
                </Button>
              </CardHeader>
              <CardBody>
                {medicalImages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', margin: 0 }}>
                    No images yet. Use &quot;Add Medical Image&quot; to upload X-rays, MRI, etc.
                  </p>
                ) : (
                <>
                {medicalImages.slice(0, 6).map((image) => (
                  <div key={image.imageId} style={{ 
                    padding: '12px', 
                    marginBottom: '12px', 
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <CalendarIcon style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{image.imageType}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(image.dateUploaded).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>
                ))}
                  </>
                )}
              </CardBody>
            </Card>
        </div>
      </ContentGrid>

      <UploadMedicalImageModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        patientId={patientId}
        patientName={`${patient.firstName} ${patient.lastName}`}
        onUploaded={loadPatientData}
      />
    </PageContainer>
  );
};

export default PatientDetails;
