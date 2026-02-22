export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  hint,
  name,
  id,
  required = false,
  step,
  min,
  max,
  rows,
  className = '',
  ...rest
}) {
  const inputId = id ?? name
  const baseInputClass = `
    w-full bg-slate-800 border rounded-xl px-4 py-3 text-white text-sm
    placeholder:text-slate-500 focus:outline-none transition-colors
    ${icon ? 'pl-10' : ''}
    ${error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-indigo-500'}
    ${className}
  `

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        {rows ? (
          <textarea
            id={inputId}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={baseInputClass + ' resize-none'}
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            step={step}
            min={min}
            max={max}
            className={baseInputClass}
            {...rest}
          />
        )}
      </div>
      {hint && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
