import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapService, type MapPoi, type MapWaypoint, type PlayerBlip, type PoiCategory } from '../../nerve/preview'

const CATEGORY_COLORS: Record<PoiCategory, string> = {
  hospital: '#ef4444',
  police: '#3b82f6',
  bank: '#10b981',
  mechanic: '#f59e0b',
  garage: '#8b5cf6',
  store: '#ec4899',
  gas: '#f97316',
}

const CATEGORY_ICONS: Record<PoiCategory, string> = {
  hospital: '🏥',
  police: '🚓',
  bank: '🏦',
  mechanic: '🔧',
  garage: '🏎',
  store: '🛒',
  gas: '⛽',
}

// World coordinate bounds for projection: X: [-600, 600], Y: [-1800, 200]
function projectCoords(x: number, y: number, width = 600, height = 800) {
  const minX = -600
  const maxX = 600
  const minY = -1800
  const maxY = 200

  const svgX = ((x - minX) / (maxX - minX)) * width
  const svgY = height - ((y - minY) / (maxY - minY)) * height
  return { svgX, svgY }
}

export function MapApp() {
  const [pois, setPois] = useState<MapPoi[]>([])
  const [playerBlip, setPlayerBlip] = useState<PlayerBlip | null>(null)
  const [activeWaypoint, setActiveWaypoint] = useState<MapWaypoint | null>(null)
  
  // UI states
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPoi, setSelectedPoi] = useState<MapPoi | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showListSheet, setShowListSheet] = useState(false)

  // Fetch initial map data
  const refreshMapData = useCallback(async () => {
    const [worldPois, blips, wp] = await MapService.GetMapData.request(undefined)
    if (worldPois) setPois(worldPois)
    if (blips && blips.length > 0) setPlayerBlip(blips[0])
    setActiveWaypoint(wp ?? null)
  }, [])

  useEffect(() => {
    refreshMapData()
    const unsub = MapService.WaypointChanged.connect((wp) => {
      setActiveWaypoint(wp ?? null)
    })
    return () => unsub()
  }, [refreshMapData])

  // Filtered POIs
  const filteredPois = useMemo(() => {
    return pois.filter((poi) => {
      const matchCat = selectedCategory === 'all' || poi.category === selectedCategory
      const matchQuery = !searchQuery.trim() ||
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.address.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [pois, selectedCategory, searchQuery])

  // Set waypoint
  const handleSetWaypoint = async (poi: MapPoi) => {
    const [ok, wp] = await MapService.SetWaypoint.request({
      x: poi.x,
      y: poi.y,
      label: poi.name,
    })
    if (ok && wp) {
      setActiveWaypoint(wp)
      setSelectedPoi(poi)
    }
  }

  // Clear waypoint
  const handleClearWaypoint = async () => {
    const [ok] = await MapService.ClearWaypoint.request(undefined)
    if (ok) {
      setActiveWaypoint(null)
    }
  }

  // Center on player
  const handleCenterPlayer = () => {
    setPanOffset({ x: 0, y: 0 })
    setZoomLevel(1.2)
  }

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const playerPos = playerBlip ? projectCoords(playerBlip.x, playerBlip.y) : { svgX: 300, svgY: 500 }
  const waypointPos = activeWaypoint ? projectCoords(activeWaypoint.x, activeWaypoint.y) : null

  return (
    <div className="map-app-root">
      {/* Search and Category Header */}
      <header className="map-header">
        <div className="map-search-row">
          <div className="map-search-input-wrapper">
            <span className="map-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search places in Sun City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="map-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            className={`map-list-toggle-btn ${showListSheet ? 'active' : ''}`}
            title="Toggle Locations Directory"
            onClick={() => setShowListSheet(!showListSheet)}
          >
            📋
          </button>
        </div>

        {/* Category Pills */}
        <div className="map-category-pills">
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'hospital' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('hospital')}
          >
            🏥 Hospitals
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'police' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('police')}
          >
            🚓 Police
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'bank' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('bank')}
          >
            🏦 Banks
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'mechanic' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('mechanic')}
          >
            🔧 Repair
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'garage' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('garage')}
          >
            🏎 Autos
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'gas' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('gas')}
          >
            ⛽ Fuel
          </button>
          <button
            type="button"
            className={`map-cat-pill ${selectedCategory === 'store' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('store')}
          >
            🛒 Stores
          </button>
        </div>
      </header>

      {/* Interactive Map Viewport */}
      <div
        className="map-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="map-canvas"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <svg className="map-vector-canvas" viewBox="0 0 600 800" width="600" height="800">
            {/* City Base & Ocean */}
            <defs>
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0c2340" />
                <stop offset="100%" stopColor="#07172b" />
              </linearGradient>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Ocean background */}
            <rect width="600" height="800" fill="url(#oceanGrad)" />

            {/* Mainland mass */}
            <path
              d="M 60 780 C 120 720, 100 600, 80 480 C 60 360, 140 260, 180 160 C 220 80, 380 40, 480 80 C 560 120, 580 280, 560 440 C 540 600, 520 740, 480 780 Z"
              fill="#131e2b"
              stroke="#1e3247"
              strokeWidth="3"
            />

            {/* District zones */}
            <path d="M 120 420 L 480 380 L 460 620 L 140 650 Z" fill="#182535" />
            <path d="M 180 200 L 440 180 L 460 360 L 160 380 Z" fill="#1a293a" />

            {/* Grid overlay */}
            <rect width="600" height="800" fill="url(#gridPattern)" />

            {/* Major Highways & Arterials */}
            {/* Los Santos Del Perro Fwy */}
            <path d="M 80 500 C 200 490, 400 510, 540 480" fill="none" stroke="#2c4563" strokeWidth="12" />
            <path d="M 80 500 C 200 490, 400 510, 540 480" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6 4" />

            {/* Olympic Fwy */}
            <path d="M 140 660 C 280 620, 420 630, 520 680" fill="none" stroke="#2c4563" strokeWidth="10" />
            
            {/* City Streets & Avenues */}
            <path d="M 180 340 L 420 340" fill="none" stroke="#22364c" strokeWidth="6" />
            <path d="M 180 420 L 420 420" fill="none" stroke="#22364c" strokeWidth="6" />
            <path d="M 160 560 L 440 560" fill="none" stroke="#22364c" strokeWidth="6" />
            <path d="M 220 240 L 220 660" fill="none" stroke="#22364c" strokeWidth="6" />
            <path d="M 300 220 L 300 680" fill="none" stroke="#22364c" strokeWidth="8" />
            <path d="M 380 240 L 380 660" fill="none" stroke="#22364c" strokeWidth="6" />

            {/* Landmarks labels */}
            <text x="270" y="290" fill="rgba(255,255,255,0.25)" fontSize="16" fontWeight="700" letterSpacing="3">
              DOWNTOWN
            </text>
            <text x="260" y="590" fill="rgba(255,255,255,0.2)" fontSize="14" fontWeight="700" letterSpacing="2">
              STRAWBERRY
            </text>

            {/* GPS Route Line to Active Waypoint */}
            {waypointPos && (
              <g className="map-gps-route">
                <line
                  x1={playerPos.svgX}
                  y1={playerPos.svgY}
                  x2={waypointPos.svgX}
                  y2={waypointPos.svgY}
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* POI Markers */}
            {filteredPois.map((poi) => {
              const pos = projectCoords(poi.x, poi.y)
              const isSelected = selectedPoi?.id === poi.id
              const isWpTarget = activeWaypoint?.label === poi.name
              const color = CATEGORY_COLORS[poi.category] || '#38bdf8'

              return (
                <g
                  key={poi.id}
                  className={`map-marker ${isSelected ? 'is-selected' : ''}`}
                  transform={`translate(${pos.svgX}, ${pos.svgY})`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPoi(poi)
                  }}
                  cursor="pointer"
                >
                  {/* Ping animation if waypoint target */}
                  {isWpTarget && (
                    <circle r="22" fill={color} opacity="0.3">
                      <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Marker Pin */}
                  <circle
                    r={isSelected ? 16 : 13}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {CATEGORY_ICONS[poi.category]}
                  </text>
                </g>
              )
            })}

            {/* Waypoint Flag (if not matching existing POI directly) */}
            {waypointPos && (
              <g
                className="map-waypoint-beacon"
                transform={`translate(${waypointPos.svgX}, ${waypointPos.svgY})`}
              >
                <circle r="18" fill="#ef4444" opacity="0.4" />
                <circle r="9" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                <text x="0" y="-14" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
                  📍
                </text>
              </g>
            )}

            {/* Player Blip */}
            <g className="map-player-blip" transform={`translate(${playerPos.svgX}, ${playerPos.svgY})`}>
              <circle r="18" fill="#38bdf8" opacity="0.25">
                <animate attributeName="r" values="10;24;10" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
              <circle r="3.5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Zoom & Center Floating Controls */}
        <div className="map-floating-controls">
          <button
            type="button"
            className="map-float-btn"
            title="Zoom In"
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
          >
            +
          </button>
          <button
            type="button"
            className="map-float-btn"
            title="Zoom Out"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.3))}
          >
            −
          </button>
          <button
            type="button"
            className="map-float-btn map-locate-btn"
            title="Locate Player"
            onClick={handleCenterPlayer}
          >
            ◎
          </button>
        </div>
      </div>

      {/* Active GPS Route Banner */}
      {activeWaypoint && (
        <aside className="map-gps-banner" role="status">
          <div className="map-gps-info">
            <span className="map-gps-icon">🧭</span>
            <div>
              <strong className="map-gps-destination">{activeWaypoint.label}</strong>
              <small className="map-gps-distance">{activeWaypoint.distance ?? 450}m away</small>
            </div>
          </div>
          <button
            type="button"
            className="map-gps-clear-btn"
            onClick={handleClearWaypoint}
            title="End Navigation Route"
            aria-label="End Navigation Route"
          >
            Clear Route
          </button>
        </aside>
      )}

      {/* Selected POI Details Modal Sheet */}
      {selectedPoi && !showListSheet && (
        <section className="map-poi-card" aria-label="Location Details">
          <header className="map-poi-header">
            <div className="map-poi-badge" style={{ background: CATEGORY_COLORS[selectedPoi.category] }}>
              {CATEGORY_ICONS[selectedPoi.category]}
            </div>
            <div className="map-poi-title-col">
              <h4>{selectedPoi.name}</h4>
              <p>{selectedPoi.address}</p>
            </div>
            <button
              type="button"
              className="map-poi-close"
              title="Close Details"
              onClick={() => setSelectedPoi(null)}
            >
              ✕
            </button>
          </header>

          <footer className="map-poi-actions">
            <button
              type="button"
              className={`map-poi-route-btn ${activeWaypoint?.label === selectedPoi.name ? 'is-active' : ''}`}
              onClick={() => handleSetWaypoint(selectedPoi)}
            >
              {activeWaypoint?.label === selectedPoi.name ? '✓ Routing Active' : '📍 Set GPS Waypoint'}
            </button>
          </footer>
        </section>
      )}

      {/* Locations Directory Sliding Drawer */}
      {showListSheet && (
        <section className="map-locations-sheet" aria-label="Places Directory">
          <header className="map-sheet-header">
            <h4>Sun City Places ({filteredPois.length})</h4>
            <button type="button" className="map-sheet-close" onClick={() => setShowListSheet(false)}>
              ✕
            </button>
          </header>
          <div className="map-sheet-list">
            {filteredPois.map((poi) => (
              <article
                key={poi.id}
                className="map-sheet-item"
                onClick={() => {
                  setSelectedPoi(poi)
                  setShowListSheet(false)
                  const pos = projectCoords(poi.x, poi.y)
                  setPanOffset({ x: 300 - pos.svgX, y: 400 - pos.svgY })
                }}
              >
                <span className="map-sheet-icon" style={{ color: CATEGORY_COLORS[poi.category] }}>
                  {CATEGORY_ICONS[poi.category]}
                </span>
                <div className="map-sheet-content">
                  <strong>{poi.name}</strong>
                  <small>{poi.address}</small>
                </div>
                <button
                  type="button"
                  className="map-sheet-wp-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetWaypoint(poi)
                    setShowListSheet(false)
                  }}
                  title="Route to location"
                >
                  GPS
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
