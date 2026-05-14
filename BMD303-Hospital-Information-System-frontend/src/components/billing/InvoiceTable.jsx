import InvoiceStatusBadge from './InvoiceStatusBadge';
import { formatCurrency } from '../../billing/billingUtils';
import ActionButton from './ActionButton';

const InvoiceTable = ({
  invoices,
  onView,
  onOpenPage,
  onMarkPaid,
  onCancel,
  onHistory,
  viewLabel = 'Quick View',
  openLabel = 'Details',
  markPaidLabel = 'Mark Paid',
  cancelLabel = 'Cancel',
  historyLabel = 'History',
}) => {
  const hasActions = Boolean(onView || onOpenPage || onMarkPaid || onCancel || onHistory);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Patient Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Final Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              {hasActions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-slate-100 text-slate-600">
                <td className="px-4 py-3 font-medium text-slate-800">{invoice.id}</td>
                <td className="px-4 py-3">{invoice.patientName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {invoice.type || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">{invoice.department}</td>
                <td className="px-4 py-3">{invoice.serviceName}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(invoice.price)}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(invoice.finalAmount || invoice.price)}</td>
                <td className="px-4 py-3">{invoice.date}</td>
                <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                {hasActions && (
                  <td className="px-4 py-3 text-right">
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'end', gap: 8 }}>
                        {onView && (
                          <ActionButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onView(invoice)}
                          >
                            {viewLabel}
                          </ActionButton>
                        )}
                        {onOpenPage && (
                          <ActionButton
                            variant="primary"
                            size="sm"
                            onClick={() => onOpenPage(invoice)}
                          >
                            {openLabel}
                          </ActionButton>
                        )}
                        {onMarkPaid && (
                          <ActionButton
                            variant="success"
                            size="sm"
                            onClick={() => onMarkPaid(invoice)}
                          >
                            {markPaidLabel}
                          </ActionButton>
                        )}
                        {onCancel && (
                          <ActionButton
                            variant="danger"
                            size="sm"
                            onClick={() => onCancel(invoice)}
                          >
                            {cancelLabel}
                          </ActionButton>
                        )}
                        {onHistory && (
                          <ActionButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onHistory(invoice)}
                          >
                            {historyLabel}
                          </ActionButton>
                        )}
                      </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;
