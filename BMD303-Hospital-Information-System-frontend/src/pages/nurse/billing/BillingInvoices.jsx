import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Clock, CheckCircle2, XCircle, Plus, FileText } from 'lucide-react';
import { useBilling } from '../../../billing';
import PaymentModal from '../../../components/billing/PaymentModal';
import CancellationModal from '../../../components/billing/CancellationModal';
import InvoiceDetailsModal from '../../../components/billing/InvoiceDetailsModal';
import CreateInvoiceModal from '../../../components/billing/CreateInvoiceModal';
import { formatCurrency } from '../../../billing/billingUtils';

/* ─── Design tokens ─── */
const PageContainer = styled.div`
  padding: 8px 20px 20px 20px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 2px 0;
  }

  p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background-color: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 360px;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 34px;
  font-size: 13px;
  color: #111827;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const SelectInput = styled.select`
  appearance: none;
  padding: 8px 28px 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2563eb;
  }
`;

const SelectChevron = styled(ChevronDown)`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
`;

const TabRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $active }) =>
    $active
      ? `
    background-color: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
  `
      : `
    background-color: #ffffff;
    color: #374151;
    border-color: #d1d5db;
    &:hover { border-color: #9ca3af; background-color: #f9fafb; }
  `}
`;

const TableCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Thead = styled.thead`
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: ${({ $right }) => ($right ? 'right' : 'left')};
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const Tbody = styled.tbody`
  & > tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.15s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f9fafb;
    }
  }
`;

const Td = styled.td`
  padding: 13px 16px;
  vertical-align: middle;
  text-align: ${({ $right }) => ($right ? 'right' : 'left')};
  color: #374151;
`;

const InvoiceIdBtn = styled.button`
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;

  &:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
`;

const PatientName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #111827;
`;

const PatientSub = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
`;

const TYPE_BADGE_STYLES = {
  'Consultation':           'background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;',
  'Radiology Referral':     'background:#faf5ff;color:#7c3aed;border-color:#e9d5ff;',
  'Physiotherapy Referral': 'background:#ecfdf5;color:#065f46;border-color:#a7f3d0;',
  'Referral':               'background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe;',
};

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  border: 1px solid;
  ${({ $type }) => TYPE_BADGE_STYLES[$type] || TYPE_BADGE_STYLES['Referral']}
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  border: 1px solid;

  ${({ $status }) => {
    switch ($status) {
      case 'Pending':
        return `background-color: #fffbeb; color: #92400e; border-color: #fde68a;`;
      case 'Paid':
        return `background-color: #ecfdf5; color: #065f46; border-color: #a7f3d0;`;
      case 'Cancelled':
        return `background-color: #f8fafc; color: #475569; border-color: #e2e8f0;`;
      default:
        return `background-color: #f8fafc; color: #475569; border-color: #e2e8f0;`;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  ${({ $variant }) => {
    switch ($variant) {
      case 'view':
        return `
          background-color: #f9fafb;
          color: #374151;
          border-color: #d1d5db;
          &:hover { background-color: #f3f4f6; }
        `;
      case 'pay':
        return `
          background-color: #ecfdf5;
          color: #065f46;
          border-color: #a7f3d0;
          &:hover { background-color: #d1fae5; }
        `;
      case 'cancel':
        return `
          background-color: #f8fafc;
          color: #64748b;
          border-color: #e2e8f0;
          &:hover { background-color: #f1f5f9; }
        `;
      default:
        return `
          background-color: #f9fafb;
          color: #374151;
          border-color: #d1d5db;
        `;
    }
  }}
`;

const ActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
`;

const AmountText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
`;

const EmptyCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 48px 24px;
  text-align: center;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 12px 0 4px 0;
  }

  p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
`;

/* ─── Constants ─── */
const STATUS_TABS = ['All', 'Pending', 'Paid', 'Cancelled'];

const getStatusIcon = (status, size = 12) => {
  switch (status) {
    case 'Pending':   return <Clock size={size} />;
    case 'Paid':      return <CheckCircle2 size={size} />;
    case 'Cancelled': return <XCircle size={size} />;
    default:          return null;
  }
};

