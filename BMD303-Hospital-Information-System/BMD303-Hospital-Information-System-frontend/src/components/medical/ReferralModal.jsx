import { useMemo, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel, SelectWithLabel } from '../../components/common/Input';
import { XMarkIcon } from '@heroicons/react/24/outline';
import referralService from '../../api/referralService';
import { useReferrals } from '../../context/ReferralContext';
import { validateConsultationField } from '../../utils/validation';
import { useBilling } from '../../billing';
import { formatCurrency } from '../../billing/billingUtils';

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
  const { addReferral } = useReferrals();
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
    return services.filter(
      (service) => service.department === formData.referralCategory && service.activeStatus
    );
  }, [services, formData.referralCategory]);

  const selectedService = useMemo(
    () => services.find((service) => service.serviceName === formData.serviceName),
    [services, formData.serviceName]
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

      // Get current user to include doctor information
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const referralData = {
        ...formData,
        referralType: formData.serviceName,
        doctorId: currentUser?.userId || currentUser?.id,
        doctorName: `${currentUser?.firstName} ${currentUser?.lastName}`,
        createdDate: new Date().toISOString(),
        status: 'Pending'
      };

      const type = formData.referralCategory;

      addReferral({
        patientName: patientName || (formData.patientId ? `Patient #${formData.patientId}` : ''),
        patientId: formData.patientId,
        diagnosis: formData.reason,
        notes: formData.notes || '',
        type,
        serviceName: formData.serviceName,
      });

      const referralResult = await referralService.createReferral(referralData);
      const newReferralId = referralResult?.referralId || referralResult?.id || referralResult?.data?.referralId || Date.now();

      // Auto-generate invoice for the referral
      if (selectedService) {
        const invoicePatientId = formData.patientId
          ? (formData.patientId.startsWith('PAT-') ? formData.patientId : `PAT-${1000 + Number(formData.patientId)}`)
          : 'PAT-1001';
        const invoicePatientName = patientName || (formData.patientId ? `Patient #${formData.patientId}` : 'Unknown Patient');

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
          toast.success('Referral created, but invoice generation failed.');
        }
      } else {
        toast.success('Referral created successfully!');
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create referral';
      toast.error(errorMessage);
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
              {formData.referralCategory === 'Radiology' && (
                <>
                  <option value="X-Ray">X-Ray (Chest/Extremities)</option>
                  <option value="CT Scan">CT Scan (Head/Body)</option>
                  <option value="MRI">MRI (Brain/Spine/Joints)</option>
                  <option value="Ultrasound">Ultrasound (Abdomen/Pelvic)</option>
                  <option value="Mammography">Mammography (Breast)</option>
                  <option value="DEXA Scan">DEXA Scan (Bone Density)</option>
                  <option value="Angiography">Angiography (Vascular)</option>
                  <option value="Fluoroscopy">Fluoroscopy (GI Tract)</option>
                </>
              )}
              {formData.referralCategory === 'Physiotherapy' && (
                <>
                  <option value="Orthopedic Rehabilitation">Orthopedic Rehabilitation</option>
                  <option value="Neurological Rehabilitation">Neurological Rehabilitation</option>
                  <option value="Cardiopulmonary Rehabilitation">Cardiopulmonary Rehabilitation</option>
                  <option value="Sports Injury Rehabilitation">Sports Injury Rehabilitation</option>
                  <option value="Pediatric Physiotherapy">Pediatric Physiotherapy</option>
                  <option value="Geriatric Rehabilitation">Geriatric Rehabilitation</option>
                  <option value="Musculoskeletal Therapy">Musculoskeletal Therapy</option>
                  <option value="Post-Surgical Rehabilitation">Post-Surgical Rehabilitation</option>
                  <option value="Chronic Pain Management">Chronic Pain Management</option>
                  <option value="Balance and Vestibular Therapy">Balance and Vestibular Therapy</option>
                  <option value="Women's Health Physiotherapy">Women's Health Physiotherapy</option>
                </>
              )}
              {filteredServices.length > 0 && (
                <optgroup label="Available Services">
                  {filteredServices.map((service) => (
                    <option key={service.id} value={service.serviceName}>
                      {service.serviceName}
                    </option>
                  ))}
                </optgroup>
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
