import { formatCurrency } from '../../billing/billingUtils';

const BillingSummary = ({ total, paid, pending }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">Billing Summary</p>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Total Invoiced</span>
          <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Paid</span>
          <span className="font-semibold text-emerald-600">{formatCurrency(paid)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Pending</span>
          <span className="font-semibold text-amber-600">{formatCurrency(pending)}</span>
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
