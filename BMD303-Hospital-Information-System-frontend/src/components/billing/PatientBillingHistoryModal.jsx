import { formatCurrency } from '../../billing/billingUtils';
import InvoiceStatusBadge from './InvoiceStatusBadge';

const PatientBillingHistoryModal = ({ patient, invoices, payments, onClose }) => {
  if (!patient) return null;

  const patientInvoices = (invoices || []).filter((invoice) => invoice.patientId === patient.id);
  const patientPayments = (payments || []).filter((payment) => payment.patientId === patient.id);

  const totalBilled = patientInvoices.reduce((sum, invoice) => sum + Number(invoice.price || 0), 0);
  const totalPaid = patientInvoices.reduce((sum, invoice) => sum + Number(invoice.totalPaid || 0), 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Patient Billing History</h3>
            <p className="text-xs text-slate-400">{patient.name} · {patient.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-400">Total Billed</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalBilled)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-400">Total Paid</p>
            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-400">Outstanding</p>
            <p className="text-lg font-semibold text-amber-600">{formatCurrency(outstanding)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Invoices</h4>
            <div className="mt-3 space-y-2">
              {patientInvoices.length === 0 ? (
                <p className="text-xs text-slate-400">No invoices for this patient.</p>
              ) : (
                patientInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{invoice.serviceName}</p>
                      <p className="text-xs text-slate-400">{invoice.id} · {invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(invoice.price)}</p>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Payments</h4>
            <div className="mt-3 space-y-2">
              {patientPayments.length === 0 ? (
                <p className="text-xs text-slate-400">No payments recorded.</p>
              ) : (
                patientPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{payment.method}</p>
                      <p className="text-xs text-slate-400">{payment.invoiceId} · {payment.date}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientBillingHistoryModal;
