import { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { SelectWithLabel, InputWithLabel } from '../common/Input';
import medicalImageService from '../../api/medicalImageService';
import { getApiErrorMessage } from '../../api/apiUtils';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const Panel = styled.div`
  background: #fff;
  border-radius: 12px;
  width: min(480px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
`;

const Body = styled.div`
  padding: 24px;
`;

const IMAGE_TYPES = [
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'Lab Result',
  'Other',
];

const UploadMedicalImageModal = ({ isOpen, onClose, patientId, patientName, onUploaded }) => {
  const [imageType, setImageType] = useState('X-Ray');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose an image file');
      return;
    }
    if (!patientId) {
      toast.error('Patient is required');
      return;
    }

    setLoading(true);
    try {
      await medicalImageService.uploadImage(patientId, file, imageType, description);
      toast.success('Medical image uploaded');
      setFile(null);
      setDescription('');
      onUploaded?.();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload image'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Add medical image</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XMarkIcon style={{ width: 24, height: 24, color: '#6b7280' }} />
          </button>
        </Header>
        <Body>
          {patientName && (
            <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>
              Patient: <strong>{patientName}</strong>
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                Image file <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <SelectWithLabel
              label="Image type"
              name="imageType"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              required
            >
              {IMAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </SelectWithLabel>
            <InputWithLabel
              label="Description (optional)"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this image"
            />
            <Button type="submit" variant="primary" size="large" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload image'}
            </Button>
          </form>
        </Body>
      </Panel>
    </Overlay>
  );
};

export default UploadMedicalImageModal;
