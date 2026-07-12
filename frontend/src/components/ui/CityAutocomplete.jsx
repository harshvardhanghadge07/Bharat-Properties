import { useState, useRef, useEffect, useMemo } from 'react'
import { MapPin, X } from 'lucide-react'
import { ALL_CITIES, getStateByCity } from '../../utils/indiaData'

/**
 * Searchable city autocomplete — searches across EVERY city/town in indiaData.js
 * (all 28 states + 8 UTs, including small towns/talukas), not just a sliced subset.
 *
 * Props:
 *  value        - current city string
 *  onChange     - (cityName: string) => void   fired when user picks/clears a city
 *  cities       - optional custom city list to search within (defaults to ALL_CITIES)
 *  placeholder  - input placeholder
 *  className    - extra classes for the input
 *  showState    - show the state name next to each suggestion (default true)
 */
export default function CityAutocomplete({
  value = '',
  onChange,
  cities,
  placeholder = 'Search for a city...',
  className = '',
  showState = true,
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapRef = useRef(null)

  const sourceCities = cities && cities.length ? cities : ALL_CITIES

  // Keep local input text in sync if parent resets value externally
  useEffect(() => { setQuery(value) }, [value])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const starts = []
    const contains = []
    for (const c of sourceCities) {
      const lc = c.toLowerCase()
      if (lc.startsWith(q)) starts.push(c)
      else if (lc.includes(q)) contains.push(c)
      if (starts.length >= 8) break
    }
    return [...starts, ...contains].slice(0, 8)
  }, [query, sourceCities])

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const pick = (city) => {
    setQuery(city)
    setOpen(false)
    onChange?.(city)
  }

  const clear = () => {
    setQuery('')
    onChange?.('')
  }

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault()
      pick(suggestions[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full pl-10 pr-9 py-4 text-sm text-gray-700 focus:outline-none bg-transparent ${className}`}
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 max-h-72 overflow-y-auto">
          {suggestions.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 ${
                i === highlight ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                {c}
              </span>
              {showState && (
                <span className="text-xs text-gray-400 flex-shrink-0">{getStateByCity(c)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
