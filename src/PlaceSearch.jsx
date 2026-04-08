import React, { useState, useEffect, useRef, useCallback } from 'react'

function debounce(func, wait = 300) {
  let timeoutId
  return function (...args) {
    const context = this
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(context, args), wait)
  }
}
import { Search, X, Loader2, ExternalLink, Info, MapPin, Image, Cloud, Library, Check, Copy, Wind, Thermometer, Droplets } from 'lucide-react'

const defaultStyles = {
  wrapper: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    zIndex: 1000,
    width: 'min(420px, calc(100% - 32px))',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    touchAction: 'pan-y',
    fontFamily: 'system-ui, sans-serif'
  },
  form: {
    display: 'flex',
    gap: '8px',
    padding: '12px'
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: '12px 40px 12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    borderRadius: '12px',
    border: 'none',
    background: '#0f172a',
    color: '#fff',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  resultCard: {
    maxHeight: '360px',
    overflowY: 'auto',
    borderTop: '1px solid rgba(15, 23, 42, 0.08)'
  },
  resultItem: {
    padding: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
  },
  selectedItem: {
    background: 'rgba(59, 130, 246, 0.08)',
    borderLeft: '4px solid #2563eb'
  },
  detailsPanel: {
    padding: '16px',
    borderTop: '1px solid rgba(15, 23, 42, 0.08)',
    maxHeight: 'calc(100vh - 320px)',
    overflowY: 'auto'
  },
  mobileWrapper: {
    left: '50%',
    transform: 'translateX(-50%)',
    top: '12px',
    width: '70%',
    maxHeight: 'calc(100vh - 24px)'
  },
  mobileForm: {
    gap: '6px',
    padding: '10px'
  },
  mobileInput: {
    padding: '10px 36px 10px 12px'
  },
  mobileButton: {
    width: '40px',
    height: '40px'
  },
  mobileResultCard: {
    maxHeight: '280px'
  },
  mobileDetailsPanel: {
    maxHeight: 'calc(100vh - 260px)'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },
  tabButton: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    background: '#f8fafc',
    color: '#0f172a',
    cursor: 'pointer'
  },
  activeTab: {
    background: '#0f172a',
    color: '#fff',
    borderColor: '#0f172a'
  }
}

