import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import doctorService from '../../api/doctorService';
import { unwrapApiResponse, unwrapList } from '../../api/apiUtils';
import { getPatientRecordId } from '../../utils/doctorUtils';
import { addRecentPatient } from '../../utils/patientSearchUtils';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel } from '../../components/common/Input';
import UploadMedicalImageModal from '../../components/medical/UploadMedicalImageModal';
import { ArrowLeftIcon, PhotoIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useBilling } from '../../billing';

const NOTES_KEY_PREFIX = 'clinic_consultation_notes_';

const PageContainer = styled.div`
  padding: 32px;
  background: #f9fafb;
  min-height: 100vh;
`;

const Banner = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;

  &.ok {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  &.warn {
    background: #fffbeb;
    color: #92400e;
    border: 1px solid #fde68a;
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const PatientConsultation = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentFromState = location.state?.appointment;
  const { invoicesState } = useBilling();

  const [patient, setPatient] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notes, setNotes] = useState({ symptoms: '', diagnosis: '', clinicalNotes: '' });
  const [savingNotes, setSavingNotes] = useState(false);

  const loadPatient = useCallback(async () => {
    setLoading(true);
    try {
      const record = unwrapApiResponse(await doctorService.getPatientRecord(patientId));
      setPatient(record);
      addRecentPatient(record);

      const imgData = await doctorService.getPatientMedicalImages(patientId);
      setImages(unwrapList(imgData));

      const saved = sessionStorage.getItem(`${NOTES_KEY_PREFIX}${patientId}`);
      if (saved) {
        try {
          setNotes(JSON.parse(saved));
        } catch {
          /* ignore */
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not load patient record');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const paymentStatus = useMemo(() => {
    if (!appointmentFromState?.appointmentId) return null;
    const invoice = (invoicesState.items || []).find(
      (inv) =>
        inv.referenceType === 'Appointment' &&
        String(inv.referenceId) === String(appointmentFromState.appointmentId)
    );
    if (!invoice) return 'Not Invoiced';
    return invoice.status;
  }, [appointmentFromState, invoicesState.items]);

  const canStartConsultation = useMemo(() => {
    if (!appointmentFromState) return true;
    const status = appointmentFromState.status;
    if (paymentStatus === 'Paid') return true;
    if (['Confirmed', 'CheckedIn', 'InProgress', 'Completed'].includes(status)) return true;
    return false;
  }, [appointmentFromState, paymentStatus]);

  const handleSaveNotes = () => {
    setSavingNotes(true);
    try {
      sessionStorage.setItem(`${NOTES_KEY_PREFIX}${patientId}`, JSON.stringify(notes));
      toast.success('Consultation notes saved (this browser session)');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <p style={{ color: '#6b7280' }}>Loading consultation...</p>
      </PageContainer>
    );
  }

  if (!patient) {
    return (
      <PageContainer>
        <p>Patient not found.</p>
        <Button variant="secondary" onClick={() => navigate('/doctor/patients')}>
          Back to patients
        </Button>
      </PageContainer>
    );
  }

  const displayName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || `Patient #${patientId}`;

  return (
    <PageContainer>
      <Button variant="secondary" size="small" onClick={() => navigate(`/doctor/patients/${patientId}`)} style={{ marginBottom: 16 }}>
        <ArrowLeftIcon style={{ width: 18, height: 18, marginRight: 6 }} />
        Back to patient record
      </Button>

      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700 }}>Consultation — {displayName}</h1>
      <p style={{ margin: '0 0 24px', color: '#6b7280' }}>
        Patient ID: {getPatientRecordId(patient)}
        {appointmentFromState
          ? ` · Appointment ${appointmentFromState.startTime?.slice(0, 5) || ''} (${appointmentFromState.status})`
          : ''}
      </p>

      {canStartConsultation ? (
        <Banner className="ok">
          <CheckCircleIcon />
          <div>
            <strong>You can start this consultation.</strong> Add clinical notes and upload images. Images are saved on
            the server and remain after refresh.
          </div>
        </Banner>
      ) : (
        <Banner className="warn">
          <ExclamationCircleIcon />
          <div>
            <strong>Payment or check-in required.</strong> Ask Nurse/Reception to create and mark the consultation
            invoice as <strong>Paid</strong>, or set the appointment to <strong>Confirmed</strong> /{' '}
            <strong>Checked In</strong> on the Appointments page. You can still upload images and draft notes.
          </div>
        </Banner>
      )}

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <Card size="large">
          <CardHeader>
            <h3 style={{ margin: 0 }}>Clinical notes</h3>
          </CardHeader>
          <CardBody>
            <InputWithLabel
              label="Symptoms"
              name="symptoms"
              value={notes.symptoms}
              onChange={(e) => setNotes((n) => ({ ...n, symptoms: e.target.value }))}
              placeholder="Patient symptoms..."
            />
            <InputWithLabel
              label="Diagnosis"
              name="diagnosis"
              value={notes.diagnosis}
              onChange={(e) => setNotes((n) => ({ ...n, diagnosis: e.target.value }))}
              placeholder="Working diagnosis..."
            />
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Notes</label>
            <textarea
              value={notes.clinicalNotes}
              onChange={(e) => setNotes((n) => ({ ...n, clinicalNotes: e.target.value }))}
              rows={5}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              placeholder="Examination findings, plan, follow-up..."
            />
            <Button
              variant="primary"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              style={{ marginTop: 16, width: '100%' }}
            >
              {savingNotes ? 'Saving...' : 'Save notes'}
            </Button>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Notes are kept in this browser until a backend consultation API is available. Medical images use the
              server and persist across refresh.
            </p>
          </CardBody>
        </Card>

        <Card size="large">
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Medical images ({images.length})</h3>
            <Button variant="primary" size="small" onClick={() => setUploadOpen(true)}>
              <PhotoIcon style={{ width: 16, height: 16, marginRight: 4 }} />
              Upload image
            </Button>
          </CardHeader>
          <CardBody>
            {images.length === 0 ? (
              <p style={{ color: '#6b7280', margin: 0 }}>No images yet. Use Upload to add X-ray, MRI, lab results, etc.</p>
            ) : (
              images.map((img) => (
                <div
                  key={img.imageId}
                  style={{
                    padding: 12,
                    marginBottom: 10,
                    background: '#f9fafb',
                    borderRadius: 8,
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{img.imageType || 'Image'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {img.description || '—'}
                    {img.dateUploaded ? ` · ${new Date(img.dateUploaded).toLocaleString()}` : ''}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <UploadMedicalImageModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        patientId={patientId}
        patientName={displayName}
        onUploaded={loadPatient}
      />
    </PageContainer>
  );
};

export default PatientConsultation;
