const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) reject(new Error('Location permission denied'))
        else if (err.code === 2) reject(new Error('Location unavailable'))
        else if (err.code === 3) reject(new Error('Location request timed out'))
        else reject(new Error(err.message || 'Could not get location'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  })
}

export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
  })
  const res = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'RouteTrafficHistoryApp/1.0 (address lookup)',
    },
  })
  const data = await res.json()
  return data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

export async function getCurrentLocationAddress() {
  const { lat, lng } = await getCurrentLocation()
  const address = await reverseGeocode(lat, lng)
  return address
}
