import { useMemo, useState } from 'react';
import { useBilling } from '../../../billing';
import { useAuth } from '../../../context/AuthContext';
import SearchBar from '../../../components/billing/SearchBar';
import InvoiceStatusBadge from '../../../components/billing/InvoiceStatusBadge';
import EmptyState from '../../../components/billing/EmptyState';
import { formatCurrency, resolvePatientId } from '../../../billing/billingUtils';

const PatientInvoices = () => {
  const { invoicesState, paymentsState } = useBilling();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const patientId = resolvePatientId(user);

  const invoices = useMemo(() => {
    if (!patientId) return [];
    const data = (invoicesState.items || []).filter((invoice) => invoice.patientId === patientId);
    return data.filter((invoice) => String(invoice.id).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [invoicesState.items, patientId, searchTerm]);

  const handleDownloadReceipt = (invoice) => {
    const payments = (paymentsState.items || []).filter((payment) => payment.invoiceId === invoice.id);
    const paymentRows = payments
      .map(
        (payment) => `
          <tr>
            <td style="padding: 6px 0;">${payment.method}</td>
            <td style="padding: 6px 0;">${payment.date}</td>
            <td style="padding: 6px 0; text-align: right;">${formatCurrency(payment.amount)}</td>
          </tr>
        `
      )
      .join('');

    const receiptHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Receipt ${invoice.id}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
          <h2 style="margin: 0 0 8px;">Receipt</h2>
          <p style="margin: 0 0 16px;">Invoice ID: ${invoice.id}</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0;">Patient</td><td style="padding: 6px 0; text-align: right;">${invoice.patientName}</td></tr>
            <tr><td style="padding: 6px 0;">Department</td><td style="padding: 6px 0; text-align: right;">${invoice.department}</td></tr>
            <tr><td style="padding: 6px 0;">Service</td><td style="padding: 6px 0; text-align: right;">${invoice.serviceName}</td></tr>
            <tr><td style="padding: 6px 0;">Invoice Amount</td><td style="padding: 6px 0; text-align: right;">${formatCurrency(invoice.price)}</td></tr>
            <tr><td style="padding: 6px 0;">Paid Amount</td><td style="padding: 6px 0; text-align: right;">${formatCurrency(invoice.totalPaid)}</td></tr>
            <tr><td style="padding: 6px 0;">Remaining</td><td style="padding: 6px 0; text-align: right;">${formatCurrency(invoice.remainingAmount)}</td></tr>
          </table>
          <h3 style="margin: 0 0 8px;">Payments</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 6px 0;">Method</th>
                <th style="text-align: left; padding: 6px 0;">Date</th>
                <th style="text-align: right; padding: 6px 0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRows || '<tr><td colspan="3" style="padding: 6px 0;">No payments recorded.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${invoice.id}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500">View all invoices and download receipts.</p>
      </div>

      <div className="mb-4 max-w-md">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search invoice ID" />
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices" description="Your invoices will be available here." />
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invoice.serviceName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">{invoice.id}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400">{invoice.department}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400">{invoice.date}</span>
                    {invoice.referenceType && (
                      <>
                        <span className="text-xs text-slate-300">|</span>
                        <span className="text-xs font-medium text-blue-600">
                          {invoice.referenceType === 'Appointment' ? 'Appointment Consultation' : 'Referral'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.price)}</p>
                    {invoice.status === 'Pending' && (
                      <p className="text-xs text-amber-600">{formatCurrency(invoice.remainingAmount)} remaining</p>
                    )}
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
              {invoice.status === 'Paid' && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <button
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => handleDownloadReceipt(invoice)}
                  >
                    Download Receipt
                  </button>
                </div>
              )}
              {invoice.status === 'Pending' && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs text-amber-700">Please visit the reception desk to complete payment.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientInvoices;
