import { useMemo } from 'react';
import styled from 'styled-components';
import { FileText, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useBilling } from '../../../billing';
import { formatCurrency } from '../../../billing/billingUtils';

/* ─── Design tokens (match Doctor/Nurse modules) ─── */
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ bgColor }) => bgColor || '#eff6ff'};
  color: ${({ color }) => color || '#2563eb'};
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    line-height: 1;
  }

  p {
    font-size: 12px;
    color: #6b7280;
    margin: 3px 0 0 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  p {
    font-size: 12px;
    color: #6b7280;
    margin: 2px 0 0 0;
  }
`;

const InvoiceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
  cursor: default;

  &:hover {
    background-color: #f9fafb;
    border-color: #e5e7eb;
  }

  & + & {
    margin-top: 8px;
  }
`;

const InvoiceInfo = styled.div`
  flex: 1;
  min-width: 0;

  .invoice-id {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .invoice-meta {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const InvoiceAmount = styled.div`
  text-align: right;
  margin-left: 12px;

  .amount {
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  border: 1px solid;
  white-space: nowrap;
  margin-left: 8px;

  ${({ status }) => {
    switch (status) {
      case 'Pending':
        return `
          background-color: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        `;
      case 'Paid':
        return `
          background-color: #ecfdf5;
          color: #065f46;
          border-color: #a7f3d0;
        `;
      case 'Cancelled':
        return `
          background-color: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        `;
      default:
        return `
          background-color: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        `;
    }
  }}
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #9ca3af;

  p {
    font-size: 13px;
    margin: 8px 0 0 0;
  }
`;

const getStatusIcon = (status) => {
  const size = 12;
  switch (status) {
    case 'Pending':   return <Clock size={size} />;
    case 'Paid':      return <CheckCircle2 size={size} />;
    case 'Cancelled': return <XCircle size={size} />;
    default:          return null;
  }
};

const BillingDashboard = () => {
  const { invoicesState } = useBilling();

  const stats = useMemo(() => {
    const invoices = invoicesState.items || [];
    const pending   = invoices.filter((i) => i.status === 'Pending').length;
    const paid      = invoices.filter((i) => i.status === 'Paid').length;
    const cancelled = invoices.filter((i) => i.status === 'Cancelled').length;
    return { pending, paid, cancelled };
  }, [invoicesState.items]);

  const recentInvoices = useMemo(() => {
    const invoices = invoicesState.items || [];
    return invoices
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [invoicesState.items]);

  return (
    <PageContainer>
      <Header>
        <h1>Billing Dashboard</h1>
        <p>Track clinic billing activity and invoice statuses</p>
      </Header>

      {/* KPI Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#fffbeb" color="#b45309">
            <Clock size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{stats.pending}</h3>
            <p>Pending Invoices</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#ecfdf5" color="#059669">
            <CheckCircle2 size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{stats.paid}</h3>
            <p>Paid Invoices</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#f8fafc" color="#64748b">
            <XCircle size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{stats.cancelled}</h3>
            <p>Cancelled</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div>
            <h3>Recent Invoices</h3>
            <p>Latest billing activity</p>
          </div>
          <TrendingUp size={18} color="#9ca3af" />
        </CardHeader>

        {recentInvoices.length === 0 ? (
          <EmptyState>
            <FileText size={28} />
            <p>No invoices yet</p>
          </EmptyState>
        ) : (
          <div>
            {recentInvoices.map((invoice) => (
              <InvoiceRow key={invoice.id}>
                <InvoiceInfo>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span className="invoice-id">{invoice.id}</span>
                    <StatusBadge status={invoice.status}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </StatusBadge>
                  </div>
                  <div className="invoice-meta">
                    {invoice.patientName} · {invoice.serviceName} · {invoice.department}
                  </div>
                </InvoiceInfo>
                <InvoiceAmount>
                  <div className="amount">{formatCurrency(invoice.amount)}</div>
                  <div className="date">{new Date(invoice.date).toLocaleDateString()}</div>
                </InvoiceAmount>
              </InvoiceRow>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default BillingDashboard;
