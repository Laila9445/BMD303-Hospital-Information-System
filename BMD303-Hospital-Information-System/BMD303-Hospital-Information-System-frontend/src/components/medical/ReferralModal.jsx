import { useMemo, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel, SelectWithLabel } from '../../components/common/Input';
import { XMarkIcon } from '@heroicons/react/24/outline';
import referralService from '../../api/referralService';
import { validateConsultationField } from '../../utils/validation';
import { buildReferralType, normalizeUrgency, getReferralId } from '../../utils/referralUtils';
import { getApiErrorMessage } from '../../api/apiUtils';
import { useBilling } from '../../billing';
import { formatCurrency } from '../../billing/billingUtils';
import { useAuth } from '../../context/AuthContext';
import { resolveDoctorId, isActiveBillingService } from '../../utils/doctorUtils';
import { getJwtRole } from '../../utils/authUtils';

/** Shown in Service Name * when referral type is Physiotherapy (matches clinic physio services). */
const PHYSIOTHERAPY_REFERRAL_SERVICES = [
  'Orthopedic Physical Therapy',
  'Post-Surgical Rehabilitation',
  'Sports Injury Rehabilitation',
  'Back and Neck Pain Treatment',
  'Osteoarthritis Treatment',
  'Manual Therapy',
  'Electrotherapy',
];

const serviceMatchesDepartment = (service, department) => {
  const dept = String(department || '').toLowerCase();
  const serviceDept = String(service.department || '').toLowerCase();
  if (serviceDept && serviceDept === dept) return true;
  if (dept === 'physiotherapy') {
    const name = String(service.serviceName || '').toLowerCase();
    return name.includes('physio') || name.includes('rehabilitation');
  }
  return false;
};

