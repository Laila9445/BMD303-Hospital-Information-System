import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Banknote, Smartphone, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../billing/billingUtils';

const fadeIn = keyframes`from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}`;

/* ─── Overlay – always above everything incl. navbar ─── */
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
  max-width: 460px;
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

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
`;

const DialogMeta = styled.div`
  font-size: 13px;
  color: #64748b;
  strong { color: #374151; font-weight: 600; }
`;

const CloseBtn = styled.button`
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  border-radius: 10px; border: none;
  background: #f1f5f9; cursor: pointer; color: #64748b;
  transition: all 0.15s;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;

/* ── Amount banner ── */
const AmountBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f0f4ff, #faf5ff);
  border: 1.5px solid #c7d2fe;
  border-radius: 14px;
  margin-bottom: 22px;

  .label  { font-size: 13px; color: #6366f1; font-weight: 500; }
  .amount { font-size: 24px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; }
`;

const FormGroup = styled.div`margin-bottom: 18px;`;

const Label = styled.label`
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const LabelNote = styled.span`
  font-size: 11px; font-weight: 400; color: #059669;
  text-transform: none; letter-spacing: 0;
`;

const NumberInput = styled.input`
  width: 100%;
  padding: 11px 14px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  background: ${({ $locked }) => ($locked ? '#ecfdf5' : '#f8fafc')};
  border: 2px solid ${({ $locked, $error }) => ($error ? '#fca5a5' : $locked ? '#a7f3d0' : '#e2e8f0')};
  border-radius: 12px;
  outline: none;
  cursor: ${({ $locked }) => ($locked ? 'not-allowed' : 'auto')};
  box-sizing: border-box;
  transition: all 0.2s;
  &:focus:not([readonly]) { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
`;

const ErrorText = styled.p`font-size: 12px; color: #dc2626; margin: 6px 0 0;`;

/* ── Payment method cards ── */
const METHODS = [
  { key: 'Cash',     label: 'Cash',     icon: Banknote,    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { key: 'InstaPay', label: 'InstaPay', icon: Smartphone,  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'Card',     label: 'Card',     icon: CreditCard,  color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
];

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const MethodCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border-radius: 14px;
  border: 2px solid ${({ $active, $border }) => ($active ? $border : '#e2e8f0')};
  background: ${({ $active, $bg }) => ($active ? $bg : '#f8fafc')};
  cursor: pointer;
  transition: all 0.18s;
  position: relative;

  .m-icon  { color: ${({ $active, $color }) => ($active ? $color : '#94a3b8')}; transition: color 0.18s; }
  .m-label { font-size: 12px; font-weight: 700; color: ${({ $active, $color }) => ($active ? $color : '#64748b')}; }

  &:hover:not(:disabled) {
    border-color: ${({ $border }) => $border};
    background: ${({ $bg }) => $bg};
  }
`;

const ActiveDot = styled.div`
  position: absolute; top: 7px; right: 7px;
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $color }) => $color};
`;

/* ── Summary box ── */
const SummaryBox = styled.div`
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0f4ff, #faf5ff);
  border: 1.5px solid #c7d2fe;
  border-radius: 14px;
  margin-top: 16px;
`;

const SummaryTitle = styled.div`
  font-size: 11px; font-weight: 800;
  color: #4f46e5; text-transform: uppercase;
  letter-spacing: 0.07em; margin-bottom: 10px;
`;

const SummaryRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 3px 0;
  .s-label { font-size: 13px; color: #6366f1; }
  .s-value { font-size: 13px; font-weight: 600; color: #3730a3; }
`;

/* ── Footer ── */
const DialogFooter = styled.div`
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px; margin-top: 24px; padding-top: 18px;
  border-top: 1.5px solid #f1f5f9;
`;

const CancelBtn = styled.button`
  padding: 10px 20px; font-size: 14px; font-weight: 600;
  color: #64748b; background: #f1f5f9; border: none;
  border-radius: 10px; cursor: pointer; transition: all 0.15s;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;

const ConfirmBtn = styled.button`
  padding: 10px 26px; font-size: 14px; font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #059669, #047857);
  border: none; border-radius: 10px; cursor: pointer;
  box-shadow: 0 4px 14px rgba(5,150,105,0.35);
  transition: all 0.2s;
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(5,150,105,0.45); }
  &:active { transform: translateY(0); }
