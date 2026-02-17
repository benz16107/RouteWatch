import { useState, useEffect } from 'react'
import { fetchJson } from '../utils/api.js'
import { shortenToStreet } from '../utils/formatAddress.js'

const API = '/api'

export default function JobsList({ onSelectJob }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (e, jobId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this job and all its collected data? This cannot be undone.')) return
    setDeletingId(jobId)
    try {
      await fetchJson(`${API}/jobs/${jobId}`, { method: 'DELETE' })
      fetchJobs()
    } catch (err) {
      alert(err?.message || 'Failed to delete job')
    } finally {
      setDeletingId(null)
    }
  }

  const fetchJobs = async () => {
    try {
      const data = await fetchJson(`${API}/jobs`)
      setJobs(data)
    } catch (e) {
      console.error(e)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="card card-loading"><span className="loading-text">Loading jobs...</span></div>

  if (jobs.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>No collection jobs yet</h3>
          <p>Create a new job to start collecting route traffic data.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Collection Jobs</h2>
      {jobs.map(job => (
        <div
          key={job.id}
          className="card job-card"
          onClick={() => onSelectJob(job.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                {shortenToStreet(job.start_location)} → {shortenToStreet(job.end_location)}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {(job.cycle_seconds ?? 0) > 0 ? `${job.cycle_seconds} sec` : `${job.cycle_minutes ?? 60} min`} cycle • {job.duration_days} days • {job.navigation_type}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`status-badge status-${job.status}`}>{job.status}</span>
              <button
                className="btn btn-danger"
                onClick={(e) => handleDelete(e, job.id)}
                disabled={deletingId === job.id}
                title="Delete this job"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                {deletingId === job.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
