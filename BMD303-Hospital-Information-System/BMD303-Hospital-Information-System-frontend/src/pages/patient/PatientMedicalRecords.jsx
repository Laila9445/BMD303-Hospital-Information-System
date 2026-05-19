import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import { ClipboardDocumentIcon, DocumentTextIcon, AcademicCapIcon, LockClosedIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import referralService from '../../api/referralService';
import { unwrapList } from '../../api/apiUtils';
import { getStatusColor, getStatusText } from '../../utils/statusUtils';
import { getPatientRecordId } from '../../utils/doctorUtils';
import { useAuth } from '../../context/AuthContext';
import { getReferralId } from '../../utils/referralUtils';

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

const ReferralsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    padding: 14px 12px;
    font-size: 14px;
    border-bottom: 1px solid #f3f4f6;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ $bg }) => $bg || '#e5e7eb'};
  color: ${({ $color }) => $color || '#374151'};
`;

const PatientMedicalRecords = () => {
  const { user } = useAuth();
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');
      if (!currentUser) {
        toast.error('Please log in again');
        return;
      }

      const patientId = getPatientRecordId(currentUser) ?? currentUser.userId ?? currentUser.id;

      let referralList = [];
      try {
        referralList = unwrapList(await referralService.getPatientReferrals(patientId));
      } catch {
        try {
          const mine = unwrapList(await referralService.getMyReferrals());
          referralList = mine.filter(
            (r) =>
              String(r.patientId) === String(patientId) ||
              String(r.patientExternalId) === String(patientId)
          );
        } catch {
          referralList = [];
        }
      }
      setReferrals(referralList);

      setMedicalRecord({
        allergies: 'See your doctor for detailed records',
        chronicConditions: referralList.length > 0 ? 'Active referrals on file' : 'None recorded',
        currentMedications: 'See prescriptions page',
        surgicalHistory: 'Not recorded in portal',
        familyHistory: 'Not recorded in portal',
        totalVisits: '—',
        lastVisit: '—',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadData]);

  const recordSections = [
    { icon: ClipboardDocumentIcon, title: 'Allergies', content: medicalRecord?.allergies || 'Not recorded' },
    { icon: DocumentTextIcon, title: 'Chronic Conditions', content: medicalRecord?.chronicConditions || 'Not recorded' },
    { icon: AcademicCapIcon, title: 'Current Medications', content: medicalRecord?.currentMedications || 'Not recorded' },
    { icon: ClipboardDocumentIcon, title: 'Surgical History', content: medicalRecord?.surgicalHistory || 'Not recorded' },
    { icon: DocumentTextIcon, title: 'Family History', content: medicalRecord?.familyHistory || 'Not recorded' },
  ];

  return (
    <PageContainer>
      <Header>
        <h1>Medical Records</h1>
        <p>Your health summary and referrals from your care team</p>
        <ReadOnlyBadge>
          <LockClosedIcon />
          Read-only — updated by clinic staff
        </ReadOnlyBadge>
      </Header>

      <Card size="large" style={{ marginBottom: 24 }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BuildingLibraryIcon style={{ width: 24, height: 24, color: '#2563eb' }} />
            <h2 style={{ margin: 0, fontSize: 18 }}>Referrals ({referrals.length})</h2>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p style={{ color: '#6b7280', margin: 0 }}>Loading referrals...</p>
          ) : referrals.length === 0 ? (
            <p style={{ color: '#6b7280', margin: 0 }}>
              No referrals yet. When your doctor sends you to radiology or physiotherapy, they will appear here.
            </p>
          ) : (
            <ReferralsTable>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => {
                  const status = referral.status || 'Pending';
                  return (
                    <tr key={getReferralId(referral)}>
                      <td>{referral.referralType || '—'}</td>
                      <td>{referral.reason || '—'}</td>
                      <td>{referral.urgency || 'Routine'}</td>
                      <td>
                        <StatusBadge
                          $bg={getStatusColor(status)}
                          $color={getStatusColor(status, true)}
                        >
                          {getStatusText(status)}
                        </StatusBadge>
                      </td>
                      <td>
                        {referral.createdAt
                          ? new Date(referral.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </ReferralsTable>
          )}
        </CardBody>
      </Card>

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
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{section.title}</h3>
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
              <ClipboardDocumentIcon style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 16px' }} />
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
