/**
 * Reusable SectionHeader component for page and section titles
 * Provides consistent header styling across the application
 */

const SectionHeader = ({
  title,
  subtitle,
  action,
  icon,
  className,
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 ${className || ''}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;
