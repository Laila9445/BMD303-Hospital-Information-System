/**
 * Reusable FormInput component for consistent form field styling
 * Supports text, number, email, password, and select inputs
 */

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  options, // For select inputs
  className,
  ...props
}) => {
  const baseClasses = 'w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:outline-none';
  const inputClasses = error
    ? 'border-rose-200 bg-rose-50 text-slate-900 focus:border-rose-500'
    : 'border-slate-200 bg-white text-slate-900 focus:border-blue-500';
  const disabledClasses = disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : '';
  const fullClasses = `${baseClasses} ${inputClasses} ${disabledClasses} ${className || ''}`;

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-xs font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select value={value} onChange={onChange} disabled={disabled} className={fullClasses} {...props}>
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${fullClasses} resize-none`}
          rows="3"
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={fullClasses}
          {...props}
        />
      )}
      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-rose-600' : 'text-slate-400'}`}>{helperText}</p>
      )}
    </div>
  );
};

export default FormInput;
