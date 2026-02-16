import { useState, useEffect } from 'react'
import PlaceAutocomplete from './PlaceAutocomplete'
import { fetchJson } from '../utils/api.js'
import { getCurrentLocationAddress } from '../utils/geolocation.js'

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
  const [locationLoading, setLocationLoading] = useState(false)
  const [form, setForm] = useState({
    start_location: '',
    end_location: '',
    start_time: '',
    end_time: '',
    cycle_value: 60,
    cycle_unit: 'minutes',
    duration_days: 7,
    navigation_type: 'driving',
    avoid_highways: false,
    avoid_tolls: false,
  })

  useEffect(() => {
    if (job) {
      const useSeconds = (job.cycle_seconds ?? 0) > 0
      const cycleVal = useSeconds ? (job.cycle_seconds || 60) : (job.cycle_minutes ?? 60)
      setForm({
        start_location: job.start_location || '',
        end_location: job.end_location || '',
        start_time: toDatetimeLocal(job.start_time),
        end_time: toDatetimeLocal(job.end_time),
        cycle_value: cycleVal,
        cycle_unit: useSeconds ? 'seconds' : 'minutes',
        duration_days: job.duration_days ?? 7,
        navigation_type: job.navigation_type || 'driving',
        avoid_highways: !!job.avoid_highways,
        avoid_tolls: !!job.avoid_tolls,
      })
    }
  }, [job?.id])

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true)
    setError('')
    try {
      const address = await getCurrentLocationAddress()
      setForm(prev => ({ ...prev, start_location: address }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLocationLoading(false)
    }
  }

  const cycleMin = form.cycle_unit === 'minutes' ? 1 : 10
  const cycleMax = form.cycle_unit === 'minutes' ? 1440 : 86400

  const getCyclePayload = () => {
    const v = Math.max(cycleMin, Math.min(cycleMax, Number(form.cycle_value) || cycleMin))
    if (form.cycle_unit === 'seconds') {
      return { cycle_minutes: 0, cycle_seconds: v }
    }
    return { cycle_minutes: v, cycle_seconds: 0 }
  }

  const handleCycleValueChange = (e) => {
    const raw = e.target.value
    if (raw === '') {
      setForm(prev => ({ ...prev, cycle_value: '' }))
      return
    }
    const num = Number(raw)
    if (!Number.isNaN(num)) {
      setForm(prev => ({ ...prev, cycle_value: num }))
    }
  }

  const handleCycleUnitChange = (e) => {
    const newUnit = e.target.value
    setForm(prev => {
      const curVal = Number(prev.cycle_value)
      const num = Number.isNaN(curVal) || curVal <= 0 ? (prev.cycle_unit === 'minutes' ? 60 : 60) : curVal
      if (prev.cycle_unit === 'minutes' && newUnit === 'seconds') {
        return { ...prev, cycle_unit: newUnit, cycle_value: Math.max(10, Math.min(86400, num * 60)) }
      }
      if (prev.cycle_unit === 'seconds' && newUnit === 'minutes') {
        return { ...prev, cycle_unit: newUnit, cycle_value: Math.max(1, Math.min(1440, Math.round(num / 60))) }
      }
      return { ...prev, cycle_unit: newUnit }
    })
  }

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
          ...getCyclePayload(),
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
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <PlaceAutocomplete
                  value={form.start_location}
                  onChange={(v) => setForm(prev => ({ ...prev, start_location: v }))}
                  placeholder="e.g. San Francisco, CA"
                  id="edit_start_location"
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                title="Use your current location"
              >
                {locationLoading ? '...' : 'Current location'}
              </button>
            </div>
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
              <label>Cycle Duration</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  min={cycleMin}
                  max={cycleMax}
                  value={form.cycle_value === '' ? '' : form.cycle_value}
                  onChange={handleCycleValueChange}
                  onBlur={() => {
                    const v = Number(form.cycle_value)
                    if (form.cycle_value === '' || Number.isNaN(v) || v < cycleMin || v > cycleMax) {
                      setForm(prev => ({ ...prev, cycle_value: cycleMin }))
                    }
                  }}
                  style={{ width: '6rem' }}
                  aria-label="Cycle duration"
                />
                <select
                  value={form.cycle_unit}
                  onChange={handleCycleUnitChange}
                  aria-label="Cycle unit"
                >
                  <option value="minutes">minutes</option>
                  <option value="seconds">seconds</option>
                </select>
              </div>
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
