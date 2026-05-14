import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  X, Search, User, Stethoscope, Scan, Activity,
  Shield, ChevronDown, CheckCircle2, Tag,
} from 'lucide-react';
import { formatCurrency } from '../../billing/billingUtils';
import { mockInsurancePlans } from '../../billing/billingMockData';

/* ─── animations ─── */
const fadeIn = keyframes`from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); }`;

/* ─── Overlay & dialog ─── */
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
  max-width: 620px;
  max-height: 92vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.22);
  padding: 28px;
  animation: ${fadeIn} 0.2s ease;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const HeaderLeft = styled.div``;
const DialogTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
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
  border-radius: 10px; border: none; background: #f1f5f9;
  cursor: pointer; color: #64748b; flex-shrink: 0;
  transition: all 0.15s;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;

/* ─── Section label ─── */
const SectionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 22px;
`;

/* ─── Patient search ─── */
const SearchWrapper = styled.div`
  position: relative;
`;
const SearchIconWrap = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 11px 12px 11px 38px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  border: 2px solid ${({ $error }) => ($error ? '#fca5a5' : '#e2e8f0')};
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  &:focus { background: #fff; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
  &::placeholder { color: #94a3b8; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  &:hover { background: #f0f9ff; }
`;
const PatientAvatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0;
`;
const PatientInfo = styled.div`
  .name  { font-size: 13px; font-weight: 600; color: #0f172a; }
  .meta  { font-size: 11px; color: #64748b; }
`;

const SelectedPatientChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f0f4ff, #faf0ff);
  border: 2px solid #c7d2fe;
  border-radius: 12px;
  margin-top: 8px;
`;
const ChipName = styled.span`font-size: 14px; font-weight: 600; color: #3730a3; flex: 1;`;
const ChipMeta = styled.span`font-size: 12px; color: #6366f1;`;
const ChipRemove = styled.button`
  background: none; border: none; cursor: pointer; color: #a5b4fc;
  padding: 0; display: flex; align-items: center;
  &:hover { color: #4f46e5; }
`;

/* ─── Invoice type ─── */
const INVOICE_TYPES = [
  { key: 'Consultation',           label: 'Consultation',           icon: Stethoscope, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'Radiology Referral',     label: 'Radiology',              icon: Scan,        color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'Physiotherapy Referral', label: 'Physiotherapy',          icon: Activity,    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const TypeCard = styled.button`
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  border: 2px solid ${({ $active, $border }) => ($active ? $border : '#e2e8f0')};
  background: ${({ $active, $bg }) => ($active ? $bg : '#f8fafc')};
  cursor: pointer;
  transition: all 0.18s;
  position: relative;

  .type-icon { color: ${({ $active, $color }) => ($active ? $color : '#94a3b8')}; transition: color 0.18s; }
  .type-label { font-size: 12px; font-weight: 700; color: ${({ $active, $color }) => ($active ? $color : '#64748b')}; transition: color 0.18s; }

  &:hover:not(:disabled) {
    border-color: ${({ $border }) => $border};
    background: ${({ $bg }) => $bg};
  }
`;

const ActiveDot = styled.div`
  position: absolute; top: 8px; right: 8px;
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $color }) => $color};
`;

/* ─── Services ─── */
const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 2px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const ServiceCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid ${({ $active }) => ($active ? '#6366f1' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg,#f0f4ff,#faf0ff)' : '#f8fafc')};
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;
  position: relative;

  &:hover:not(:disabled) { border-color: #a5b4fc; background: #f5f3ff; }
`;

const ServiceName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#3730a3' : '#1e293b')};
  line-height: 1.3;
`;

const ServiceDept = styled.div`
  font-size: 11px;
  color: #64748b;
`;

const ServicePrice = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $active }) => ($active ? '#4f46e5' : '#0f172a')};
  margin-top: 2px;
`;

const ServiceCheck = styled.div`
  position: absolute;
  top: 8px; right: 8px;
  color: #6366f1;
`;

const EmptyServices = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 13px;
  grid-column: 1 / -1;
`;

/* ─── Insurance ─── */
const InsuranceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const InsuranceToggle = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 2px solid ${({ $on }) => ($on ? '#10b981' : '#e2e8f0')};
  background: ${({ $on }) => ($on ? '#ecfdf5' : '#f8fafc')};
  color: ${({ $on }) => ($on ? '#059669' : '#64748b')};
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
  flex-shrink: 0;
`;

const InsuranceSelect = styled.div`position: relative; flex: 1;`;
const InsuranceSelectBtn = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px; color: #0f172a; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
  &:hover { border-color: #10b981; }
`;
const InsuranceDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px); left: 0; right: 0;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
`;
const InsuranceOption = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  border: none; background: none; cursor: pointer; text-align: left;
  transition: background 0.12s;
  &:hover { background: #ecfdf5; }
  .ins-name { font-size: 13px; font-weight: 600; color: #0f172a; }
  .ins-cov  { font-size: 12px; color: #059669; font-weight: 700; }
`;

/* ─── Summary box ─── */
const SummaryBox = styled.div`
  padding: 18px 20px;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  border: 1.5px solid #c7d2fe;
  border-radius: 16px;
  margin-top: 4px;
`;
const SummaryTitle = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #4f46e5;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 6px;
`;
const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  .s-label { font-size: 13px; color: #6366f1; }
  .s-value { font-size: 13px; font-weight: 600; color: #3730a3; }
  .s-discount { font-size: 13px; font-weight: 700; color: #059669; }
`;
const SummaryDivider = styled.div`height: 1px; background: #c7d2fe; margin: 8px 0;`;
const TotalRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding-top: 4px;
  .t-label { font-size: 14px; font-weight: 700; color: #312e81; }
  .t-value { font-size: 20px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; }
`;

/* ─── Footer ─── */
const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1.5px solid #f1f5f9;
`;
const CancelBtn = styled.button`
  padding: 10px 20px; font-size: 14px; font-weight: 600;
  color: #64748b; background: #f1f5f9; border: none;
  border-radius: 10px; cursor: pointer; transition: all 0.15s;
  &:hover { background: #e2e8f0; color: #0f172a; }
`;
const CreateBtn = styled.button`
  padding: 10px 28px; font-size: 14px; font-weight: 700;
  color: #fff;
  background: ${({ disabled }) => (disabled ? '#cbd5e1' : 'linear-gradient(135deg,#6366f1,#8b5cf6)')};
  border: none; border-radius: 10px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  box-shadow: ${({ disabled }) => (disabled ? 'none' : '0 4px 14px rgba(99,102,241,0.35)')};
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
  &:active:not(:disabled) { transform: translateY(0); }
`;

const ErrorText = styled.p`font-size: 12px; color: #dc2626; margin: 6px 0 0;`;

/* ────────────────────────────────────────
   Component
──────────────────────────────────────── */
const CreateInvoiceModal = ({ isOpen, onClose, onSubmit, services = [], patients = [] }) => {
  const [patientSearch, setPatientSearch]       = useState('');
  const [showPatientDrop, setShowPatientDrop]   = useState(false);
  const [selectedPatient, setSelectedPatient]   = useState(null);
  const [invoiceType, setInvoiceType]           = useState('Consultation');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [useInsurance, setUseInsurance]         = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [showInsDrop, setShowInsDrop]           = useState(false);
  const [errors, setErrors]                     = useState({});

  /* filtered patients from search */
  const patientResults = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return patients.slice(0, 8);
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    );
  }, [patientSearch, patients]);

  /* active services filtered by type */
  const typeToDepMap = {
    'Consultation':           'Doctor',
    'Radiology Referral':     'Radiology',
    'Physiotherapy Referral': 'Physiotherapy',
  };
  const activeServices = useMemo(() => {
    const dept = typeToDepMap[invoiceType];
    return (services || []).filter((s) => s.status === 'Active' && s.department === dept);
  }, [services, invoiceType]);

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === selectedServiceId),
    [activeServices, selectedServiceId]
  );

  /* insurance calculation */
  const basePrice       = selectedService?.price ?? 0;
  const insurancePct    = useInsurance && selectedInsurance ? selectedInsurance.coverage : 0;
  const discountAmount  = Math.round(basePrice * insurancePct / 100);
  const finalAmount     = basePrice - discountAmount;

  /* handlers */
  const handlePatientPick = (p) => {
    setSelectedPatient(p);
    setPatientSearch('');
    setShowPatientDrop(false);
    setErrors((prev) => ({ ...prev, patientId: '' }));
  };

  const handleTypeChange = (type) => {
    setInvoiceType(type);
    setSelectedServiceId('');
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!selectedPatient)  newErrors.patientId  = 'Please select a patient';
    if (!selectedServiceId) newErrors.serviceId = 'Please select a service';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    onSubmit({
      patientId:          selectedPatient.id,
      patientName:        selectedPatient.name,
      department:         selectedService.department,
      serviceId:          selectedService.id,
      serviceName:        selectedService.serviceName,
      amount:             finalAmount,
      price:              basePrice,
      insuranceId:        useInsurance && selectedInsurance ? selectedInsurance.id   : null,
      insuranceName:      useInsurance && selectedInsurance ? selectedInsurance.name : null,
      insuranceCoverage:  useInsurance && selectedInsurance ? selectedInsurance.coverage : 0,
      insuranceDiscount:  discountAmount,
      finalAmount:        finalAmount,
      type:               invoiceType,
      status:             'Pending',
      date:               new Date().toISOString().split('T')[0],
      cancellationReason: null,
    });

    /* reset */
    setSelectedPatient(null);
    setPatientSearch('');
    setSelectedServiceId('');
    setInvoiceType('Consultation');
    setUseInsurance(false);
    setSelectedInsurance(null);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Dialog>
        {/* ── Header ── */}
        <DialogHeader>
          <HeaderLeft>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogSubtitle>Fill in patient details, type, service & optional insurance</DialogSubtitle>
          </HeaderLeft>
          <CloseBtn onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </DialogHeader>

        {/* ── 1. Patient ── */}
        <FormGroup>
          <SectionLabel><User size={13} /> Select Patient *</SectionLabel>

          {selectedPatient ? (
            <SelectedPatientChip>
              <PatientAvatar>{selectedPatient.name.charAt(0)}</PatientAvatar>
              <ChipName>{selectedPatient.name}</ChipName>
              <ChipMeta>{selectedPatient.id}</ChipMeta>
              <ChipRemove onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} title="Change patient">
                <X size={15} />
              </ChipRemove>
            </SelectedPatientChip>
          ) : (
            <SearchWrapper>
              <SearchIconWrap><Search size={15} /></SearchIconWrap>
              <SearchInput
                placeholder="Search by name, email or patient ID…"
                value={patientSearch}
                $error={!!errors.patientId}
                onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDrop(true); }}
                onFocus={() => setShowPatientDrop(true)}
                onBlur={() => setTimeout(() => setShowPatientDrop(false), 180)}
              />
              {showPatientDrop && patientResults.length > 0 && (
                <Dropdown>
                  {patientResults.map((p) => (
                    <DropdownItem key={p.id} onMouseDown={() => handlePatientPick(p)}>
                      <PatientAvatar>{p.name.charAt(0)}</PatientAvatar>
                      <PatientInfo>
                        <div className="name">{p.name}</div>
                        <div className="meta">{p.id} · {p.email}</div>
                      </PatientInfo>
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </SearchWrapper>
          )}
          {errors.patientId && <ErrorText>{errors.patientId}</ErrorText>}
        </FormGroup>

        {/* ── 2. Invoice Type ── */}
        <FormGroup>
          <SectionLabel><Tag size={13} /> Invoice Type *</SectionLabel>
          <TypeGrid>
            {INVOICE_TYPES.map(({ key, label, icon: Icon, color, bg, border }) => (
              <TypeCard
                key={key}
                $active={invoiceType === key}
                $color={color} $bg={bg} $border={border}
                onClick={() => handleTypeChange(key)}
              >
                {invoiceType === key && <ActiveDot $color={color} />}
                <Icon size={22} className="type-icon" />
                <span className="type-label">{label}</span>
              </TypeCard>
            ))}
          </TypeGrid>
        </FormGroup>

        {/* ── 3. Service ── */}
        <FormGroup>
          <SectionLabel><Stethoscope size={13} /> Select Service *</SectionLabel>
          {activeServices.length === 0 ? (
            <ServiceGrid>
              <EmptyServices>No active services for this type.</EmptyServices>
            </ServiceGrid>
          ) : (
            <ServiceGrid>
              {activeServices.map((svc) => {
                const isActive = selectedServiceId === svc.id;
                return (
                  <ServiceCard
                    key={svc.id}
                    $active={isActive}
                    onClick={() => { setSelectedServiceId(svc.id); setErrors((p) => ({ ...p, serviceId: '' })); }}
                  >
                    {isActive && <ServiceCheck><CheckCircle2 size={14} /></ServiceCheck>}
                    <ServiceName $active={isActive}>{svc.serviceName}</ServiceName>
                    <ServiceDept>{svc.department}</ServiceDept>
                    <ServicePrice $active={isActive}>{formatCurrency(svc.price)}</ServicePrice>
                  </ServiceCard>
                );
              })}
            </ServiceGrid>
          )}
          {errors.serviceId && <ErrorText>{errors.serviceId}</ErrorText>}
        </FormGroup>

        {/* ── 4. Insurance ── */}
        <FormGroup>
          <SectionLabel><Shield size={13} /> Insurance (Optional)</SectionLabel>
          <InsuranceRow>
            <InsuranceToggle $on={useInsurance} onClick={() => { setUseInsurance(!useInsurance); if (useInsurance) setSelectedInsurance(null); }}>
              <Shield size={14} />
              {useInsurance ? 'Insurance ON' : 'Add Insurance'}
            </InsuranceToggle>

            {useInsurance && (
              <InsuranceSelect>
                <InsuranceSelectBtn onClick={() => setShowInsDrop(!showInsDrop)}>
                  <span>{selectedInsurance ? selectedInsurance.name : 'Choose plan…'}</span>
                  <ChevronDown size={14} />
                </InsuranceSelectBtn>
                {showInsDrop && (
                  <InsuranceDropdown>
                    {mockInsurancePlans.map((plan) => (
                      <InsuranceOption
                        key={plan.id}
                        onMouseDown={() => { setSelectedInsurance(plan); setShowInsDrop(false); }}
                      >
                        <span className="ins-name">{plan.name}</span>
                        <span className="ins-cov">{plan.coverage}% off</span>
                      </InsuranceOption>
                    ))}
                  </InsuranceDropdown>
                )}
              </InsuranceSelect>
            )}
          </InsuranceRow>
        </FormGroup>

        {/* ── 5. Summary ── */}
        {selectedService && selectedPatient && (
          <SummaryBox>
            <SummaryTitle><CheckCircle2 size={13} /> Invoice Summary</SummaryTitle>
            <SummaryRow>
              <span className="s-label">Patient</span>
              <span className="s-value">{selectedPatient.name}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="s-label">Service</span>
              <span className="s-value">{selectedService.serviceName}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="s-label">Type</span>
              <span className="s-value">{invoiceType}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="s-label">Service Price</span>
              <span className="s-value">{formatCurrency(basePrice)}</span>
            </SummaryRow>
            {useInsurance && selectedInsurance && (
              <SummaryRow>
                <span className="s-label">Insurance Discount ({selectedInsurance.coverage}%)</span>
                <span className="s-discount">−{formatCurrency(discountAmount)}</span>
              </SummaryRow>
            )}
            <SummaryDivider />
            <TotalRow>
              <span className="t-label">Final Amount</span>
              <span className="t-value">{formatCurrency(finalAmount)}</span>
            </TotalRow>
          </SummaryBox>
        )}

        {/* ── Footer ── */}
        <DialogFooter>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <CreateBtn disabled={!selectedService || !selectedPatient} onClick={handleSubmit}>
            Create Invoice
          </CreateBtn>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

export default CreateInvoiceModal;
