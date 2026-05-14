import { useMemo } from 'react';
import styled from 'styled-components';
import { BarChart2, DollarSign, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useBilling } from '../../../billing';
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
    font-size: 20px;
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
`;

const ChartCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
`;

const ChartPlaceholder = styled.div`
  height: 160px;
  border-radius: 8px;
  border: 1.5px dashed #d1d5db;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 12px;
  gap: 6px;
`;

/* ─── Component ─── */
const BillingReports = () => {
  const { invoicesState } = useBilling();

  const reportStats = useMemo(() => {
    const invoices = invoicesState.items || [];
    const total     = invoices.reduce((sum, inv) => sum + Number(inv.price   || 0), 0);
    const paid      = invoices.reduce((sum, inv) => sum + Number(inv.totalPaid || 0), 0);
    const pending   = total - paid;
    const cancelled = invoices.filter((inv) => inv.status === 'Cancelled').length;
    return { total, paid, pending, cancelled };
  }, [invoicesState.items]);

  return (
    <PageContainer>
      <Header>
        <h1>Billing Reports</h1>
        <p>Summary of billing performance and trends</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#eff6ff" color="#2563eb">
            <DollarSign size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{formatCurrency(reportStats.total)}</h3>
            <p>Total Billed</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#ecfdf5" color="#059669">
            <TrendingUp size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{formatCurrency(reportStats.paid)}</h3>
            <p>Total Paid</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#fffbeb" color="#b45309">
            <Clock size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{formatCurrency(reportStats.pending)}</h3>
            <p>Pending Amount</p>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#f8fafc" color="#64748b">
            <XCircle size={20} />
          </StatIcon>
          <StatInfo>
            <h3>{reportStats.cancelled}</h3>
            <p>Cancelled Invoices</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <h3>Payment Methods</h3>
          <ChartPlaceholder>
            <BarChart2 size={18} />
            Chart coming soon
          </ChartPlaceholder>
        </ChartCard>
      </ChartsGrid>
    </PageContainer>
  );
};

export default BillingReports;
