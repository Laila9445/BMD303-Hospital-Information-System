import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Search, CreditCard } from 'lucide-react';
import { useBilling } from '../../../billing';
import InvoiceStatusBadge from '../../../components/billing/InvoiceStatusBadge';
import { formatCurrency } from '../../../billing/billingUtils';

/* ─── Design tokens ─── */
const PageContainer = styled.div`
  padding: 8px 20px 20px 20px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
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

const SearchWrapper = styled.div`
  position: relative;
  max-width: 340px;
  margin-bottom: 16px;
`;

const SearchIconEl = styled(Search)`
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
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &::placeholder { color: #9ca3af; }
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const InvoiceGrid = styled.div`
  display: grid;
  gap: 14px;
`;

const InvoiceCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InvoiceCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const InvoiceCardMeta = styled.div`
  .invoice-id {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }
  .invoice-patient {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
`;

const MetricBox = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;

  .label {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }

  .value {
    font-size: 14px;
    font-weight: 700;
    color: ${({ $color }) => $color || '#111827'};
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f3f4f6;
  margin-bottom: 14px;
`;

const TransactionsLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 10px 0;
`;

const TransactionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f9fafb;
  }

  & + & {
    margin-top: 6px;
  }
`;

const TransactionInfo = styled.div`
  .method {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .date {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
  }
`;

const TransactionAmount = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #065f46;
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

const EmptyTransactions = styled.p`
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
  padding: 8px 0;
`;

/* ─── Component ─── */
const BillingPayments = () => {
  const { paymentsState, invoicesState } = useBilling();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = useMemo(() => {
    const invoices = invoicesState.items || [];
    const term = searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.patientName.toLowerCase().includes(term) ||
        inv.id.toLowerCase().includes(term)
    );
  }, [invoicesState.items, searchTerm]);

  const paymentsByInvoice = useMemo(() => {
    const grouped = new Map();
    (paymentsState.items || []).forEach((payment) => {
      const list = grouped.get(payment.invoiceId) || [];
      list.push(payment);
      grouped.set(payment.invoiceId, list);
    });
    return grouped;
  }, [paymentsState.items]);

  return (
    <PageContainer>
      <Header>
        <h1>Payments</h1>
        <p>Track cash and digital payment transactions</p>
      </Header>

      <SearchWrapper>
        <SearchIconEl size={15} />
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patient or invoice…"
        />
      </SearchWrapper>

      {filteredInvoices.length === 0 ? (
        <EmptyCard>
          <CreditCard size={28} color="#d1d5db" />
          <h3>No payments recorded</h3>
          <p>Payments will appear here once invoices are paid</p>
        </EmptyCard>
      ) : (
        <InvoiceGrid>
          {filteredInvoices.map((invoice) => {
            const payments = paymentsByInvoice.get(invoice.id) || [];
            return (
              <InvoiceCard key={invoice.id}>
                {/* Header */}
                <InvoiceCardHeader>
                  <InvoiceCardMeta>
                    <div className="invoice-id">{invoice.id} · {invoice.patientName}</div>
                    <div className="invoice-patient">{invoice.serviceName} · {invoice.department}</div>
                  </InvoiceCardMeta>
                  <InvoiceStatusBadge status={invoice.status} />
                </InvoiceCardHeader>

                {/* Metrics */}
                <MetricsRow>
                  <MetricBox>
                    <div className="label">Invoice Amount</div>
                    <div className="value">{formatCurrency(invoice.price)}</div>
                  </MetricBox>
                  <MetricBox $color="#059669">
                    <div className="label">Paid</div>
                    <div className="value">{formatCurrency(invoice.totalPaid)}</div>
                  </MetricBox>
                  <MetricBox $color="#b45309">
                    <div className="label">Remaining</div>
                    <div className="value">{formatCurrency(invoice.remainingAmount)}</div>
                  </MetricBox>
                </MetricsRow>

                <Divider />

                {/* Transaction History */}
                <TransactionsLabel>Transaction History</TransactionsLabel>
                {payments.length === 0 ? (
                  <EmptyTransactions>No transactions yet.</EmptyTransactions>
                ) : (
                  payments.map((payment) => (
                    <TransactionRow key={payment.id}>
                      <TransactionInfo>
                        <div className="method">{payment.method}</div>
                        <div className="date">{payment.date}</div>
                      </TransactionInfo>
                      <TransactionAmount>{formatCurrency(payment.amount)}</TransactionAmount>
                    </TransactionRow>
                  ))
                )}
              </InvoiceCard>
            );
          })}
        </InvoiceGrid>
      )}
    </PageContainer>
  );
};

export default BillingPayments;
