import { shortenToStreet } from './formatAddress.js'

/**
 * Main title for a job: custom name, or "start_name → end_name", or shortened addresses.
 */
export function getJobTitle(job) {
  if (!job) return '—'
  if (job.name && job.name.trim()) return job.name.trim()
  if (job.start_name || job.end_name) {
    return `${job.start_name || 'Start'} → ${job.end_name || 'End'}`
  }
  const start = shortenToStreet(job.start_location) || '—'
  const end = shortenToStreet(job.end_location) || '—'
  return `${start} → ${end}`
}

/**
 * Subtitle when job has a custom title and start/end names: "start_name → end_name".
 */
export function getJobSubtitle(job) {
  if (!job || !(job.name && job.name.trim())) return null
  if (!job.start_name && !job.end_name) return null
  return `${job.start_name || 'Start'} → ${job.end_name || 'End'}`
}

/**
 * Format job cycle interval for display (e.g. "Every 5 min", "Every 30s").
 */
export function formatCycleLabel(job) {
  if (!job) return '—'
  const sec = parseInt(job.cycle_seconds, 10)
  if (!Number.isNaN(sec) && sec > 0) {
    return `Every ${sec}s`
  }
  const min = parseInt(job.cycle_minutes, 10) || 60
  return `Every ${min} min`
}

/**
 * Format navigation type with capital first letter (e.g. "driving" → "Driving").
 */
export function formatNavigationType(type) {
  if (!type || typeof type !== 'string') return 'Driving'
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

const SEP = ' · '

/**
 * Short meta string for tiles/lists: "Every 5 min · 7 days · Driving"
 */
export function formatJobMetaShort(job) {
  if (!job) return ''
  const cycle = formatCycleLabel(job)
  const days = job.duration_days ?? 7
  const mode = formatNavigationType(job.navigation_type)
  return [cycle, `${days} days`, mode].join(SEP)
}
