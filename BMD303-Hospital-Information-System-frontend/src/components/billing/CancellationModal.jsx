import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, X, ShieldOff } from 'lucide-react';
import { formatCurrency } from '../../billing/billingUtils';

const fadeIn = keyframes`from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}`;

/* ─── Overlay ─── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  padding: 16px;
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.22);
  padding: 28px;
  animation: ${fadeIn} 0.2s ease;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const IconBox = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1.5px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #dc2626;
`;

const TitleBlock = styled.div``;
const DialogTitle = styled.h3`
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 3px;
  letter-spacing: -0.3px;
`;
const DialogSubtitle = styled.p`
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
`;

const CloseBtn = styled.button`
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  border-radius: 10px; border: none;
  background: #f1f5f9; cursor: pointer; color: #64748b;
  transition: all 0.15s; flex-shrink: 0;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;

/* ─── Invoice summary ─── */
const SummaryBox = styled.div`
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  margin-bottom: 22px;
  & > div + div { margin-top: 8px; }
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .label { font-size: 13px; color: #64748b; }
  .value { font-size: 13px; font-weight: 700; color: #0f172a; }
`;

/* ─── Reason selection ─── */
const SectionLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid ${({ $checked }) => ($checked ? '#fca5a5' : '#e2e8f0')};
  background: ${({ $checked }) => ($checked ? '#fef2f2' : '#f8fafc')};
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    border-color: #fca5a5;
    background: #fef2f2;
  }

  input[type='radio'] {
    width: 15px; height: 15px;
    accent-color: #dc2626;
    flex-shrink: 0;
  }

  .option-label {
    font-size: 12px;
    font-weight: 600;
    color: ${({ $checked }) => ($checked ? '#991b1b' : '#475569')};
    line-height: 1.3;
  }
`;

/* "Other" full-width row */
const OtherRow = styled(RadioLabel)`
  grid-column: 1 / -1;
`;

const ErrorText = styled.p`
  font-size: 12px; color: #dc2626; margin: 6px 0 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  color: #0f172a;
  background: #f8fafc;
  border: 2px solid ${({ $error }) => ($error ? '#fca5a5' : '#e2e8f0')};
  border-radius: 12px;
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  font-family: inherit;
  line-height: 1.5;

  &::placeholder { color: #94a3b8; }
  &:focus {
    background: #fff;
    border-color: #f87171;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
  }
`;

/* ─── Warning ─── */
const WarningBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 15px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 12px;
  color: #991b1b;
  line-height: 1.6;

  svg { flex-shrink: 0; margin-top: 1px; }
`;

/* ─── Footer ─── */
const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1.5px solid #f1f5f9;
`;

const KeepBtn = styled.button`
  padding: 10px 20px;
  font-size: 14px; font-weight: 600;
  color: #64748b; background: #f1f5f9; border: none;
  border-radius: 10px; cursor: pointer; transition: all 0.15s;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;

const CancelInvoiceBtn = styled.button`
  padding: 10px 24px;
  font-size: 14px; font-weight: 700;
  color: #fff;
  background: ${({ disabled }) => (disabled ? '#cbd5e1' : 'linear-gradient(135deg,#dc2626,#b91c1c)')};
  border: none; border-radius: 10px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ disabled }) => (disabled ? 'none' : '0 4px 14px rgba(220,38,38,0.3)')};
  transition: all 0.2s;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(220,38,38,0.4);
  }
  &:active:not(:disabled) { transform: translateY(0); }
`;

/* ─── Constants ─── */
const CANCELLATION_REASONS = [
  'Patient refused service',
  'Referral no longer needed',
  'Duplicate request',
  'Appointment missed',
  'Doctor cancelled referral',
  'Other',
];

/* ─── Helpers ─── */
const isReferralType = (type) =>
  type === 'Referral' ||
  type === 'Radiology Referral' ||
  type === 'Physiotherapy Referral';

/* ─── Component ─── */
const CancellationModal = ({ invoice, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason,   setCustomReason]   = useState('');
  const [errors,         setErrors]         = useState({});

  if (!invoice || !isReferralType(invoice.type)) return null;

  const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
  const isValid     = finalReason.length > 0;

  const handleSubmit = () => {
    const newErrors = {};
    if (!selectedReason) {
      newErrors.reason = 'Please select a cancellation reason';
    } else if (selectedReason === 'Other' && !customReason.trim()) {
      newErrors.customReason = 'Please describe the cancellation reason';
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit(finalReason);
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Dialog>
        {/* ── Header ── */}
        <DialogHeader>
          <HeaderLeft>
            <IconBox><AlertTriangle size={22} /></IconBox>
            <TitleBlock>
              <DialogTitle>Cancel Referral Invoice</DialogTitle>
              <DialogSubtitle>{invoice.id} · {invoice.patientName}</DialogSubtitle>
            </TitleBlock>
          </HeaderLeft>
          <CloseBtn onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </DialogHeader>

        {/* ── Invoice summary ── */}
        <SummaryBox>
          <SummaryRow>
            <span className="label">Service</span>
            <span className="value">{invoice.serviceName}</span>
          </SummaryRow>
          <SummaryRow>
            <span className="label">Type</span>
            <span className="value">{invoice.type}</span>
          </SummaryRow>
          <SummaryRow>
            <span className="label">Amount</span>
            <span className="value">{formatCurrency(invoice.amount)}</span>
          </SummaryRow>
        </SummaryBox>

        {/* ── Reason ── */}
        <FormGroup>
          <SectionLabel>Cancellation Reason *</SectionLabel>
          <RadioGroup>
            {CANCELLATION_REASONS.filter((r) => r !== 'Other').map((reason) => (
              <RadioLabel key={reason} $checked={selectedReason === reason}>
                <input
                  type="radio"
                  name="cancellationReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    setErrors((p) => ({ ...p, reason: '' }));
                  }}
                />
                <span className="option-label">{reason}</span>
              </RadioLabel>
            ))}
            {/* Other – full-width */}
            <OtherRow $checked={selectedReason === 'Other'}>
              <input
                type="radio"
                name="cancellationReason"
                value="Other"
                checked={selectedReason === 'Other'}
                onChange={(e) => {
                  setSelectedReason(e.target.value);
                  setErrors((p) => ({ ...p, reason: '' }));
                }}
              />
              <span className="option-label">Other – specify below</span>
            </OtherRow>
          </RadioGroup>
          {errors.reason && <ErrorText>{errors.reason}</ErrorText>}
        </FormGroup>

        {/* ── Custom reason textarea ── */}
        {selectedReason === 'Other' && (
          <FormGroup>
            <SectionLabel>Specify Reason *</SectionLabel>
            <TextArea
              rows={3}
              $error={!!errors.customReason}
              placeholder="Describe the cancellation reason in detail…"
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setErrors((p) => ({ ...p, customReason: '' }));
              }}
            />
            {errors.customReason && <ErrorText>{errors.customReason}</ErrorText>}
          </FormGroup>
        )}

        {/* ── Warning ── */}
        <WarningBanner>
          <ShieldOff size={15} />
          <span>
            <strong>This action cannot be undone.</strong> The invoice will be permanently marked as
            Cancelled and the reason will be stored in the patient's billing history.
          </span>
        </WarningBanner>

        {/* ── Footer ── */}
        <DialogFooter>
          <KeepBtn onClick={onClose}>Keep Invoice</KeepBtn>
          <CancelInvoiceBtn disabled={!isValid} onClick={handleSubmit}>
            Cancel Invoice
          </CancelInvoiceBtn>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

export default CancellationModal;
