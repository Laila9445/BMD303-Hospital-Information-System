import { useMemo } from 'react';
import { useBilling } from '../../../billing';
import { useAuth } from '../../../context/AuthContext';
import BillingCard from '../../../components/billing/BillingCard';
import InvoiceTable from '../../../components/billing/InvoiceTable';
import InvoiceStatusBadge from '../../../components/billing/InvoiceStatusBadge';
import EmptyState from '../../../components/billing/EmptyState';
import { formatCurrency, resolvePatientId } from '../../../billing/billingUtils';

const PatientBilling = () => {
  const { invoicesState } = useBilling();
  const { user } = useAuth();
  const patientId = resolvePatientId(user);

  const patientInvoices = useMemo(() => {
    if (!patientId) return [];
    return (invoicesState.items || []).filter((invoice) => invoice.patientId === patientId);
  }, [invoicesState.items, patientId]);

  const totals = useMemo(() => {
    const total = patientInvoices.reduce((sum, invoice) => sum + Number(invoice.price || 0), 0);
    const paid = patientInvoices.reduce((sum, invoice) => sum + Number(invoice.totalPaid || 0), 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [patientInvoices]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">My Billing</h1>
        <p className="text-sm text-slate-500">Overview of your invoices and payments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BillingCard title="Total Due" value={formatCurrency(totals.pending)} note="Outstanding balance" />
        <BillingCard title="Total Paid" value={formatCurrency(totals.paid)} note="Payments completed" />
        <BillingCard title="Invoices" value={patientInvoices.length} note="Total invoices" />
      </div>

      {/* Pending Payment Notice */}
      {totals.pending > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Payment Required</p>
              <p className="text-xs text-amber-600">Please visit the reception desk to complete payment for your pending invoices.</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice List with Context */}
      <div className="mt-6">
        {patientInvoices.length === 0 ? (
          <EmptyState title="No invoices yet" description="Your invoices will appear here once services are completed." />
        ) : (
          <div className="grid gap-4">
            {patientInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{invoice.serviceName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-400">{invoice.id}</span>
                      <span className="text-xs text-slate-300">|</span>
                      <span className="text-xs text-slate-400">{invoice.department}</span>
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
                      {invoice.remainingAmount > 0 && (
                        <p className="text-xs text-amber-600">{formatCurrency(invoice.remainingAmount)} remaining</p>
                      )}
                    </div>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientBilling;
