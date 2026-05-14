import styled, { keyframes } from 'styled-components';
import { X, Clock, CheckCircle2, XCircle, Shield } from 'lucide-react';
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
  max-height: 92vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.22);
  padding: 28px;
  animation: ${fadeIn} 0.2s ease;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
`;

const DialogSubtitle = styled.p`
  font-size: 13px;
  color: #64748b;
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

/* ─── Status badge ─── */
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 20px;
  border: 1.5px solid;
  margin-bottom: 22px;

  ${({ $status }) => {
    switch ($status) {
      case 'Pending':   return `background:#fffbeb;color:#92400e;border-color:#fde68a;`;
      case 'Paid':      return `background:#ecfdf5;color:#065f46;border-color:#a7f3d0;`;
      case 'Cancelled': return `background:#f8fafc;color:#475569;border-color:#e2e8f0;`;
      default:          return `background:#f8fafc;color:#475569;border-color:#e2e8f0;`;
    }
  }}
`;

/* ─── Section ─── */
const Section = styled.div`
  & + & {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1.5px solid #f1f5f9;
  }
`;

const SectionTitle = styled.h4`
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0 0 12px;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  .label { font-size: 13px; color: #64748b; }
  .value { font-size: 13px; font-weight: 600; color: #0f172a; }
`;

/* ─── Type badge — handles all 3 types ─── */
const TYPE_STYLES = {
  'Consultation':           { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Referral':               { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  'Radiology Referral':     { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  'Physiotherapy Referral': { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
};

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  border: 1.5px solid ${({ $type }) => (TYPE_STYLES[$type] || TYPE_STYLES['Referral']).border};
  background: ${({ $type }) => (TYPE_STYLES[$type] || TYPE_STYLES['Referral']).bg};
  color: ${({ $type }) => (TYPE_STYLES[$type] || TYPE_STYLES['Referral']).color};
`;

/* ─── Amount box ─── */
const AmountBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  background: linear-gradient(135deg, #f0f4ff, #faf5ff);
  border-radius: 12px;
  border: 1.5px solid #c7d2fe;
  .label  { font-size: 13px; font-weight: 600; color: #4f46e5; }
  .amount { font-size: 20px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; }
`;

/* ─── Insurance box ─── */
const InsuranceBox = styled.div`
  padding: 14px 16px;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border: 1.5px solid #a7f3d0;
  border-radius: 12px;
`;

const InsuranceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 800;
  color: #065f46;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const InsuranceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  .i-label   { font-size: 13px; color: #047857; }
  .i-value   { font-size: 13px; font-weight: 600; color: #065f46; }
  .i-discount{ font-size: 13px; font-weight: 700; color: #059669; }
`;

const InsuranceDivider = styled.div`
  height: 1px; background: #a7f3d0; margin: 8px 0;
`;

const InsuranceFinal = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 2px;
  .f-label { font-size: 13px; font-weight: 700; color: #064e3b; }
  .f-value { font-size: 18px; font-weight: 900; color: #064e3b; }
`;

/* ─── Cancellation note ─── */
const CancellationBox = styled.div`
  padding: 14px 16px;
  background: #fef2f2;
  border-radius: 12px;
  border: 1.5px solid #fecaca;
  .c-label  { font-size: 11px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .c-reason { font-size: 13px; color: #7f1d1d; line-height: 1.5; }
`;

/* ─── Footer ─── */
const DialogFooter = styled.div`
  display: flex; justify-content: flex-end;
  margin-top: 24px; padding-top: 18px;
  border-top: 1.5px solid #f1f5f9;
`;

const CloseFooterBtn = styled.button`
  padding: 10px 24px; font-size: 14px; font-weight: 600;
  color: #64748b; background: #f1f5f9; border: none;
  border-radius: 10px; cursor: pointer; transition: all 0.15s;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;

/* ─── Helpers ─── */
const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':   return <Clock size={13} />;
    case 'Paid':      return <CheckCircle2 size={13} />;
    case 'Cancelled': return <XCircle size={13} />;
    default:          return null;
  }
};

/* ─── Component ─── */
const InvoiceDetailsModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const hasInsurance   = !!(invoice.insuranceId && invoice.insuranceName);
  const servicePrice   = invoice.price ?? invoice.amount ?? 0;
  const discount       = invoice.insuranceDiscount ?? 0;
  const finalAmount    = invoice.finalAmount ?? invoice.amount ?? 0;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Dialog>
        {/* ── Header ── */}
        <DialogHeader>
          <div>
            <DialogTitle>{invoice.id}</DialogTitle>
            <DialogSubtitle>Invoice Details · {invoice.patientName}</DialogSubtitle>
          </div>
          <CloseBtn onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </DialogHeader>

        <StatusBadge $status={invoice.status}>
          {getStatusIcon(invoice.status)}
          {invoice.status}
        </StatusBadge>

        {/* ── Patient ── */}
        <Section>
          <SectionTitle>Patient Information</SectionTitle>
          <FieldRow>
            <span className="label">Name</span>
            <span className="value">{invoice.patientName}</span>
          </FieldRow>
          {invoice.patientId && (
            <FieldRow>
              <span className="label">Patient ID</span>
              <span className="value">{invoice.patientId}</span>
            </FieldRow>
          )}
        </Section>

        {/* ── Service ── */}
        <Section>
          <SectionTitle>Service Details</SectionTitle>
          <FieldRow>
            <span className="label">Service</span>
            <span className="value">{invoice.serviceName}</span>
          </FieldRow>
          <FieldRow>
            <span className="label">Department</span>
            <span className="value">{invoice.department}</span>
          </FieldRow>
          <FieldRow>
            <span className="label">Type</span>
            <TypeBadge $type={invoice.type}>{invoice.type}</TypeBadge>
          </FieldRow>
          <FieldRow>
            <span className="label">Date</span>
            <span className="value">{new Date(invoice.date).toLocaleDateString()}</span>
          </FieldRow>
        </Section>

        {/* ── Insurance ── */}
        {hasInsurance && (
          <Section>
            <InsuranceBox>
              <InsuranceHeader>
                <Shield size={13} />
                Insurance Applied
              </InsuranceHeader>
              <InsuranceRow>
                <span className="i-label">Plan</span>
                <span className="i-value">{invoice.insuranceName}</span>
              </InsuranceRow>
              <InsuranceRow>
                <span className="i-label">Coverage</span>
                <span className="i-value">{invoice.insuranceCoverage ?? '—'}%</span>
              </InsuranceRow>
              <InsuranceRow>
                <span className="i-label">Service Price</span>
                <span className="i-value">{formatCurrency(servicePrice)}</span>
              </InsuranceRow>
              <InsuranceRow>
                <span className="i-label">Insurance Discount</span>
                <span className="i-discount">−{formatCurrency(discount)}</span>
              </InsuranceRow>
              <InsuranceDivider />
              <InsuranceFinal>
                <span className="f-label">Patient Pays</span>
                <span className="f-value">{formatCurrency(finalAmount)}</span>
              </InsuranceFinal>
            </InsuranceBox>
          </Section>
        )}

        {/* ── Amount (no insurance) ── */}
        {!hasInsurance && (
          <Section>
            <AmountBox>
              <span className="label">Invoice Amount</span>
              <span className="amount">{formatCurrency(invoice.amount)}</span>
            </AmountBox>
          </Section>
        )}

        {/* ── Cancellation note ── */}
        {invoice.cancellationReason && (
          <Section>
            <CancellationBox>
              <div className="c-label">Cancellation Reason</div>
              <div className="c-reason">{invoice.cancellationReason}</div>
            </CancellationBox>
          </Section>
        )}

        {/* ── Footer ── */}
        <DialogFooter>
          <CloseFooterBtn onClick={onClose}>Close</CloseFooterBtn>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

export default InvoiceDetailsModal;
