import { useState, useEffect, useCallback } from 'react'
import {
  HouseService,
  MapService,
  type HousingProperty,
} from '../../nerve/preview'

type Props = {
  onOpenMap?: () => void
}

export function HouseApp({ onOpenMap }: Props) {
  const [properties, setProperties] = useState<HousingProperty[]>([])
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    const [list] = await HouseService.GetProperties.request(undefined)
    if (list) setProperties(list)
  }, [])

  useEffect(() => {
    loadProperties()
    const unsub = HouseService.PropertyUpdated.connect((updated) => {
      setProperties((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...updated, keys: [...updated.keys] } : p))
      )
    })
    return () => {
      unsub()
    }
  }, [loadProperties])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleToggleLock = async (p: HousingProperty) => {
    const [ok, isLocked, err] = await HouseService.ToggleLock.request({ propertyId: p.id })
    if (ok) {
      showToast(`${p.label} ${isLocked ? 'Locked 🔒' : 'Unlocked 🔓'}`)
    } else if (err) {
      showToast(err)
    }
  }

  const handleToggleAlarm = async (p: HousingProperty) => {
    const [ok, isArmed, err] = await HouseService.ToggleAlarm.request({ propertyId: p.id })
    if (ok) {
      showToast(`${p.label} Security Alarm ${isArmed ? 'Armed 🚨' : 'Disarmed 🛡️'}`)
    } else if (err) {
      showToast(err)
    }
  }

  const handleSetGps = async (p: HousingProperty) => {
    const [ok] = await MapService.SetWaypoint.request({
      x: p.x,
      y: p.y,
      label: p.label,
    })
    if (ok) {
      showToast(`GPS set to ${p.label}`)
      if (onOpenMap) onOpenMap()
    }
  }

  const handleShareKey = async (propertyId: string) => {
    if (!guestName.trim()) {
      showToast('Enter guest or contact name')
      return
    }
    const [ok, newKey, err] = await HouseService.ShareKey.request({
      propertyId,
      recipientName: guestName.trim(),
    })
    if (ok && newKey) {
      showToast(`Key issued to ${newKey.holderName}!`)
      setGuestName('')
    } else if (err) {
      showToast(err)
    }
  }

  const handleRevokeKey = async (propertyId: string, keyId: string, holderName: string) => {
    const [ok, err] = await HouseService.RevokeKey.request({ propertyId, keyId })
    if (ok) {
      showToast(`Revoked key for ${holderName}`)
    } else if (err) {
      showToast(err)
    }
  }

  const selectedProperty = properties.find((p) => p.id === selectedPropId)

  return (
    <div className="house-app-root">
      {/* Header */}
      <header className="house-header">
        <div className="house-top-row">
          <div className="house-branding">
            <span className="house-logo">🏛️</span>
            <div>
              <h3>Dynasty 8</h3>
              <small>Real Estate & Key Management</small>
            </div>
          </div>
          <span className="house-count-pill">{properties.length} Properties</span>
        </div>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="house-toast" role="status">
          <span>🏛️</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Key Management Modal */}
      {selectedProperty && (
        <div className="house-keys-modal">
          <div className="house-keys-dialog">
            <div className="house-keys-header">
              <div>
                <h4>{selectedProperty.label}</h4>
                <small>Authorized Digital Keyholders</small>
              </div>
              <button
                type="button"
                className="house-close-modal"
                onClick={() => setSelectedPropId(null)}
              >
                ✕
              </button>
            </div>

            {/* Existing Keys */}
            <div className="house-keys-list">
              {selectedProperty.keys.map((k) => (
                <div key={k.keyId} className="house-key-card">
                  <div className="house-key-info">
                    <span className="house-key-icon">🔑</span>
                    <div>
                      <strong>{k.holderName}</strong>
                      <small>Issued {new Date(k.issuedAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                  {k.holderName !== 'Alex Mercer' && (
                    <button
                      type="button"
                      className="house-revoke-btn"
                      onClick={() => handleRevokeKey(selectedProperty.id, k.keyId, k.holderName)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Issue Key Form */}
            <div className="house-issue-key-form">
              <input
                type="text"
                placeholder="Contact name to grant key..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <button
                type="button"
                className="house-grant-btn"
                onClick={() => handleShareKey(selectedProperty.id)}
              >
                + Grant Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Properties Scroll */}
      <main className="house-main-scroll">
        {properties.map((p) => (
          <article key={p.id} className="house-card">
            <div className="house-card-header">
              <div>
                <span className="house-tier-tag">{p.tier}</span>
                <h4 className="house-title">{p.label}</h4>
                <p className="house-address">📍 {p.address}</p>
              </div>
            </div>

            {/* Amenities tags */}
            <div className="house-amenities-row">
              <span className="house-amenity-tag">🚗 {p.garageSlots} Garage</span>
              {p.hasStash && <span className="house-amenity-tag">📦 Safe Stash</span>}
              <span className={`house-amenity-tag ${p.alarmActive ? 'armed' : 'disarmed'}`}>
                {p.alarmActive ? '🚨 Alarm Armed' : '🛡️ Alarm Off'}
              </span>
            </div>

            {/* Remote FOB actions */}
            <div className="house-actions-grid">
              <button
                type="button"
                className={`house-fob-btn ${p.isLocked ? 'locked' : 'unlocked'}`}
                onClick={() => handleToggleLock(p)}
              >
                <span>{p.isLocked ? '🔒' : '🔓'}</span>
                <small>{p.isLocked ? 'LOCKED' : 'UNLOCKED'}</small>
              </button>

              <button
                type="button"
                className={`house-fob-btn ${p.alarmActive ? 'armed' : 'disarmed'}`}
                onClick={() => handleToggleAlarm(p)}
              >
                <span>{p.alarmActive ? '🚨' : '🛡️'}</span>
                <small>{p.alarmActive ? 'ARMED' : 'DISARM'}</small>
              </button>

              <button
                type="button"
                className="house-fob-btn gps"
                onClick={() => handleSetGps(p)}
              >
                <span>📍</span>
                <small>ROUTE GPS</small>
              </button>

              <button
                type="button"
                className="house-fob-btn keys"
                onClick={() => setSelectedPropId(p.id)}
              >
                <span>🔑</span>
                <small>KEYS ({p.keys.length})</small>
              </button>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