`;

/* ────────────────────────────────────────
   Component
──────────────────────────────────────── */
const PaymentModal = ({ invoice, onClose, onSubmit, isMarkingPaid = false }) => {
  if (!invoice) return null;

  const initialAmount = isMarkingPaid ? invoice.amount : 0;
  const [amount, setAmount] = useState(initialAmount);
  const [method, setMethod] = useState('Cash');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};
    if (!amount || amount <= 0)
      newErrors.amount = 'Payment amount must be greater than 0';
    if (amount > invoice.amount)
      newErrors.amount = `Cannot exceed invoice amount (${formatCurrency(invoice.amount)})`;
    if (!method || !['Cash', 'InstaPay', 'Card'].includes(method))
      newErrors.method = 'Please select a payment method';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit({ amount, method });
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Dialog>
        {/* ── Header ── */}
        <DialogHeader>
          <div>
            <DialogTitle>{isMarkingPaid ? 'Mark Invoice as Paid' : 'Record Payment'}</DialogTitle>
            <DialogMeta>Invoice <strong>{invoice.id}</strong> · {invoice.patientName}</DialogMeta>
          </div>
          <CloseBtn onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </DialogHeader>

        {/* ── Amount banner ── */}
        <AmountBanner>
          <span className="label">Invoice Amount</span>
          <span className="amount">{formatCurrency(invoice.amount)}</span>
        </AmountBanner>

        {/* ── Payment amount ── */}
        <FormGroup>
          <Label>
            Payment Amount
            {isMarkingPaid && <LabelNote>(Auto-filled)</LabelNote>}
          </Label>
          <NumberInput
            type="number"
            min="0"
            step="0.01"
            value={amount}
            readOnly={isMarkingPaid}
            $locked={isMarkingPaid}
            $error={!!errors.amount}
            onChange={(e) => {
              if (!isMarkingPaid) {
                setAmount(Math.max(0, Number(e.target.value)));
                setErrors((p) => ({ ...p, amount: '' }));
              }
            }}
          />
          {errors.amount && <ErrorText>{errors.amount}</ErrorText>}
        </FormGroup>

        {/* ── Payment method ── */}
        <FormGroup>
          <Label>Payment Method</Label>
          <MethodGrid>
            {METHODS.map(({ key, label, icon: Icon, color, bg, border }) => (
              <MethodCard
                key={key}
                $active={method === key}
                $color={color} $bg={bg} $border={border}
                onClick={() => { setMethod(key); setErrors((p) => ({ ...p, method: '' })); }}
              >
                {method === key && <ActiveDot $color={color} />}
                <Icon size={22} className="m-icon" />
                <span className="m-label">{label}</span>
              </MethodCard>
            ))}
          </MethodGrid>
          {errors.method && <ErrorText>{errors.method}</ErrorText>}
        </FormGroup>

        {/* ── Summary ── */}
        <SummaryBox>
          <SummaryTitle><CheckCircle2 size={12} style={{ display:'inline', marginRight: 4 }} />Payment Summary</SummaryTitle>
          <SummaryRow>
            <span className="s-label">Amount to Pay</span>
            <span className="s-value">{formatCurrency(amount)}</span>
          </SummaryRow>
          <SummaryRow>
            <span className="s-label">Method</span>
            <span className="s-value">{method}</span>
          </SummaryRow>
        </SummaryBox>

        {/* ── Footer ── */}
        <DialogFooter>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <ConfirmBtn onClick={handleSubmit}>
            {isMarkingPaid ? 'Confirm & Mark as Paid' : 'Record Payment'}
          </ConfirmBtn>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

export default PaymentModal;
