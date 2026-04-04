export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const value = String(dateStr).includes('T')
    ? new Date(dateStr)
    : new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(value.getTime())) return '—'
  return value.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const formatTime = (isoStr) => {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatMinutes = (minutes) => {
  if (minutes == null) return '—'
  return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm'
}

export const toDatetimeLocal = (isoStr) => {
  if (!isoStr) return ''
  return new Date(isoStr).toISOString().slice(0, 16)
}

export const getToday = () => new Date().toISOString().split('T')[0]

export const getFirstDayOfMonth = () => getToday().slice(0, 7) + '-01'

export const getLastDayOfMonth = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  // Get the last day of the current month by going to next month and day 0
  const lastDay = new Date(year, month + 1, 0)
  // Format as YYYY-MM-DD in local timezone
  const yearStr = lastDay.getFullYear()
  const monthStr = String(lastDay.getMonth() + 1).padStart(2, '0')
  const dayStr = String(lastDay.getDate()).padStart(2, '0')
  return `${yearStr}-${monthStr}-${dayStr}`
}
