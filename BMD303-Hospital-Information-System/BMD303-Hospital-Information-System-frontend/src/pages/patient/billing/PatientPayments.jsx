import { useMemo } from 'react';
import { useBilling } from '../../../billing';
import { useAuth } from '../../../context/AuthContext';
import EmptyState from '../../../components/billing/EmptyState';
import { formatCurrency, resolvePatientId } from '../../../billing/billingUtils';

const PatientPayments = () => {
  const { paymentsState } = useBilling();
  const { user } = useAuth();
  const patientId = resolvePatientId(user);

  const payments = useMemo(() => {
    if (!patientId) return [];
    return (paymentsState.items || []).filter((payment) => payment.patientId === patientId);
  }, [paymentsState.items, patientId]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500">Track your payment history.</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Payments will show here once processed." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-100 text-slate-600">
                  <td className="px-4 py-3 font-semibold text-slate-800">{payment.invoiceId}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientPayments;
