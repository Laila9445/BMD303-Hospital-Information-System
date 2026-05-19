import { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ClipboardDocumentIcon, DocumentTextIcon, AcademicCapIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import mockDatabase from '../../api/mockDatabase';

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

const ReadOnlyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 6px 12px;
  background-color: #fef3c7;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
  font-weight: 600;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const InfoCard = styled(Card)`
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  
  svg {
    width: 24px;
    height: 24px;
    color: #2563eb;
  }
`;

const InfoContent = styled.div`
  p {
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
    margin: 0;
  }
`;

const PatientMedicalRecords = () => {
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser) {
        toast.error('User not found. Please login again.');
        return;
      }

      // Get medical records from mock database (prescriptions as example)
      const prescriptions = mockDatabase.prescriptions.findAll({ patientId: currentUser.userId });
      const appointments = mockDatabase.appointments.findAll({ patientId: currentUser.userId });
      
      // Create medical record from data
      setMedicalRecord({
        allergies: 'No known allergies', // Would come from doctor's notes
        chronicConditions: prescriptions.length > 0 ? 'Under medication' : 'None',
        currentMedications: prescriptions.map(p => p.medicationName).join(', ') || 'None',
        surgicalHistory: 'No previous surgeries',
        familyHistory: 'No significant family history',
        totalVisits: appointments.length,
        lastVisit: appointments.length > 0 ? appointments[appointments.length - 1].appointmentDate : 'N/A'
      });
    } catch (error) {
      console.error('Error loading medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const recordSections = [
    {
      icon: ClipboardDocumentIcon,
      title: 'Allergies',
      content: medicalRecord?.allergies || 'Not recorded'
    },
    {
      icon: DocumentTextIcon,
      title: 'Chronic Conditions',
      content: medicalRecord?.chronicConditions || 'Not recorded'
    },
    {
      icon: AcademicCapIcon,
      title: 'Current Medications',
      content: medicalRecord?.currentMedications || 'Not recorded'
    },
    {
      icon: ClipboardDocumentIcon,
      title: 'Surgical History',
      content: medicalRecord?.surgicalHistory || 'Not recorded'
    },
    {
      icon: DocumentTextIcon,
      title: 'Family History',
      content: medicalRecord?.familyHistory || 'Not recorded'
    }
  ];

  return (
    <PageContainer>
      <Header>
        <h1>Medical Records</h1>
        <p>Your complete medical history and health information</p>
        <ReadOnlyBadge>
          <LockClosedIcon />
          Read-Only - Managed by your doctor
        </ReadOnlyBadge>
      </Header>

      <Card size="large">
        <CardBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading medical records...
            </div>
          ) : medicalRecord ? (
            <InfoGrid>
              {recordSections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <InfoCard key={index}>
                    <CardBody>
                      <InfoHeader>
                        <IconComponent />
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                          {section.title}
                        </h3>
                      </InfoHeader>
                      <InfoContent>
                        <p>{section.content}</p>
                      </InfoContent>
                    </CardBody>
                  </InfoCard>
                );
              })}
            </InfoGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <ClipboardDocumentIcon style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Medical Records</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Your medical records will appear here once created by your doctor.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default PatientMedicalRecords;
