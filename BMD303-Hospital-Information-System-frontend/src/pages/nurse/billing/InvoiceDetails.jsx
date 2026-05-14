import { useMemo } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Printer, Download, CheckCircle } from 'lucide-react';
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
`;

const FieldGroup = styled.div`
  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }

  .field-value {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .field-value.green { color: #059669; }
  .field-value.amber { color: #b45309; }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const OutlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
`;

const GreenButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background-color: #059669;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }

  &:active { transform: translateY(0); }
`;

const PaymentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: background-color 0.15s;

  &:hover { background-color: #f9fafb; }
  & + & { margin-top: 8px; }
`;

const PaymentInfo = styled.div`
  .method { font-size: 13px; font-weight: 600; color: #111827; }
  .date   { font-size: 11px; color: #9ca3af; margin-top: 2px; }
`;

const PaymentAmount = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #059669;
`;

const EmptyPayments = styled.p`
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
  padding: 8px 0;
`;

const NotFound = styled.div`
  padding: 48px 24px;
  text-align: center;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #6b7280;
  font-size: 14px;
`;

/* ─── Component ─── */
const InvoiceDetails = () => {
  const { id } = useParams();
  const { invoicesState, paymentsState, markInvoicePaid } = useBilling();

  const invoice  = useMemo(
    () => (invoicesState.items  || []).find((item)    => item.id === id),
    [invoicesState.items, id]
  );
  const payments = useMemo(
    () => (paymentsState.items || []).filter((payment) => payment.invoiceId === id),
    [paymentsState.items, id]
  );

  const handleDownloadReceipt = () => {
    if (!invoice) return;
    const paymentRows = payments
      .map(
        (p) => `
          <tr>
            <td style="padding:6px 0">${p.method}</td>
            <td style="padding:6px 0">${p.date}</td>
            <td style="padding:6px 0;text-align:right">${formatCurrency(p.amount)}</td>
          </tr>`
      )
      .join('');

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
      <title>Receipt ${invoice.id}</title></head>
      <body style="font-family:system-ui,sans-serif;padding:24px;color:#111827">
        <h2 style="margin:0 0 8px">Receipt</h2>
        <p style="margin:0 0 16px">Invoice ID: ${invoice.id}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:6px 0">Patient</td><td style="text-align:right">${invoice.patientName}</td></tr>
          <tr><td style="padding:6px 0">Department</td><td style="text-align:right">${invoice.department}</td></tr>
          <tr><td style="padding:6px 0">Service</td><td style="text-align:right">${invoice.serviceName}</td></tr>
          <tr><td style="padding:6px 0">Invoice Amount</td><td style="text-align:right">${formatCurrency(invoice.price)}</td></tr>
          <tr><td style="padding:6px 0">Paid Amount</td><td style="text-align:right">${formatCurrency(invoice.totalPaid)}</td></tr>
          <tr><td style="padding:6px 0">Remaining</td><td style="text-align:right">${formatCurrency(invoice.remainingAmount)}</td></tr>
        </table>
        <h3 style="margin:0 0 8px">Payments</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="text-align:left;padding:6px 0">Method</th>
            <th style="text-align:left;padding:6px 0">Date</th>
            <th style="text-align:right;padding:6px 0">Amount</th>
          </tr></thead>
          <tbody>${paymentRows || '<tr><td colspan="3" style="padding:6px 0">No payments recorded.</td></tr>'}</tbody>
        </table>
      </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${invoice.id}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!invoice) {
    return (
      <PageContainer>
        <NotFound>Invoice not found.</NotFound>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Invoice {invoice.id}</h1>
          <p>Detailed billing information and payment history</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </Header>

      <ContentGrid>
        {/* Invoice Details */}
        <Card>
          <CardTitle>Invoice Details</CardTitle>
          <DetailsGrid>
            <FieldGroup>
              <div className="field-label">Patient</div>
              <div className="field-value">{invoice.patientName}</div>
            </FieldGroup>
            <FieldGroup>
              <div className="field-label">Department</div>
              <div className="field-value">{invoice.department}</div>
            </FieldGroup>
            <FieldGroup>
              <div className="field-label">Service</div>
              <div className="field-value">{invoice.serviceName}</div>
            </FieldGroup>
            <FieldGroup>
              <div className="field-label">Invoice Amount</div>
              <div className="field-value">{formatCurrency(invoice.price)}</div>
            </FieldGroup>
            <FieldGroup>
              <div className="field-label">Paid Amount</div>
              <div className="field-value green">{formatCurrency(invoice.totalPaid)}</div>
            </FieldGroup>
            <FieldGroup>
              <div className="field-label">Remaining</div>
              <div className="field-value amber">{formatCurrency(invoice.remainingAmount)}</div>
            </FieldGroup>
          </DetailsGrid>

          <ButtonGroup>
            <OutlineButton onClick={() => window.print()}>
              <Printer size={14} />
              Print
            </OutlineButton>
            <OutlineButton onClick={handleDownloadReceipt}>
              <Download size={14} />
              Download Receipt
            </OutlineButton>
            {invoice.status !== 'Paid' && (
              <GreenButton onClick={() => markInvoicePaid(invoice)}>
                <CheckCircle size={14} />
                Mark as Paid
              </GreenButton>
            )}
          </ButtonGroup>
        </Card>

        {/* Payment History */}
        <Card>
          <CardTitle>Payment History</CardTitle>
          {payments.length === 0 ? (
            <EmptyPayments>No payments recorded yet.</EmptyPayments>
          ) : (
            payments.map((payment) => (
              <PaymentRow key={payment.id}>
                <PaymentInfo>
                  <div className="method">{payment.method}</div>
                  <div className="date">{payment.date}</div>
                </PaymentInfo>
                <PaymentAmount>{formatCurrency(payment.amount)}</PaymentAmount>
              </PaymentRow>
            ))
          )}
        </Card>
      </ContentGrid>
    </PageContainer>
  );
};

export default InvoiceDetails;
