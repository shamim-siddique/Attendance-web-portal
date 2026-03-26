export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-gray-600 dark:text-slate-600" />}
      </div>
      <h3 className="text-gray-900 dark:text-white font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 dark:text-slate-400 text-sm max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
