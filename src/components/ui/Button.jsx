import { Loader2 } from 'lucide-react'

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 border-transparent',
  outline: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base'
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        rounded-xl font-medium transition-all duration-150 flex items-center justify-center gap-2
        border
        ${variantStyles[variant] ?? variantStyles.primary}
        ${sizeStyles[size] ?? sizeStyles.md}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
