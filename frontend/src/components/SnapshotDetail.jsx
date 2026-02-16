import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points?.length) {
      try {
        const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]))
        map.fitBounds(bounds, { padding: [20, 20] })
      } catch (_) {}
    }
  }, [map, points])
  return null
}

function SnapshotMap({ points }) {
  if (!points?.length) return <div className="map-placeholder" style={{ minHeight: 200 }}>No route geometry</div>
  const center = points[Math.floor(points.length / 2)]
  return (
    <div className="route-map-container" style={{ borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: 200, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={points.map(([lat, lng]) => [lat, lng])}
          color="#58a6ff"
          weight={4}
          opacity={0.8}
        />
        <FitBounds points={points} />
      </MapContainer>
    </div>
  )
}

export default function SnapshotDetail({ snapshot }) {
  const details = (() => {
    try {
      return typeof snapshot.route_details === 'string'
        ? JSON.parse(snapshot.route_details)
        : snapshot.route_details || {}
    } catch {
      return {}
    }
  })()

  const points = details.points ?? []
  const steps = details.steps ?? []

  return (
    <div style={{ padding: '1rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Route</h4>
          <SnapshotMap points={points} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Turn-by-turn</h4>
          {steps.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No step data</p>
          ) : (
            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto' }}>
              {steps.map((step, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>
                  <span dangerouslySetInnerHTML={{ __html: step.instruction }} />
                  {step.distanceText && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      ({step.distanceText}{step.durationText ? `, ${step.durationText}` : ''})
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