/* ─── Component ─── */
const BillingInvoices = () => {
  const { invoicesState, servicesState, patients, createInvoice, cancelInvoice, markInvoicePaid } = useBilling();
  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('All');
  const [departmentFilter, setDepartment]   = useState('All');
  const [selectedInvoice, setSelected]      = useState(null);
  const [paymentInvoice, setPayment]        = useState(null);
  const [cancellationInvoice, setCancellation] = useState(null);
  const [isCreateOpen, setIsCreateOpen]     = useState(false);
  const navigate = useNavigate();

  const filteredInvoices = useMemo(() => {
    const invoices = invoicesState.items || [];
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus     = statusFilter === 'All' || inv.status === statusFilter;
      const matchesDepartment = departmentFilter === 'All' || inv.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [invoicesState.items, searchTerm, statusFilter, departmentFilter]);

  const handlePaymentSubmit  = async ({ amount, method }) => {
    await markInvoicePaid(paymentInvoice, { amount, method });
    setPayment(null);
  };
  const handleCancelSubmit   = async (reason) => {
    await cancelInvoice(cancellationInvoice.id, reason);
    setCancellation(null);
  };
  const handleCreateInvoice  = async (payload) => {
    await createInvoice(payload);
    setIsCreateOpen(false);
  };
  const isReferralType = (type) =>
    type === 'Referral' ||
    type === 'Radiology Referral' ||
    type === 'Physiotherapy Referral';
  const canCancel = (inv) => isReferralType(inv.type) && inv.status === 'Pending';

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <div>
          <h1>Invoice Management</h1>
          <p>View and manage all clinic invoices</p>
        </div>
        <PrimaryButton onClick={() => setIsCreateOpen(true)}>
          <Plus size={14} />
          Create Invoice
        </PrimaryButton>
      </Header>

      {/* Filters */}
      <FiltersRow>
        <SearchWrapper>
          <SearchIcon size={15} />
          <SearchInput
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient or invoice ID…"
          />
        </SearchWrapper>

        <SelectWrapper>
          <SelectInput
            value={departmentFilter}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Doctor">Doctor</option>
            <option value="Radiology">Radiology</option>
            <option value="Physiotherapy">Physiotherapy</option>
          </SelectInput>
          <SelectChevron size={14} />
        </SelectWrapper>
      </FiltersRow>

      {/* Status Tabs */}
      <TabRow>
        {STATUS_TABS.map((tab) => (
          <Tab key={tab} $active={statusFilter === tab} onClick={() => setStatusFilter(tab)}>
            {tab}
          </Tab>
        ))}
      </TabRow>

      {/* Table or Empty */}
      {filteredInvoices.length === 0 ? (
        <EmptyCard>
          <FileText size={28} color="#d1d5db" />
          <h3>No invoices found</h3>
          <p>Try adjusting your search or filters</p>
        </EmptyCard>
      ) : (
        <TableCard>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <Thead>
                <tr>
                  <Th>Invoice ID</Th>
                  <Th>Patient</Th>
                  <Th>Type</Th>
                  <Th>Department</Th>
                  <Th $right>Amount</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <Td>
                      <InvoiceIdBtn onClick={() => setSelected(invoice)}>
                        {invoice.id}
                      </InvoiceIdBtn>
                    </Td>
                    <Td>
                      <PatientName>{invoice.patientName}</PatientName>
                      <PatientSub>{invoice.serviceName}</PatientSub>
                    </Td>
                    <Td>
                      <TypeBadge $type={invoice.type}>{invoice.type}</TypeBadge>
                    </Td>
                    <Td style={{ color: '#6b7280' }}>{invoice.department}</Td>
                    <Td $right>
                      <AmountText>{formatCurrency(invoice.amount)}</AmountText>
                    </Td>
                    <Td>
                      <StatusBadge $status={invoice.status}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionsCell>
                        <ActionButton $variant="view" onClick={() => setSelected(invoice)}>
                          View
                        </ActionButton>
                        {invoice.status === 'Pending' && (
                          <ActionButton $variant="pay" onClick={() => setPayment(invoice)}>
                            Pay
                          </ActionButton>
                        )}
                        {canCancel(invoice) && (
                          <ActionButton $variant="cancel" onClick={() => setCancellation(invoice)}>
                            Cancel
                          </ActionButton>
                        )}
                      </ActionsCell>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </TableCard>
      )}

      {/* Modals */}
      <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelected(null)} />
      <PaymentModal
        invoice={paymentInvoice}
        onClose={() => setPayment(null)}
        onSubmit={handlePaymentSubmit}
        isMarkingPaid={true}
      />
      <CancellationModal
        invoice={cancellationInvoice}
        onClose={() => setCancellation(null)}
        onSubmit={handleCancelSubmit}
      />
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateInvoice}
        services={servicesState.items}
        patients={patients}
      />
    </PageContainer>
  );
};

export default BillingInvoices;
