import { Filter } from 'lucide-react'
import { Button } from './Button'

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onApply,
  loading = false
}) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate ?? ''}
          onChange={(e) => onStartChange(e.target.value)}
          className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
          End Date
        </label>
        <input
          type="date"
          value={endDate ?? ''}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
        />
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onApply}
        loading={loading}
        className="shrink-0"
      >
        <Filter className="w-4 h-4" />
        Apply
      </Button>
    </div>
  )
}
