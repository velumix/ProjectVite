import { useState, useEffect, useCallback } from 'react'
import {
  EmergencyService,
  MapService,
  type EmergencyAlert,
} from '../../nerve/preview'

type Props = {
  onOpenMap?: () => void
}

type FilterCategory = 'all' | 'critical' | 'police' | 'fire' | 'weather'

export function CityWarnApp({ onOpenMap }: Props) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)

  // Broadcast modal form state
  const [newTitle, setNewTitle] = useState('')
  const [newDept, setNewDept] = useState('San Andreas State Police')
  const [newCategory, setNewCategory] = useState<'police' | 'fire' | 'weather' | 'ems' | 'civic'>('police')
  const [newSeverity, setNewSeverity] = useState<'critical' | 'warning' | 'advisory'>('critical')
  const [newLocation, setNewLocation] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const loadAlerts = useCallback(async () => {
    const [list] = await EmergencyService.GetAlerts.request(undefined)
    if (list) setAlerts(list)
  }, [])

  useEffect(() => {
    loadAlerts()
    const unsubBroadcast = EmergencyService.AlertBroadcasted.connect((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev])
    })
    const unsubResolved = EmergencyService.AlertResolved.connect((resAlert) => {
      setAlerts((prev) => prev.map((a) => (a.id === resAlert.id ? { ...resAlert } : a)))
    })
    return () => {
      unsubBroadcast()
      unsubResolved()
    }
  }, [loadAlerts])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleRouteGps = async (a: EmergencyAlert) => {
    const [ok] = await MapService.SetWaypoint.request({
      x: a.x,
      y: a.y,
      label: `ALERT: ${a.title}`,
    })
    if (ok) {
      showToast(`GPS routed to ${a.location}`)
      if (onOpenMap) onOpenMap()
    }
  }

  const handleResolve = async (alertId: string) => {
    const [ok, err] = await EmergencyService.ResolveAlert.request({ alertId })
    if (ok) {
      showToast('Incident marked as resolved')
    } else if (err) {
      showToast(err)
    }
  }

  const handlePublish = async () => {
    if (!newTitle.trim() || !newLocation.trim()) {
      showToast('Title and Location are required')
      return
    }
    const [ok, created] = await EmergencyService.PublishAlert.request({
      title: newTitle.trim(),
      department: newDept,
      category: newCategory,
      severity: newSeverity,
      location: newLocation.trim(),
      x: 0,
      y: 0,
      description: newDesc.trim(),
    })
    if (ok && created) {
      showToast('Emergency alert broadcasted citywide!')
      setComposeOpen(false)
      setNewTitle('')
      setNewLocation('')
      setNewDesc('')
    }
  }

  const activeAlerts = alerts.filter((a) => a.active)
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'critical') return a.severity === 'critical' && a.active
    if (filter === 'police') return a.category === 'police'
    if (filter === 'fire') return a.category === 'fire'
    if (filter === 'weather') return a.category === 'weather'
    return true
  })

  const categoryIcons: Record<string, string> = {
    police: '🚓',
    fire: '🚒',
    weather: '🌪️',
    ems: '🚑',
    civic: '📢',
  }

  return (
    <div className="citywarn-app-root">
      {/* Header */}
      <header className="citywarn-header">
        <div className="citywarn-top-row">
          <div className="citywarn-branding">
            <span className="citywarn-logo">🚨</span>
            <div>
              <h3>CityWarn</h3>
              <small>Emergency Operations Center</small>
            </div>
          </div>
          <button
            type="button"
            className="citywarn-broadcast-btn"
            onClick={() => setComposeOpen(true)}
            title="Broadcast Alert"
          >
            + Broadcast
          </button>
        </div>

        {/* Status Strip */}
        <div className="citywarn-status-strip">
          <div className="citywarn-live-indicator">
            <span className="citywarn-pulse-dot" />
            <span>{activeAlerts.length} Active Incident{activeAlerts.length === 1 ? '' : 's'}</span>
          </div>
          {criticalCount > 0 && (
            <span className="citywarn-critical-badge">{criticalCount} CRITICAL</span>
          )}
        </div>

        {/* Category Filters */}
        <nav className="citywarn-filter-ribbon">
          {(['all', 'critical', 'police', 'fire', 'weather'] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`citywarn-filter-pill ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All' : cat.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="citywarn-toast" role="status">
          <span>🚨</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Broadcast Compose Modal */}
      {composeOpen && (
        <div className="citywarn-modal-backdrop">
          <div className="citywarn-modal-dialog">
            <div className="citywarn-modal-header">
              <h4>Broadcast Emergency Alert</h4>
              <button
                type="button"
                className="citywarn-close-modal"
                onClick={() => setComposeOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="citywarn-form">
              <input
                type="text"
                placeholder="Alert headline (e.g. Armed Suspect)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <input
                type="text"
                placeholder="Issuing department"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
              />

              <div className="citywarn-form-row">
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                >
                  <option value="critical">Critical (Red)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="advisory">Advisory (Blue)</option>
                </select>

                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                >
                  <option value="police">Police</option>
                  <option value="fire">Fire & Rescue</option>
                  <option value="weather">Weather</option>
                  <option value="ems">EMS</option>
                  <option value="civic">Civic</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Location (e.g. Del Perro Fwy)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />

              <textarea
                placeholder="Incident details, civilian guidance, TAC channels..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />

              <button
                type="button"
                className="citywarn-submit-broadcast-btn"
                onClick={handlePublish}
              >
                🚨 ISSUE BROADCAST NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Alerts List */}
      <main className="citywarn-main-scroll">
        {filteredAlerts.length === 0 ? (
          <div className="citywarn-empty">
            <span>🛡️</span>
            <p>No incidents reported in this category.</p>
          </div>
        ) : (
          filteredAlerts.map((a) => (
            <article
              key={a.id}
              className={`citywarn-alert-card ${a.severity} ${a.active ? 'active' : 'resolved'}`}
            >
              <div className="citywarn-card-top">
                <span className="citywarn-category-icon">
                  {categoryIcons[a.category] || '⚠️'}
                </span>
                <div className="citywarn-card-titles">
                  <div className="citywarn-badge-row">
                    <span className={`citywarn-severity-tag ${a.severity}`}>
                      {a.severity.toUpperCase()}
                    </span>
                    {!a.active && (
                      <span className="citywarn-resolved-tag">RESOLVED</span>
                    )}
                  </div>
                  <h4 className="citywarn-alert-title">{a.title}</h4>
                  <small className="citywarn-department">{a.department}</small>
                </div>
              </div>

              <p className="citywarn-desc">{a.description}</p>

              <div className="citywarn-location-bar">
                <span>📍 {a.location}</span>
                <small>{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
              </div>

              <div className="citywarn-actions-bar">
                <button
                  type="button"
                  className="citywarn-action-btn route"
                  onClick={() => handleRouteGps(a)}
                >
                  📍 ROUTE GPS
                </button>
                {a.active && (
                  <button
                    type="button"
                    className="citywarn-action-btn resolve"
                    onClick={() => handleResolve(a.id)}
                  >
                    ✓ RESOLVE
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  )
}
