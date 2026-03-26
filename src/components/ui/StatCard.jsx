const iconBgColors = {
  indigo: 'bg-indigo-500/20 text-indigo-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/20 text-blue-400',
  rose: 'bg-rose-500/20 text-rose-400',
  amber: 'bg-amber-500/20 text-amber-400'
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg = 'indigo',
  loading = false,
  onClick
}) {
  const isClickable = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      className={`
        bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6
        ${isClickable ? 'cursor-pointer hover:border-gray-300 dark:hover:border-slate-700 transition-all' : ''}
      `}
    >
      {loading ? (
        <>
          <div className="h-10 w-24 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded mt-2 animate-pulse" />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
            {Icon && (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  iconBgColors[iconBg] ?? iconBgColors.indigo
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">{label}</p>
          {sub && <p className="text-gray-500 dark:text-slate-500 text-xs mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  )
}
