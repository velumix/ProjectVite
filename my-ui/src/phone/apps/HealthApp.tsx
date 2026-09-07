import { useState, useEffect, useCallback } from 'react'
import {
  HealthService,
  type HealthStats,
  type MedicalId,
} from '../../nerve/preview'

type TabMode = 'summary' | 'medicalId'

export function HealthApp() {
  const [stats, setStats] = useState<HealthStats | null>(null)
  const [tab, setTab] = useState<TabMode>('summary')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Medical ID Edit form
  const [bloodType, setBloodType] = useState('O+')
  const [allergies, setAllergies] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [organDonor, setOrganDonor] = useState(true)

  const loadStats = useCallback(async () => {
    const [data] = await HealthService.GetStats.request(undefined)
    if (data) {
      setStats(data)
      setBloodType(data.medicalId.bloodType)
      setAllergies(data.medicalId.allergies)
      setContactName(data.medicalId.emergencyContactName)
      setContactPhone(data.medicalId.emergencyContactPhone)
      setOrganDonor(data.medicalId.organDonor)
    }
  }, [])

  useEffect(() => {
    loadStats()
    const unsubStats = HealthService.HealthStatsUpdated.connect((updated) => {
      setStats(updated)
    })
    const unsubSos = HealthService.SosBeaconTriggered.connect((sos) => {
      setToastMessage(`🚨 EMS SOS BEACON BROADCASTED (HR: ${sos.heartRate} BPM)`)
    })
    return () => {
      unsubStats()
      unsubSos()
    }
  }, [loadStats])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleSaveMedicalId = async () => {
    const payload: MedicalId = {
      bloodType,
      allergies,
      emergencyContactName: contactName,
      emergencyContactPhone: contactPhone,
      organDonor,
    }
    const [ok, err, updated] = await HealthService.UpdateMedicalId.request(payload)
    if (ok && updated) {
      showToast('Medical ID profile updated successfully')
    } else if (err) {
      showToast(err)
    }
  }

  const handleTriggerSos = async () => {
    const [ok, err] = await HealthService.SendSosBeacon.request(undefined)
    if (ok) {
      showToast('Emergency SOS Beacon broadcasted to 911 EMS!')
    } else if (err) {
      showToast(err)
    }
  }

  if (!stats) return <div className="health-loading">Loading Health & Vitals...</div>

  return (
    <div className="health-app-root">
      {/* Header */}
      <header className="health-header">
        <div className="health-top-row">
          <div className="health-branding">
            <span className="health-logo">❤️</span>
            <div>
              <h3>Health</h3>
              <small>Biometrics & Emergency ID</small>
            </div>
          </div>
          <button
            type="button"
            className="health-sos-btn"
            onClick={handleTriggerSos}
            title="Dispatch emergency beacon to 911 EMS"
          >
            🚨 SOS 911
          </button>
        </div>

        {/* Tab Ribbon */}
        <nav className="health-tab-ribbon">
          <button
            type="button"
            className={`health-tab-btn ${tab === 'summary' ? 'active' : ''}`}
            onClick={() => setTab('summary')}
          >
            Summary
          </button>
          <button
            type="button"
            className={`health-tab-btn ${tab === 'medicalId' ? 'active' : ''}`}
            onClick={() => setTab('medicalId')}
          >
            Medical ID
          </button>
        </nav>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="health-toast" role="status">
          <span>🚨</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Content */}
      <main className="health-main-scroll">
        {tab === 'summary' && (
          <div className="health-summary-view">
            {/* Primary Vitals Grid */}
            <div className="health-vitals-grid">
              <div className="health-card hr-card">
                <div className="health-card-label">
                  <span>❤️ HEART RATE</span>
                  <small>Normal Sinus</small>
                </div>
                <div className="health-card-val-row">
                  <strong>{stats.heartRate}</strong>
                  <span>BPM</span>
                </div>
                <div className="health-ecg-line" />
              </div>

              <div className="health-card spo2-card">
                <div className="health-card-label">
                  <span>🫁 BLOOD OXYGEN</span>
                  <small>Optimal</small>
                </div>
                <div className="health-card-val-row">
                  <strong>{stats.bloodOxygen}%</strong>
                  <span>SpO2</span>
                </div>
              </div>
            </div>

            {/* Daily Activity Rings */}
            <div className="health-card activity-card">
              <h4 className="health-section-heading">DAILY MOVEMENT & ACTIVITY</h4>
              <div className="health-metrics-row">
                <div className="health-metric-item">
                  <span className="health-metric-label">STEPS</span>
                  <strong>{stats.steps.toLocaleString()}</strong>
                  <small>/ 10,000</small>
                </div>
                <div className="health-metric-item">
                  <span className="health-metric-label">CALORIES</span>
                  <strong className="calories">{stats.calories}</strong>
                  <small>kcal</small>
                </div>
                <div className="health-metric-item">
                  <span className="health-metric-label">EXERCISE</span>
                  <strong className="active-min">{stats.activeMinutes}</strong>
                  <small>min</small>
                </div>
              </div>
            </div>

            {/* Physiological Survival Bars */}
            <div className="health-card survival-card">
              <h4 className="health-section-heading">METABOLIC & SURVIVAL STATUS</h4>

              <div className="health-bar-group">
                <div className="health-bar-label">
                  <span>⚡ Stamina</span>
                  <strong>{stats.stamina}%</strong>
                </div>
                <div className="health-bar-track">
                  <div className="health-bar-fill stamina" style={{ width: `${stats.stamina}%` }} />
                </div>
              </div>

              <div className="health-bar-group">
                <div className="health-bar-label">
                  <span>🍔 Nourishment</span>
                  <strong>{stats.hunger}%</strong>
                </div>
                <div className="health-bar-track">
                  <div className="health-bar-fill hunger" style={{ width: `${stats.hunger}%` }} />
                </div>
              </div>

              <div className="health-bar-group">
                <div className="health-bar-label">
                  <span>💧 Hydration</span>
                  <strong>{stats.hydration}%</strong>
                </div>
                <div className="health-bar-track">
                  <div className="health-bar-fill hydration" style={{ width: `${stats.hydration}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical ID Tab */}
        {tab === 'medicalId' && (
          <div className="health-medical-id-view">
            <div className="health-card medical-id-card">
              <div className="health-card-label">
                <span>🪪 MEDICAL IDENTIFICATION</span>
                <small>First Responders Access</small>
              </div>

              <div className="health-form-group">
                <label>Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="health-select"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="health-form-group">
                <label>Allergies & Reactions</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                />
              </div>

              <div className="health-form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact full name"
                />
              </div>

              <div className="health-form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="555-XXXX"
                />
              </div>

              <div className="health-form-toggle-row">
                <span>Organ Donor</span>
                <input
                  type="checkbox"
                  checked={organDonor}
                  onChange={(e) => setOrganDonor(e.target.checked)}
                />
              </div>

              <button
                type="button"
                className="health-save-btn"
                onClick={handleSaveMedicalId}
              >
                SAVE MEDICAL ID
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
