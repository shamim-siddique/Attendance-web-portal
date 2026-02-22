const variantStyles = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  slate: 'bg-slate-700 text-slate-400 border border-slate-600'
}

export function Badge({ variant = 'slate', children, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
        ${variantStyles[variant] ?? variantStyles.slate}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
