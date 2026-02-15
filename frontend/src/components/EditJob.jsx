import { useState, useEffect } from 'react'
import PlaceAutocomplete from './PlaceAutocomplete'
import { fetchJson } from '../utils/api.js'

const API = '/api'

function toDatetimeLocal(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

export default function EditJob({ job, onSaved, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    start_location: '',
    end_location: '',
    start_time: '',
    end_time: '',
    cycle_minutes: 60,
    duration_days: 7,
    navigation_type: 'driving',
    avoid_highways: false,
    avoid_tolls: false,
    additional_routes: 0,
  })

  useEffect(() => {
    if (job) {
      setForm({
        start_location: job.start_location || '',
        end_location: job.end_location || '',
        start_time: toDatetimeLocal(job.start_time),
        end_time: toDatetimeLocal(job.end_time),
        cycle_minutes: job.cycle_minutes ?? 60,
        duration_days: job.duration_days ?? 7,
        navigation_type: job.navigation_type || 'driving',
        avoid_highways: !!job.avoid_highways,
        avoid_tolls: !!job.avoid_tolls,
        additional_routes: job.additional_routes ?? 0,
      })
    }
  }, [job])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await fetchJson(`${API}/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
        }),
      })
      if (data?.error) throw new Error(data.error)
      onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!job) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <h2>Edit Job Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Start Location</label>
            <PlaceAutocomplete
              value={form.start_location}
              onChange={(v) => setForm(prev => ({ ...prev, start_location: v }))}
              placeholder="e.g. San Francisco, CA"
              id="edit_start_location"
              required
            />
          </div>
          <div className="form-group">
            <label>Destination Location</label>
            <PlaceAutocomplete
              value={form.end_location}
              onChange={(v) => setForm(prev => ({ ...prev, end_location: v }))}
              placeholder="e.g. Oakland, CA"
              id="edit_end_location"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data Start Time (optional)</label>
              <input
                name="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Data End Time (optional)</label>
              <input
                name="end_time"
                type="datetime-local"
                value={form.end_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cycle Duration (minutes)</label>
              <input
                name="cycle_minutes"
                type="number"
                min={1}
                max={1440}
                value={form.cycle_minutes}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Duration (days)</label>
              <input
                name="duration_days"
                type="number"
                min={1}
                max={365}
                value={form.duration_days}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Navigation Type</label>
            <select name="navigation_type" value={form.navigation_type} onChange={handleChange}>
              <option value="driving">Driving</option>
              <option value="walking">Walking</option>
              <option value="transit">Transit</option>
            </select>
          </div>

          <div className="form-group">
            <label>Route Preferences</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="avoid_highways" checked={form.avoid_highways} onChange={handleChange} />
                Avoid highways
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="avoid_tolls" checked={form.avoid_tolls} onChange={handleChange} />
                Avoid tolls
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Routes (0–2)</label>
            <input
              name="additional_routes"
              type="number"
              min={0}
              max={2}
              value={form.additional_routes}
              onChange={handleChange}
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
