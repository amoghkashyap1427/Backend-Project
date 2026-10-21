export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || name;
  const errorId = inputId ? `${inputId}-error` : undefined;

  const baseInputStyles =
    'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed';

  const borderStyles = error
    ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={`${baseInputStyles} ${borderStyles} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