const PlaceSearch = ({
  mapRef,
  searchPlaceholder = 'Search for a place...',
  showWeather = true,
  showImages = true,
  className = '',
  nominatimUrl = 'https://nominatim.openstreetmap.org/search',
  openMeteoUrl = 'https://api.open-meteo.com/v1/forecast'
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [placeInfo, setPlaceInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [imageGallery, setImageGallery] = useState([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [weatherData, setWeatherData] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedCoords, setCopiedCoords] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([])
      setShowResults(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth <= 640)
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const performSearch = async (term) => {
    if (!term.trim() || term.length < 2) return
    setLoading(true)
    setShowResults(true)

    try {
      const response = await fetch(`${nominatimUrl}?format=json&q=${encodeURIComponent(term)}&limit=7`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('PlaceSearch search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useCallback(
    debounce((term) => {
      performSearch(term)
    }, 300),
    [nominatimUrl]
  )

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }
    debouncedSearch(value)
  }

  const handleResultClick = async (result) => {
    const map = mapRef?.current || mapRef
    if (!map || typeof map.flyTo !== 'function') return

    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    map.flyTo([lat, lon], 14)
    setSelectedPlace(result)
    setActiveTab('overview')
    await fetchPlaceInfo(result)
    if (showWeather) {
      fetchWeatherForecast(lat, lon)
    }
  }

  const fetchPlaceInfo = async (place) => {
    setLoadingInfo(true)
    setImageGallery([])
    setWeatherData(null)

    try {
      const formatted = formatDisplayName(place)
      const searchTerm = formatted.primary
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`
      )
      if (!searchResponse.ok) throw new Error('Wikipedia search failed')
      const searchData = await searchResponse.json()
      const pageId = searchData?.query?.search?.[0]?.pageid
      if (!pageId) {
        setPlaceInfo({
          title: formatted.primary,
          extract: 'No additional information found for this location.',
          thumbnail: null,
          url: null,
          location: { lat: parseFloat(place.lat || 0), lon: parseFloat(place.lon || 0) },
          osm_type: place.osm_type,
          osm_id: place.osm_id,
          display_name: place.display_name
        })
        return
      }

      const contentResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&exintro=1&inprop=url&pithumbsize=500&pageids=${pageId}&format=json&origin=*`
      )
      if (!contentResponse.ok) throw new Error('Wikipedia content fetch failed')
      const contentData = await contentResponse.json()
      const page = contentData.query.pages[pageId]
      fetchWikimediaImages(page.title)
      let extract = page.extract || 'No description available.'
      if (extract.length > 500) {
        extract = extract.split('</p>').slice(0, 2).join('</p>') + '</p>'
      }
      setPlaceInfo({
        title: page.title,
        extract,
        thumbnail: page.thumbnail?.source || null,
        url: page.fullurl,
        location: { lat: parseFloat(place.lat), lon: parseFloat(place.lon) },
        osm_type: place.osm_type,
        osm_id: place.osm_id,
        display_name: place.display_name
      })
    } catch (error) {
      console.error('PlaceSearch place info error:', error)
      setPlaceInfo({
        title: place.display_name.split(',')[0],
        extract: 'Could not load additional information for this location.',
        thumbnail: null,
        url: null,
        location: { lat: parseFloat(place.lat || 0), lon: parseFloat(place.lon || 0) },
        osm_type: place.osm_type,
        osm_id: place.osm_id
      })
    } finally {
      setLoadingInfo(false)
    }
  }

  const fetchWikimediaImages = async (title) => {
    if (!showImages) return
    setLoadingGallery(true)
    try {
      const imagesResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=10&format=json&origin=*`
      )
      if (!imagesResponse.ok) throw new Error('Wikimedia images fetch failed')
      const imagesData = await imagesResponse.json()
      const pages = imagesData.query.pages
      const pageId = Object.keys(pages)[0]
      const imageFiles = (pages[pageId].images || []).filter((img) => {
        const lower = img.title.toLowerCase()
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif')
      }).slice(0, 5)
      const imageUrls = await Promise.all(
        imageFiles.map(async (image) => {
          const imageInfoResponse = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(image.title)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=400&format=json&origin=*`
          )
          if (!imageInfoResponse.ok) return null
          const imageInfoData = await imageInfoResponse.json()
          const pages = imageInfoData.query.pages
          const pageId = Object.keys(pages)[0]
          return pages[pageId].imageinfo?.[0]?.thumburl || pages[pageId].imageinfo?.[0]?.url || null
        })
      )
      setImageGallery([...new Set(imageUrls.filter(Boolean))])
    } catch (error) {
      console.error('PlaceSearch image gallery error:', error)
      setImageGallery([])
    } finally {
      setLoadingGallery(false)
    }
  }

  const fetchWeatherForecast = async (lat, lon) => {
    if (!lat || !lon || !showWeather) return
    setLoadingWeather(true)
    try {
      const response = await fetch(
        `${openMeteoUrl}?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto&forecast_days=7`
      )
      if (!response.ok) throw new Error('Weather fetch failed')
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error('PlaceSearch weather error:', error)
      setWeatherData(null)
    } finally {
      setLoadingWeather(false)
    }
  }

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: { description: 'Clear sky', emoji: '☀️' },
      1: { description: 'Mainly clear', emoji: '🌤️' },
      2: { description: 'Partly cloudy', emoji: '⛅' },
      3: { description: 'Overcast', emoji: '☁️' },
      45: { description: 'Fog', emoji: '🌫️' },
      48: { description: 'Depositing rime fog', emoji: '🌫️' },
      51: { description: 'Light drizzle', emoji: '🌦️' },
      53: { description: 'Moderate drizzle', emoji: '🌦️' },
      55: { description: 'Dense drizzle', emoji: '🌧️' },
      56: { description: 'Light freezing drizzle', emoji: '🌨️' },
      57: { description: 'Dense freezing drizzle', emoji: '🌨️' },
      61: { description: 'Slight rain', emoji: '🌦️' },
      63: { description: 'Moderate rain', emoji: '🌧️' },
      65: { description: 'Heavy rain', emoji: '🌧️' },
      66: { description: 'Light freezing rain', emoji: '🌨️' },
      67: { description: 'Heavy freezing rain', emoji: '🌨️' },
      71: { description: 'Slight snow fall', emoji: '🌨️' },
      73: { description: 'Moderate snow fall', emoji: '🌨️' },
      75: { description: 'Heavy snow fall', emoji: '❄️' },
      77: { description: 'Snow grains', emoji: '❄️' },
      80: { description: 'Slight rain showers', emoji: '🌦️' },
      81: { description: 'Moderate rain showers', emoji: '🌧️' },
      82: { description: 'Violent rain showers', emoji: '⛈️' },
      85: { description: 'Slight snow showers', emoji: '🌨️' },
      86: { description: 'Heavy snow showers', emoji: '❄️' },
      95: { description: 'Thunderstorm', emoji: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', emoji: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', emoji: '⛈️' }
    }
    return weatherCodes[code] || { description: 'Unknown', emoji: '❓' }
  }

  const formatDisplayName = (result) => {
    const primaryName = result.display_name.split(',')[0]
    const address = result.address || {}
    const city = address.city || address.town || address.village || address.hamlet
    const state = address.state || address.county
    const country = address.country
    const secondaryParts = []
    if (city && !primaryName.includes(city)) secondaryParts.push(city)
    if (state && !primaryName.includes(state)) secondaryParts.push(state)
    if (country) secondaryParts.push(country)
    return { primary: primaryName, secondary: secondaryParts.join(', ') }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    setSelectedPlace(null)
    setPlaceInfo(null)
    setImageGallery([])
    setWeatherData(null)
    setActiveTab('overview')
  }

  const copyCoords = () => {
    if (!placeInfo?.location) return
    const coords = `${placeInfo.location.lat.toFixed(5)}, ${placeInfo.location.lon.toFixed(5)}`
    navigator.clipboard.writeText(coords)
    setCopiedCoords(true)
    window.setTimeout(() => setCopiedCoords(false), 2000)
  }

  const handleWheel = (event) => {
    event.stopPropagation()
  }

  useEffect(() => {
    const node = searchRef.current
    if (!node) return

    const captureWheel = (event) => {
      event.stopPropagation()
    }

    node.addEventListener('wheel', captureWheel, { capture: true, passive: false })
    return () => {
      node.removeEventListener('wheel', captureWheel, { capture: true })
    }
  }, [])

  return (
    <div
      ref={searchRef}
      style={isMobile ? { ...defaultStyles.wrapper, ...defaultStyles.mobileWrapper } : defaultStyles.wrapper}
      className={className}
      onWheelCapture={handleWheel}
      onWheel={handleWheel}
    >
      <form
        style={isMobile ? { ...defaultStyles.form, ...defaultStyles.mobileForm } : defaultStyles.form}
        onSubmit={(e) => { e.preventDefault(); performSearch(searchTerm) }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleInputChange}
            style={isMobile ? { ...defaultStyles.input, ...defaultStyles.mobileInput } : defaultStyles.input}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" style={isMobile ? { ...defaultStyles.button, ...defaultStyles.mobileButton } : defaultStyles.button} aria-label="Search">
          {loading ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
        </button>
      </form>

      {showResults && searchResults.length > 0 && (
        <div style={isMobile ? { ...defaultStyles.resultCard, ...defaultStyles.mobileResultCard } : defaultStyles.resultCard} onWheel={handleWheel}>
          {searchResults.map((result) => {
            const formatted = formatDisplayName(result)
            const active = selectedPlace?.place_id === result.place_id
            return (
              <div
                key={result.place_id}
                style={{
                  ...defaultStyles.resultItem,
                  ...(active ? defaultStyles.selectedItem : {})
                }}
                onClick={() => handleResultClick(result)}
              >
                <div style={{ fontWeight: 600 }}>{formatted.primary}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{formatted.secondary || result.display_name}</div>
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.type && <span style={{ fontSize: '11px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '999px' }}>{result.type}</span>}
                  {result.importance != null && (
                    <span style={{ fontSize: '11px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '999px' }}>
                      {`Relevance: ${Math.round(result.importance * 100)}%`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showResults && searchResults.length === 0 && !loading && searchTerm.length >= 2 && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>No places found for “{searchTerm}”.</p>
        </div>
      )}

      {selectedPlace && placeInfo && (
        <div style={isMobile ? { ...defaultStyles.detailsPanel, ...defaultStyles.mobileDetailsPanel } : defaultStyles.detailsPanel} onWheel={handleWheel}>
          {placeInfo.thumbnail ? (
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '14px' }}>
              <img src={placeInfo.thumbnail} alt={placeInfo.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(15,23,42,0.82))' }} />
              <div style={{ position: 'absolute', left: '16px', bottom: '16px', color: '#fff' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{placeInfo.title}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{formatDisplayName(selectedPlace).secondary}</p>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '18px' }}>{placeInfo.title}</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{formatDisplayName(selectedPlace).secondary}</p>
            </div>
          )}

          <div style={defaultStyles.tabs}>
            <button type="button" style={{ ...defaultStyles.tabButton, ...(activeTab === 'overview' ? defaultStyles.activeTab : {}) }} onClick={() => setActiveTab('overview')}>
              <Info size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Overview
            </button>
            {showImages && (
              <button type="button" style={{ ...defaultStyles.tabButton, ...(activeTab === 'images' ? defaultStyles.activeTab : {}) }} onClick={() => setActiveTab('images')}>
                <Image size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Images
              </button>
            )}
            {showWeather && (
              <button type="button" style={{ ...defaultStyles.tabButton, ...(activeTab === 'weather' ? defaultStyles.activeTab : {}) }} onClick={() => setActiveTab('weather')}>
                <Cloud size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Weather
              </button>
            )}
            <button type="button" style={{ ...defaultStyles.tabButton, ...(activeTab === 'links' ? defaultStyles.activeTab : {}) }} onClick={() => setActiveTab('links')}>
              <Library size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Links
            </button>
          </div>

          {activeTab === 'overview' && (
            <div>
              {loadingInfo ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}><Loader2 size={24} className="spinner" /></div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: '#334155' }} dangerouslySetInnerHTML={{ __html: placeInfo.extract }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '12px', borderRadius: '14px', background: '#f8fafc' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Coordinates</div>
                      <div style={{ fontWeight: 600, marginTop: '6px' }}>{placeInfo.location.lat.toFixed(5)}, {placeInfo.location.lon.toFixed(5)}</div>
                      <button type="button" onClick={copyCoords} style={{ marginTop: '8px', border: 'none', background: '#e2e8f0', color: '#0f172a', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                        {copiedCoords ? <Check size={12} /> : <Copy size={12} />} {copiedCoords ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '14px', background: '#f8fafc' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>OSM</div>
                      <div style={{ marginTop: '6px', fontWeight: 600 }}>{placeInfo.osm_type || 'N/A'}</div>
                      <a href={`https://www.openstreetmap.org/${placeInfo.osm_type}/${placeInfo.osm_id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', marginTop: '8px', color: '#2563eb', textDecoration: 'none', fontSize: '12px' }}>
                        <ExternalLink size={12} style={{ marginRight: '4px' }} /> View on OSM
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div>
              {loadingGallery ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}><Loader2 size={24} className="spinner" /></div>
              ) : imageGallery.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  {imageGallery.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '14px', overflow: 'hidden' }}>
                      <img src={url} alt={`${placeInfo.title} image ${idx + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No images available for this location.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'weather' && (
            <div>
              {loadingWeather ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}><Loader2 size={24} className="spinner" /></div>
              ) : weatherData ? (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {weatherData.daily.time.map((date, idx) => {
                    const code = weatherData.daily.weathercode[idx]
                    const weather = getWeatherDescription(code)
                    return (
                      <div key={date} style={{ padding: '12px', borderRadius: '14px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 600 }}>{idx === 0 ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div>{weather.emoji}</div>
                        </div>
                        <div style={{ fontSize: '13px', marginBottom: '8px' }}>{weather.description}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', fontSize: '12px', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Thermometer size={12} /> {weatherData.daily.temperature_2m_max[idx]}° / {weatherData.daily.temperature_2m_min[idx]}°</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={12} /> {weatherData.daily.precipitation_sum[idx]} {weatherData.daily_units.precipitation_sum}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wind size={12} /> {weatherData.daily.windspeed_10m_max[idx]} {weatherData.daily_units.windspeed_10m_max}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>Weather forecast not available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {placeInfo.url && (
                <a href={placeInfo.url} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', borderRadius: '14px', background: '#f8fafc', textDecoration: 'none', color: '#0f172a' }}>
                  <Library size={18} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Wikipedia Article</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Read more about this place</div>
                  </div>
                </a>
              )}
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(placeInfo.title)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', borderRadius: '14px', background: '#f8fafc', textDecoration: 'none', color: '#0f172a' }}>
                <MapPin size={18} />
                <div>
                  <div style={{ fontWeight: 600 }}>Google Maps</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Search directions and nearby places</div>
                </div>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PlaceSearch
