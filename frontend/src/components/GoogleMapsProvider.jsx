import { useJsApiLoader } from '@react-google-maps/api'
import { createContext, useContext } from 'react'

const GoogleMapsContext = createContext({ isLoaded: false, loadError: null })

export function GoogleMapsProvider({ children }) {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim()
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
    id: 'google-maps-script',
  })

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey: !!apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext)
}
