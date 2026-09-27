const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export const formatDate = (value?: string | null) => (value ? dateFormatter.format(new Date(value)) : '—')
export const formatDateTime = (value?: string | null) => (value ? dateTimeFormatter.format(new Date(value)) : '—')

/** ISO string → yyyy-mm-dd for <input type="date"> */
export const toDateInput = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : '')

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

export const ordinalYear = (year: number) => {
  const suffix = ['th', 'st', 'nd', 'rd'][year % 10 > 3 || Math.floor(year / 10) === 1 ? 0 : year % 10]
  return `${year}${suffix} year`
}

export const percent = (value: number | null | undefined) => (value === null || value === undefined ? '—' : `${value}%`)

export const relativeTime = (value?: string | null) => {
  if (!value) return 'never'
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return formatDate(value)
}

export const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export const DAY_LABEL: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = (h ?? 0) >= 12 ? 'pm' : 'am'
  return `${((h ?? 0) + 11) % 12 + 1}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

export const todayInput = () => new Date().toISOString().slice(0, 10)
export const monthInput = (d = new Date()) => d.toISOString().slice(0, 7)

export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
export const dueLabel = (iso: string) => {
  const d = daysUntil(iso)
  if (d < 0) return `${-d} day${d === -1 ? '' : 's'} overdue`
  if (d === 0) return 'Due today'
  if (d === 1) return 'Due tomorrow'
  return `Due in ${d} days`
}
