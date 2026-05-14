/**
 * Reusable InvoiceCard component for displaying invoice details
 * Used in invoice lists and dashboards
 */

import { formatCurrency } from '../../billing/billingUtils';
import InvoiceStatusBadge from './InvoiceStatusBadge';

const InvoiceCard = ({
  invoice,
  onClick,
  onAction,
  showActions = true,
  compact = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${compact ? 'p-3' : 'p-5'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 text-sm sm:text-base">
              Invoice #{invoice.id.toString().padStart(5, '0')}
            </p>
            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
              {invoice.type}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(invoice.createdDate || new Date()).toLocaleDateString()}
          </p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs text-slate-500">Patient</p>
          <p className="text-sm font-semibold text-slate-900">{invoice.patientName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Amount</p>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(invoice.finalAmount || invoice.price)}
          </p>
        </div>
      </div>

      {/* Insurance info if available */}
      {invoice.insuranceName && (
        <div className="mb-3 rounded-lg bg-blue-50 px-3 py-2">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">{invoice.insuranceName}</span>
            {' '}
            (<span className="font-semibold">{invoice.insuranceDiscount}%</span> discount)
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && onAction && (
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          {onAction.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                action.variant === 'danger'
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;
