import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { useGoogleMaps } from './GoogleMapsProvider.jsx'

export default function PlaceAutocomplete({ value, onChange, placeholder, id, required }) {
  const autocompleteRef = useRef(null)
  const { isLoaded, loadError, apiKey } = useGoogleMaps()

  const handleLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      const addr = place?.formatted_address || place?.name || ''
      if (addr) onChange(addr)
    }
  }

  const inputProps = {
    id,
    type: 'text',
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    className: 'place-input',
    required: !!required,
  }

  if (!apiKey) {
    return <input {...inputProps} />
  }

  if (loadError) {
    return <input {...inputProps} />
  }

  if (!isLoaded) {
    return <input {...inputProps} disabled />
  }

  return (
    <div className="place-autocomplete-wrapper">
      <Autocomplete
        onLoad={handleLoad}
        onPlaceChanged={handlePlaceChanged}
        options={{ types: ['address', 'establishment'] }}
      >
        <input {...inputProps} />
      </Autocomplete>
    </div>
  )
}
