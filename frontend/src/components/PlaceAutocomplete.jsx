import { useState, useEffect, useRef } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export default function PlaceAutocomplete({ value, onChange, placeholder, id, required }) {
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: value,
          format: 'json',
          addressdetails: '1',
          limit: '5',
        })
        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'RouteTrafficHistoryApp/1.0 (address autocomplete)',
          },
        })
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [value])

  const selectSuggestion = (item) => {
    const addr = item.display_name || item.name || ''
    if (addr) onChange(addr)
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="place-autocomplete-wrapper" style={{ position: 'relative' }}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className="place-input"
        required={!!required}
        autoComplete="off"
      />
      {loading && (
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Searching...
        </span>
      )}
      {showDropdown && suggestions.length > 0 && (
        <ul
          className="place-autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => selectSuggestion(item)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover, rgba(0,0,0,0.05))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
