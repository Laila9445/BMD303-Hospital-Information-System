import { formatCurrency } from '../../billing/billingUtils';

const ServicePriceCard = ({ service, onEdit }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{service.serviceName}</p>
          <p className="mt-1 text-xs text-slate-400">{service.department}</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{formatCurrency(service.price)}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs ${service.activeStatus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {service.activeStatus ? 'Active' : 'Inactive'}
          </span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {service.description && (
        <p className="mt-3 text-xs text-slate-400">{service.description}</p>
      )}
    </div>
  );
};

export default ServicePriceCard;
