import { useState, useEffect, useCallback } from 'react'
import {
  SkyRideService,
  type SkyRide,
  type SkyRideHistory,
} from '../../nerve/preview'

export function SkyRideApp() {
  const [activeRide, setActiveRide] = useState<SkyRide | null>(null)
  const [history, setHistory] = useState<SkyRideHistory[]>([])
  const [pickup, setPickup] = useState('Legion Square GPS')
  const [destination, setDestination] = useState('')
  const [tier, setTier] = useState<'Standard' | 'Executive' | 'XL'>('Standard')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    const [res] = await SkyRideService.GetRideStatus.request(undefined)
    if (res) {
      if (res.activeRide) setActiveRide(res.activeRide)
      if (res.history) setHistory(res.history)
    }
  }, [])

  useEffect(() => {
    loadStatus()
    const unsubStatus = SkyRideService.RideStatusChanged.connect((ride) => {
      setActiveRide({ ...ride })
    })
    const unsubUpdated = SkyRideService.RideUpdated.connect((ev) => {
      if (ev.status === 'cancelled') {
        setActiveRide(null)
      }
    })
    return () => {
      unsubStatus()
      unsubUpdated()
    }
  }, [loadStatus])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleRequestRide = async () => {
    if (!destination.trim()) {
      showToast('Please enter a destination')
      return
    }
    const [ok, err, ride] = await SkyRideService.RequestRide.request({
      pickup: pickup.trim(),
      destination: destination.trim(),
      tier,
    })
    if (ok && ride) {
      setActiveRide(ride)
      showToast(`Driver ${ride.driverName} dispatched!`)
    } else if (err) {
      showToast(err)
    }
  }

  const handleCancelRide = async () => {
    const [ok] = await SkyRideService.CancelRide.request(undefined)
    if (ok) {
      setActiveRide(null)
      showToast('Ride request cancelled')
    }
  }

  return (
    <div className="skyride-app-root">
      {/* Header */}
      <header className="skyride-header">
        <div className="skyride-top-row">
          <div className="skyride-branding">
            <span className="skyride-logo-icon">🚕</span>
            <h3>SKYRIDE</h3>
          </div>
          <span className={`skyride-status-tag ${activeRide ? 'active' : 'idle'}`}>
            {activeRide ? 'EN ROUTE' : 'AVAILABLE'}
          </span>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="skyride-toast" role="status">
          <span>📍</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main Content */}
      <main className="skyride-main-scroll">
        {activeRide ? (
          /* Active Ride Tracking Card */
          <div className="skyride-active-container">
            <div className="skyride-live-badge">
              <span className="skyride-pulse-dot" />
              <span>DRIVER EN ROUTE • {activeRide.etaMinutes} MIN</span>
            </div>

            <div className="skyride-driver-card">
              <div className="skyride-driver-top">
                <div className="skyride-driver-avatar">👨‍✈️</div>
                <div className="skyride-driver-info">
                  <h4>{activeRide.driverName}</h4>
                  <div className="skyride-rating">★ {activeRide.driverRating.toFixed(2)}</div>
                </div>
                <div className="skyride-fare-badge">${activeRide.fare}</div>
              </div>

              <div className="skyride-vehicle-box">
                <div className="skyride-veh-model">
                  <span>🚗</span>
                  <strong>{activeRide.vehicleModel}</strong>
                </div>
                <span className="skyride-plate-tag">{activeRide.licensePlate}</span>
              </div>

              <div className="skyride-route-details">
                <div className="skyride-route-node">
                  <span className="skyride-node-dot from" />
                  <div>
                    <label>PICKUP</label>
                    <p>{activeRide.pickup}</p>
                  </div>
                </div>
                <div className="skyride-route-node">
                  <span className="skyride-node-dot to" />
                  <div>
                    <label>DESTINATION</label>
                    <p>{activeRide.destination}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="skyride-cancel-btn"
                onClick={handleCancelRide}
              >
                CANCEL RIDE
              </button>
            </div>
          </div>
        ) : (
          /* Hailing Booking View */
          <div className="skyride-hail-container">
            <div className="skyride-inputs-box">
              <div className="skyride-input-row">
                <span className="skyride-icon-point">🟢</span>
                <input
                  type="text"
                  placeholder="Pickup location..."
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>

              <div className="skyride-input-row">
                <span className="skyride-icon-point">🔴</span>
                <input
                  type="text"
                  placeholder="Where to? (Destination)..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            {/* Ride Tier Selector */}
            <div className="skyride-tiers-group">
              <label className="skyride-section-label">SELECT VEHICLE CLASS</label>
              <div className="skyride-tiers-list">
                <button
                  type="button"
                  className={`skyride-tier-card ${tier === 'Standard' ? 'selected' : ''}`}
                  onClick={() => setTier('Standard')}
                >
                  <div className="skyride-tier-left">
                    <span className="skyride-tier-icon">🚗</span>
                    <div>
                      <strong>Standard</strong>
                      <small>Albany Primo • 3 min</small>
                    </div>
                  </div>
                  <span className="skyride-tier-price">$35</span>
                </button>

                <button
                  type="button"
                  className={`skyride-tier-card ${tier === 'Executive' ? 'selected' : ''}`}
                  onClick={() => setTier('Executive')}
                >
                  <div className="skyride-tier-left">
                    <span className="skyride-tier-icon">🚘</span>
                    <div>
                      <strong>Executive</strong>
                      <small>Enus Windsor • 2 min</small>
                    </div>
                  </div>
                  <span className="skyride-tier-price">$75</span>
                </button>

                <button
                  type="button"
                  className={`skyride-tier-card ${tier === 'XL' ? 'selected' : ''}`}
                  onClick={() => setTier('XL')}
                >
                  <div className="skyride-tier-left">
                    <span className="skyride-tier-icon">🚙</span>
                    <div>
                      <strong>SUV / XL</strong>
                      <small>Baller ST • 4 min</small>
                    </div>
                  </div>
                  <span className="skyride-tier-price">$90</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="skyride-request-btn"
              onClick={handleRequestRide}
            >
              REQUEST SKYRIDE
            </button>

            {/* Recent Trips History */}
            <div className="skyride-history-box">
              <label className="skyride-section-label">RECENT TRIPS</label>
              <div className="skyride-history-list">
                {history.map((h) => (
                  <div key={h.id} className="skyride-history-item">
                    <div>
                      <strong>{h.destination}</strong>
                      <small>{h.date}</small>
                    </div>
                    <span className="skyride-hist-fare">${h.fare}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
