import { useState, useEffect } from 'react'

const API = '/api'

export default function JobsList({ onSelectJob }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/jobs`)
      const data = await res.json()
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

  if (loading) return <div className="card">Loading jobs...</div>

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
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectJob(job.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                {job.start_location} → {job.end_location}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {job.cycle_minutes} min cycle • {job.duration_days} days • {job.navigation_type}
              </div>
            </div>
            <span className={`status-badge status-${job.status}`}>{job.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
