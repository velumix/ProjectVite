import { useState, useEffect, useCallback, useMemo } from 'react'
import { GarageService, MapService, type VehicleItem, type VehicleStatus } from '../../nerve/preview'

const CATEGORY_ICONS: Record<string, string> = {
  sports: '🏎️',
  super: '🏎️',
  sedan: '🚘',
  suv: '🚙',
  motorcycle: '🏍️',
  compact: '🚗',
}

const STATUS_CONFIG: Record<VehicleStatus, { label: string; color: string; bg: string }> = {
  out: { label: 'Out in World', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  stored: { label: 'In Garage', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  impounded: { label: 'Impounded', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
}

export function GarageApp() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [fobNotice, setFobNotice] = useState<string | null>(null)

  const refreshVehicles = useCallback(async () => {
    const [list] = await GarageService.GetVehicles.request(undefined)
    if (list) {
      setVehicles(list)
      if (selectedVehicle) {
        const updated = list.find((v) => v.plate === selectedVehicle.plate)
        if (updated) setSelectedVehicle(updated)
      }
    }
  }, [selectedVehicle])

  useEffect(() => {
    refreshVehicles()
    const unsub = GarageService.VehicleStateChanged.connect((v) => {
      setVehicles((prev) => prev.map((item) => (item.plate === v.plate ? v : item)))
      setSelectedVehicle((curr) => (curr?.plate === v.plate ? v : curr))
    })
    return () => unsub()
  }, [refreshVehicles])

  const showFobNotice = (msg: string) => {
    setFobNotice(msg)
    setTimeout(() => setFobNotice(null), 3000)
  }

  const handleToggleLock = async (veh: VehicleItem) => {
    const [ok, isLocked, err] = await GarageService.ToggleLock.request({ plate: veh.plate })
    if (ok) {
      showFobNotice(`${veh.label} ${isLocked ? 'Locked 🔒' : 'Unlocked 🔓'}`)
    } else if (err) {
      showFobNotice(err)
    }
  }

  const handleToggleEngine = async (veh: VehicleItem) => {
    const [ok, engineOn, err] = await GarageService.ToggleEngine.request({ plate: veh.plate })
    if (ok) {
      showFobNotice(`${veh.label} Engine ${engineOn ? 'Started ⚡' : 'Stopped 🛑'}`)
    } else if (err) {
      showFobNotice(err)
    }
  }

  const handleValet = async (veh: VehicleItem) => {
    const [ok, delivered, err] = await GarageService.RequestValet.request({ plate: veh.plate })
    if (ok && delivered) {
      showFobNotice(`Valet has delivered ${veh.label}!`)
    } else if (err) {
      showFobNotice(err)
    }
  }

  const handleTrackGps = async (veh: VehicleItem) => {
    const [ok, coords, err] = await GarageService.TrackVehicle.request({ plate: veh.plate })
    if (ok && coords) {
      await MapService.SetWaypoint.request({
        x: coords.x,
        y: coords.y,
        label: coords.label,
      })
      showFobNotice(`GPS Route set to ${veh.label}!`)
    } else if (err) {
      showFobNotice(err)
    }
  }

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'out' && v.status === 'out') ||
        (activeFilter === 'stored' && v.status === 'stored') ||
        (activeFilter === 'impounded' && v.status === 'impounded')
      const matchQuery =
        !searchQuery.trim() ||
        v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.garage.toLowerCase().includes(searchQuery.toLowerCase())
      return matchFilter && matchQuery
    })
  }, [vehicles, activeFilter, searchQuery])

  return (
    <div className="garage-app-root">
      {/* Header */}
      <header className="garage-header">
        <div className="garage-header-title-row">
          <h3>My Garage</h3>
          <span className="garage-count-badge">{vehicles.length} Vehicles</span>
        </div>

        {/* Search */}
        <div className="garage-search-wrapper">
          <span className="garage-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by model or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="garage-clear-search" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="garage-filter-pills">
          <button
            type="button"
            className={`garage-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`garage-pill ${activeFilter === 'out' ? 'active' : ''}`}
            onClick={() => setActiveFilter('out')}
          >
            Out in World
          </button>
          <button
            type="button"
            className={`garage-pill ${activeFilter === 'stored' ? 'active' : ''}`}
            onClick={() => setActiveFilter('stored')}
          >
            In Garage
          </button>
          <button
            type="button"
            className={`garage-pill ${activeFilter === 'impounded' ? 'active' : ''}`}
            onClick={() => setActiveFilter('impounded')}
          >
            Impounded
          </button>
        </div>
      </header>

      {/* Floating FOB Notification Banner */}
      {fobNotice && (
        <aside className="garage-fob-notice" role="status">
          <span>🔑</span>
          <small>{fobNotice}</small>
        </aside>
      )}

      {/* Vehicles List */}
      <main className="garage-list">
        {filteredVehicles.length === 0 ? (
          <div className="garage-empty-state">
            <p>No vehicles found matching criteria.</p>
          </div>
        ) : (
          filteredVehicles.map((veh) => {
            const statusStyle = STATUS_CONFIG[veh.status]
            return (
              <article
                key={veh.plate}
                className={`garage-card ${veh.status === 'out' ? 'is-out' : ''}`}
                onClick={() => setSelectedVehicle(veh)}
              >
                <header className="garage-card-top">
                  <span className="garage-card-icon">{CATEGORY_ICONS[veh.category] ?? '🚗'}</span>
                  <div className="garage-card-title-col">
                    <strong className="garage-card-name">{veh.label}</strong>
                    <span className="garage-card-location">{veh.garage}</span>
                  </div>
                  <span
                    className="garage-status-badge"
                    style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
                  >
                    {statusStyle.label}
                  </span>
                </header>

                <div className="garage-card-metrics">
                  <div className="garage-plate-badge">{veh.plate}</div>
                  <div className="garage-metric-item" title="Fuel Level">
                    <span className="garage-metric-icon">⛽</span>
                    <span>{veh.fuel}%</span>
                  </div>
                  <div className="garage-metric-item" title="Engine Condition">
                    <span className="garage-metric-icon">🔧</span>
                    <span>{veh.engineHealth}%</span>
                  </div>
                </div>

                <footer className="garage-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={`garage-card-btn ${veh.isLocked ? 'is-locked' : 'is-unlocked'}`}
                    title={veh.isLocked ? 'Unlock Doors' : 'Lock Doors'}
                    onClick={() => handleToggleLock(veh)}
                  >
                    {veh.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
                  </button>

                  <button
                    type="button"
                    className="garage-card-btn"
                    title="Track on GPS"
                    onClick={() => handleTrackGps(veh)}
                  >
                    📍 GPS Track
                  </button>

                  <button
                    type="button"
                    className="garage-card-btn garage-fob-link-btn"
                    title="Open Remote Key FOB"
                    onClick={() => setSelectedVehicle(veh)}
                  >
                    🔑 FOB
                  </button>
                </footer>
              </article>
            )
          })
        )}
      </main>

      {/* Detailed Vehicle Remote FOB Inspection Sheet */}
      {selectedVehicle && (
        <section className="garage-fob-sheet" aria-label="Vehicle Remote Controls">
          <header className="garage-fob-header">
            <div>
              <h4>{selectedVehicle.label}</h4>
              <span className="garage-fob-plate">{selectedVehicle.plate}</span>
            </div>
            <button
              type="button"
              className="garage-fob-close"
              title="Close Remote FOB"
              onClick={() => setSelectedVehicle(null)}
            >
              ✕
            </button>
          </header>

          <div className="garage-fob-body">
            {/* Condition Bars */}
            <div className="garage-gauges-row">
              <div className="garage-gauge-card">
                <span className="garage-gauge-label">Fuel</span>
                <strong className="garage-gauge-val">{selectedVehicle.fuel}%</strong>
                <div className="garage-gauge-bar">
                  <div
                    className="garage-gauge-fill"
                    style={{
                      width: `${selectedVehicle.fuel}%`,
                      background: selectedVehicle.fuel > 30 ? '#10b981' : '#ef4444',
                    }}
                  />
                </div>
              </div>

              <div className="garage-gauge-card">
                <span className="garage-gauge-label">Engine</span>
                <strong className="garage-gauge-val">{selectedVehicle.engineHealth}%</strong>
                <div className="garage-gauge-bar">
                  <div
                    className="garage-gauge-fill"
                    style={{
                      width: `${selectedVehicle.engineHealth}%`,
                      background: selectedVehicle.engineHealth > 50 ? '#38bdf8' : '#f59e0b',
                    }}
                  />
                </div>
              </div>

              <div className="garage-gauge-card">
                <span className="garage-gauge-label">Body</span>
                <strong className="garage-gauge-val">{selectedVehicle.bodyHealth}%</strong>
                <div className="garage-gauge-bar">
                  <div
                    className="garage-gauge-fill"
                    style={{
                      width: `${selectedVehicle.bodyHealth}%`,
                      background: selectedVehicle.bodyHealth > 50 ? '#a855f7' : '#f59e0b',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Remote Key FOB Controls Pad */}
            <div className="garage-fob-pad">
              <p className="garage-fob-pad-title">Remote Smart Key FOB</p>

              <div className="garage-fob-grid">
                {/* Lock / Unlock button */}
                <button
                  type="button"
                  className={`garage-fob-button ${selectedVehicle.isLocked ? 'is-locked' : 'is-unlocked'}`}
                  onClick={() => handleToggleLock(selectedVehicle)}
                >
                  <span className="garage-fob-btn-icon">{selectedVehicle.isLocked ? '🔒' : '🔓'}</span>
                  <span className="garage-fob-btn-text">
                    {selectedVehicle.isLocked ? 'Unlock Doors' : 'Lock Doors'}
                  </span>
                </button>

                {/* Engine Remote Start */}
                <button
                  type="button"
                  className={`garage-fob-button ${selectedVehicle.engineOn ? 'engine-on' : ''}`}
                  disabled={selectedVehicle.status !== 'out'}
                  onClick={() => handleToggleEngine(selectedVehicle)}
                >
                  <span className="garage-fob-btn-icon">⚡</span>
                  <span className="garage-fob-btn-text">
                    {selectedVehicle.engineOn ? 'Stop Engine' : 'Start Engine'}
                  </span>
                </button>

                {/* GPS Waypoint */}
                <button
                  type="button"
                  className="garage-fob-button"
                  onClick={() => handleTrackGps(selectedVehicle)}
                >
                  <span className="garage-fob-btn-icon">📍</span>
                  <span className="garage-fob-btn-text">GPS Route</span>
                </button>

                {/* Valet Request */}
                <button
                  type="button"
                  className="garage-fob-button"
                  disabled={selectedVehicle.status === 'impounded'}
                  onClick={() => handleValet(selectedVehicle)}
                >
                  <span className="garage-fob-btn-icon">🛎️</span>
                  <span className="garage-fob-btn-text">Call Valet</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
