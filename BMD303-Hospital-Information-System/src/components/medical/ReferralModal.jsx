import { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel, SelectWithLabel } from '../../components/common/Input';
import { XMarkIcon } from '@heroicons/react/24/outline';
import referralService from '../../api/referralService';
import { useReferrals } from '../../context/ReferralContext';
import { validateConsultationField } from '../../utils/validation';
import { normalizeUrgency } from '../../utils/referralUtils';

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    referralType: '',
    reason: '',
    urgency: 'routine',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      if (!formData.referralType) {
        toast.error('Referral type is required');
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
      const referralPayload = {
        patientId: Number(formData.patientId),
        doctorId: currentUser?.userId || currentUser?.id,
        referralType: formData.referralType,
        urgency: normalizeUrgency(formData.urgency),
        reason: formData.reason,
        notes: formData.notes || undefined,
      };

      const type = formData.referralType.startsWith('radiology-')
        ? 'Radiology'
        : formData.referralType.startsWith('physiotherapy-')
          ? 'Physiotherapy'
          : 'Physiotherapy';

      addReferral({
        patientName: patientName || (formData.patientId ? `Patient #${formData.patientId}` : ''),
        patientId: formData.patientId,
        diagnosis: formData.reason,
        notes: formData.notes || '',
        type,
      });

      await referralService.createReferral(referralPayload);
      
      toast.success('Referral created successfully!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        patientId: patientId || '',
        referralType: '',
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
              name="referralType"
              value={formData.referralType}
              onChange={handleChange}
              required
            >
              <option value="">Select referral type...</option>
              
              {/* Radiology Options */}
              <optgroup label="📷 Radiology">
                <option value="radiology-xray">X-Ray (Chest/Extremities)</option>
                <option value="radiology-ct">CT Scan (Head/Body)</option>
                <option value="radiology-mri">MRI (Brain/Spine/Joints)</option>
                <option value="radiology-ultrasound">Ultrasound (Abdomen/Pelvic)</option>
                <option value="radiology-mammography">Mammography (Breast)</option>
                <option value="radiology-dexa">DEXA Scan (Bone Density)</option>
                <option value="radiology-angiography">Angiography (Vascular)</option>
                <option value="radiology-fluoroscopy">Fluoroscopy (GI Tract)</option>
              </optgroup>
              
              {/* Physiotherapy Options */}
              <optgroup label="💪 Physiotherapy">
                <option value="physiotherapy-orthopedic">Orthopedic Rehabilitation</option>
                <option value="physiotherapy-neurological">Neurological Rehabilitation</option>
                <option value="physiotherapy-cardiopulmonary">Cardiopulmonary Rehabilitation</option>
                <option value="physiotherapy-sports">Sports Injury Rehabilitation</option>
                <option value="physiotherapy-pediatric">Pediatric Physiotherapy</option>
                <option value="physiotherapy-geriatric">Geriatric Rehabilitation</option>
                <option value="physiotherapy-musculoskeletal">Musculoskeletal Therapy</option>
                <option value="physiotherapy-post-surgical">Post-Surgical Rehabilitation</option>
                <option value="physiotherapy-chronic-pain">Chronic Pain Management</option>
                <option value="physiotherapy-balance">Balance and Vestibular Therapy</option>
                <option value="physiotherapy-womens">Women's Health Physiotherapy</option>
              </optgroup>
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
