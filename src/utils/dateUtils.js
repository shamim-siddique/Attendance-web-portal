export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
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
