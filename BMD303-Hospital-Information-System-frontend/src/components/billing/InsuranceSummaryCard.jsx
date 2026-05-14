import { formatCurrency } from '../../billing/billingUtils';

const InsuranceSummaryCard = ({ invoice }) => {
  const hasInsurance = invoice?.insuranceId && invoice?.insuranceName;

  if (!hasInsurance && (!invoice?.price || invoice?.price === 0)) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-800 mb-4">Invoice Summary</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Service Price</span>
          <span className="font-semibold text-slate-900">{formatCurrency(invoice.price)}</span>
        </div>

        {hasInsurance && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Insurance</span>
              <span className="font-semibold text-slate-900">{invoice.insuranceName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Insurance Discount</span>
              <span className="font-semibold text-emerald-600">-{formatCurrency(invoice.insuranceDiscount)}</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">Final Amount (Patient Pays)</span>
              <span className="font-bold text-lg text-slate-900">{formatCurrency(invoice.finalAmount)}</span>
            </div>
          </>
        )}

        {!hasInsurance && (
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">Total Amount</span>
            <span className="font-bold text-lg text-slate-900">{formatCurrency(invoice.price)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceSummaryCard;