/** Doctors create referrals (incl. to Physiotherapy). JWT role wins when present. */
const mayCreateDoctorReferral = (user) => {
  const jwtRole = getJwtRole();
  if (jwtRole === 'Doctor') return true;
  if (jwtRole === 'Physiotherapist' || jwtRole === 'Radiologist') return false;
  return user?.role === 'Doctor';
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: #6b7280;
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 8px;
`;

const ReferralModal = ({ isOpen, onClose, onSuccess, patientId, patientName }) => {
  const { user } = useAuth();
  const { servicesState, createInvoice } = useBilling();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    referralCategory: '',
    serviceName: '',
    reason: '',
    urgency: 'routine',
    notes: ''
  });

  const services = useMemo(() => servicesState.items || [], [servicesState.items]);
  const filteredServices = useMemo(() => {
    if (!formData.referralCategory) return [];

    const fromBilling = services.filter(
      (service) =>
        serviceMatchesDepartment(service, formData.referralCategory) && isActiveBillingService(service)
    );
    if (fromBilling.length > 0) return fromBilling;

    if (formData.referralCategory === 'Physiotherapy') {
      return PHYSIOTHERAPY_REFERRAL_SERVICES.map((label, index) => {
        const billed = services.find((s) => {
          const n = String(s.serviceName || '').toLowerCase();
          const l = label.toLowerCase();
          if (n === l) return true;
          if (l.includes('post-surgical') && n.includes('rehabilitation')) return true;
          if (l.includes('orthopedic') && n.includes('physiotherapy session')) return true;
          return false;
        });
        return {
          id: billed?.id ?? `physio-referral-${index}`,
          serviceName: label,
          department: 'Physiotherapy',
          price: billed?.price ?? 0,
          activeStatus: true,
        };
      });
    }

    return [];
  }, [services, formData.referralCategory]);

  const selectedService = useMemo(
    () =>
      filteredServices.find((service) => service.serviceName === formData.serviceName) ||
      services.find((service) => service.serviceName === formData.serviceName) ||
      null,
    [filteredServices, services, formData.serviceName]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'referralCategory' ? { serviceName: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!mayCreateDoctorReferral(user)) {
        const role = getJwtRole() || user?.role || 'unknown';
        toast.error(
          role === 'Physiotherapist'
            ? 'Referrals to Physiotherapy are created by a Doctor. You are logged in as a Physiotherapist (accept referrals under Physio → Staff). Log out and sign in with your Doctor account, then use Doctor → Referrals.'
            : role === 'Radiologist'
              ? 'Referrals are created by a Doctor only. Log out and sign in with your Doctor account, then use Doctor → Referrals.'
              : `Only Doctor accounts can create referrals. You are signed in as "${role}".`
        );
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.patientId) {
        toast.error('Patient ID is required');
        setLoading(false);
        return;
      }

      if (!formData.referralCategory) {
        toast.error('Referral type is required');
        setLoading(false);
        return;
      }

      if (!formData.serviceName) {
        toast.error('Service is required');
        setLoading(false);
        return;
      }

      if (!formData.reason) {
        toast.error('Reason for referral is required');
        setLoading(false);
        return;
      }

      // Validate reason length
      const reasonError = validateConsultationField(formData.reason, 'Reason', 1000);
      if (reasonError) {
        toast.error(reasonError);
        setLoading(false);
        return;
      }

      // Validate notes length if provided
      if (formData.notes) {
        const notesError = validateConsultationField(formData.notes, 'Notes', 1000);
        if (notesError) {
          toast.error(notesError);
          setLoading(false);
          return;
        }
      }

      const numericPatientId = Number(formData.patientId);
      if (!numericPatientId || Number.isNaN(numericPatientId)) {
        toast.error('Patient ID must be a numeric clinic id (e.g. 2), not a UUID.');
        setLoading(false);
        return;
      }

      const doctorId = await resolveDoctorId(user);
      if (!doctorId) {
        toast.error('Could not resolve doctor profile. Please log in again.');
        setLoading(false);
        return;
      }

      const referralPayload = {
        patientId: numericPatientId,
        doctorId,
        referralType: buildReferralType(formData.referralCategory, formData.serviceName),
        urgency: normalizeUrgency(formData.urgency),
        reason: formData.reason,
        notes: formData.notes || undefined,
      };

      const referralResult = await referralService.createReferral(referralPayload);
      const newReferralId = getReferralId(referralResult);

      const canCreateInvoice = user?.role === 'Nurse' || user?.role === 'Admin';

      if (selectedService && canCreateInvoice) {
        const invoicePatientId = formData.patientId.toString().startsWith('PAT-')
          ? formData.patientId
          : `PAT-${1000 + numericPatientId}`;
        const invoicePatientName =
          patientName || (formData.patientId ? `Patient #${formData.patientId}` : 'Unknown Patient');

        try {
          await createInvoice({
            patientId: invoicePatientId,
            patientName: invoicePatientName,
            department: selectedService.department,
            serviceId: selectedService.id,
            serviceName: selectedService.serviceName,
            price: selectedService.price,
            referenceType: 'Referral',
            referenceId: String(newReferralId),
          });
          toast.success('Referral created and invoice generated!');
        } catch (invoiceError) {
          console.error('Error generating invoice for referral:', invoiceError);
          toast.success(
            getApiErrorMessage(invoiceError, 'Referral created, but invoice generation failed.')
          );
        }
      } else {
        toast.success(
          selectedService
            ? 'Referral created. A nurse will create the billing invoice from Nurse → Billing.'
            : 'Referral created successfully!'
        );
      }

      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        patientId: patientId || '',
        referralCategory: '',
        serviceName: '',
        reason: '',
        urgency: 'routine',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error(getApiErrorMessage(error, 'Failed to create referral'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Create New Referral</h2>
          <CloseButton onClick={onClose}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {!patientId && (
            <FormGroup>
              <InputWithLabel
                label="Patient ID"
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="Enter patient ID"
                required
              />
            </FormGroup>
          )}

          <FormGroup>
            <SelectWithLabel
              label="Referral Type"
              name="referralCategory"
              value={formData.referralCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select referral type...</option>
              <option value="Radiology">Radiology</option>
              <option value="Physiotherapy">Physiotherapy</option>
            </SelectWithLabel>
          </FormGroup>

          <FormGroup>
            <div style={{ marginBottom: '6px', fontSize: '12px', color: '#6b7280' }}>
              Price: {selectedService ? formatCurrency(selectedService.price) : '—'}
            </div>
            <SelectWithLabel
              label="Service Name"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
            >
              <option value="">Select service...</option>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <option key={service.id ?? service.serviceName} value={service.serviceName}>
                    {service.price > 0
                      ? `${service.serviceName} (${formatCurrency(service.price)})`
                      : service.serviceName}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No billing services loaded for {formData.referralCategory || 'this department'}
                </option>
              )}
            </SelectWithLabel>
          </FormGroup>

          <FormGroup>
            <SelectWithLabel
              label="Urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </SelectWithLabel>
          </FormGroup>

          <FormGroup>
            <InputWithLabel
              label="Reason for Referral"
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for referral"
              required
            />
          </FormGroup>

          <FormGroup>
            <InputWithLabel
              label="Additional Notes"
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter additional notes (optional)"
            />
          </FormGroup>

          <SubmitButton 
            type="submit" 
            variant="primary" 
            size="large"
            disabled={loading}
          >
            {loading ? 'Creating Referral...' : 'Create Referral'}
          </SubmitButton>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReferralModal;
