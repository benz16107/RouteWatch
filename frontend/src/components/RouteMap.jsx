import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API = '/api'

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points?.length) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [map, points])
  return null
}

export default function RouteMap({ origin, destination, travelMode = 'driving', avoidHighways, avoidTolls }) {
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!origin || !destination) {
      setRoute(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      origin,
      destination,
      mode: travelMode,
    })
    if (avoidHighways) params.set('avoid_highways', '1')
    if (avoidTolls) params.set('avoid_tolls', '1')

    fetch(`${API}/route-preview?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setRoute(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [origin, destination, travelMode, avoidHighways, avoidTolls])

  if (!origin || !destination) {
    return (
      <div className="map-placeholder">
        Set start and destination to view route
      </div>
    )
  }

  if (loading) {
    return <div className="map-placeholder">Loading route...</div>
  }

  if (error) {
    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`
    return (
      <div className="map-placeholder map-error">
        <strong>Could not load route</strong>
        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{error}</p>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          View on Google Maps →
        </a>
      </div>
    )
  }

  if (!route?.points?.length) {
    return <div className="map-placeholder">No route found</div>
  }

  const polylinePositions = route.points.map(([lat, lng]) => [lat, lng])

  return (
    <div className="route-map-container">
      <MapContainer
        center={route.start || polylinePositions[0]}
        zoom={10}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={polylinePositions} color="#58a6ff" weight={4} opacity={0.8} />
        <FitBounds points={route.points} />
      </MapContainer>
    </div>
  )
}
