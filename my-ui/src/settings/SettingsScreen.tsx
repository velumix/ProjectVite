import { useState } from 'react'
import {
  SETTINGS_CATEGORIES,
  DEFAULT_SETTINGS,
  type SettingsState,
} from './settings-data.ts'
import { uiAudio } from '../audio/ui-audio.ts'
import './settings.css'

interface SettingsScreenProps {
  showQuantities: boolean
  setShowQuantities: (val: boolean) => void
  motion: boolean
  setMotion: (val: boolean) => void
  panelOpacity: number
  setPanelOpacity: (val: number) => void
  onBack?: () => void
}

function SettingsIcon({ name, className = '' }: { name: string; className?: string }) {
  switch (name) {
    case 'gear':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'monitor':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      )
    case 'speaker':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )
    case 'gamepad':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="6" x2="10" y1="12" y2="12" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="15" x2="15.01" y1="13" y2="13" />
          <line x1="18" x2="18.01" y1="11" y2="11" />
          <rect width="20" height="12" x="2" y="6" rx="2" />
        </svg>
      )
    case 'layout':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )
    case 'accessibility':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="4" r="1" />
          <path d="m18 19 1-7-6 1" />
          <path d="m5 8 3-3 5.5 3-2.36 3.5" />
          <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
          <path d="M13.76 17.5a5 5 0 0 0-1.76-6.5" />
        </svg>
      )
    case 'keyboard':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M6 12h.001M10 12h.001M14 12h.001M18 12h.001M7 16h10" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      )
    case 'refresh':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      )
    case 'speedometer':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    case 'wand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" />
          <path d="m5 2 5 5" />
          <path d="M2 5l5 5" />
        </svg>
      )
    case 'circle2':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8" cy="12" r="6" />
          <circle cx="16" cy="12" r="6" />
        </svg>
      )
    case 'circleHalf':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 0 0 20Z" fill="currentColor" />
        </svg>
      )
    case 'perspective':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m2 4 10 16L22 4" />
          <path d="M6 10h12" />
        </svg>
      )
    case 'music':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    case 'wave':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4" />
        </svg>
      )
    case 'mic':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      )
    case 'screenExpand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="12" x="3" y="6" rx="2" />
          <path d="m9 10-2 2 2 2M15 10l2 2-2 2" />
        </svg>
      )
    case 'map':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" x2="9" y1="3" y2="18" />
          <line x1="15" x2="15" y1="6" y2="21" />
        </svg>
      )
    case 'crosshair':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" x2="18" y1="12" y2="12" />
          <line x1="6" x2="2" y1="12" y2="12" />
          <line x1="12" x2="12" y1="6" y2="2" />
          <line x1="12" x2="12" y1="22" y2="18" />
        </svg>
      )
    case 'palette':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
        </svg>
      )
    case 'hand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      )
    case 'runner':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="17" cy="4" r="2" />
          <path d="m15 8-4.5 2.5-3-2.5-3.5 3" />
          <path d="M10.5 10.5 13 15l-3 4-4-1" />
          <path d="m13 15 4-1.5 3 3.5" />
        </svg>
      )
    case 'globe':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    case 'bulb':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    case 'arrowLeft':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      )
    case 'chevronRight':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )
    case 'wifi':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" x2="12.01" y1="20" y2="20" />
        </svg>
      )
    case 'chip':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="14" height="14" x="5" y="5" rx="2" />
          <rect width="6" height="6" x="9" y="9" rx="1" />
          <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
        </svg>
      )
    case 'cpu':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="16" height="16" x="4" y="4" rx="2" />
          <rect width="8" height="8" x="8" y="8" rx="1" />
        </svg>
      )
    case 'ram':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 15h20M2 9h20M6 15v3M10 15v3M14 15v3M18 15v3M6 6v3M10 6v3M14 6v3M18 6v3" />
        </svg>
      )
    default:
      return null
  }
}

export function SettingsScreen({
  showQuantities,
  setShowQuantities,
  motion,
  setMotion,
  panelOpacity,
  setPanelOpacity,
  onBack,
}: SettingsScreenProps) {
  const [activeCat, setActiveCat] = useState('graphics')
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [appliedToast, setAppliedToast] = useState(false)

  const handleToggle = (key: keyof SettingsState) => {
    uiAudio.playCheck()
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSelectChange = (key: keyof SettingsState, val: string) => {
    uiAudio.playClick()
    setSettings((prev) => ({
      ...prev,
      [key]: val,
    }))
  }

  const handleSliderChange = (key: keyof SettingsState, val: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: val,
    }))
  }

  const handleResetDefaults = () => {
    uiAudio.playTick()
    setSettings(DEFAULT_SETTINGS)
    setShowQuantities(true)
    setMotion(true)
    setPanelOpacity(100)
    setAppliedToast(true)
    setTimeout(() => setAppliedToast(false), 2400)
  }

  const handleApply = () => {
    uiAudio.playReward()
    setAppliedToast(true)
    setTimeout(() => setAppliedToast(false), 2400)
  }

  const qualityLabels = ['Low', 'Medium', 'High', 'Ultra']

  return (
    <div className="settings-screen" role="region" aria-label="Game Settings">
      {/* =========================================================================
          LEFT SIDEBAR: Categories & Lore Slogan Card
          ========================================================================= */}
      <aside className="settings-sidebar" aria-label="Settings categories">
        <div className="settings-cat-list">
          {SETTINGS_CATEGORIES.map((cat) => {
            const isActive = activeCat === cat.id
            return (
              <button
                type="button"
                key={cat.id}
                className={`settings-cat-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  uiAudio.playClick()
                  setActiveCat(cat.id)
                }}
                onMouseEnter={() => uiAudio.playHover()}
              >
                <div className="settings-cat-icon">
                  <SettingsIcon name={cat.icon} />
                </div>
                <div className="settings-cat-text">
                  <strong className="settings-cat-title">{cat.name}</strong>
                  <span className="settings-cat-sub">{cat.subtitle}</span>
                </div>
                <div className="settings-cat-chevron">
                  <SettingsIcon name="chevronRight" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom Slogan Card with Skyline Icon (No Los Santos) */}
        <div className="settings-slogan-card">
          <div className="settings-skyline-icon">
            <svg viewBox="0 0 100 40" fill="currentColor">
              <rect x="10" y="18" width="8" height="22" rx="1" />
              <rect x="22" y="12" width="10" height="28" rx="1" />
              <rect x="36" y="4" width="12" height="36" rx="1" />
              <rect x="52" y="8" width="10" height="32" rx="1" />
              <rect x="66" y="16" width="14" height="24" rx="1" />
              <rect x="84" y="22" width="8" height="18" rx="1" />
            </svg>
          </div>
          <strong className="settings-brand-title">SUN CITY</strong>
          <span className="settings-brand-sub">EXPLORE. WORK. BUILD.</span>
          <div className="settings-slogan-divider" />
          <p className="settings-slogan-motto">
            PLAY TOGETHER<br />
            A BRIGHTER TOMORROW<br />
            IN SUN CITY.
          </p>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (Columns 1, 2, 3 + Bottom Action Bar)
          ========================================================================= */}
      <div className="settings-main-container">
        <div className="settings-grid-layout">
          {/* ---------------- Column 1: Display & Graphics Quality ---------------- */}
          <div className="settings-col">
            {/* Card 1: Display */}
            <section className="settings-card" aria-label="Display Settings">
              <div className="settings-card-header">
                <h2 className="settings-card-title">DISPLAY</h2>
                <span className="settings-card-sub">Configure your display settings for the best experience.</span>
              </div>

              <div className="settings-rows-list">
                {/* Display Mode */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="monitor" className="settings-row-icon" />
                    <span>Display Mode</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.displayMode}
                    onChange={(e) => handleSelectChange('displayMode', e.target.value)}
                    aria-label="Display Mode"
                  >
                    <option value="Fullscreen">Fullscreen</option>
                    <option value="Borderless">Borderless Windowed</option>
                    <option value="Windowed">Windowed</option>
                  </select>
                </div>

                {/* Resolution */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="screenExpand" className="settings-row-icon" />
                    <span>Resolution</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.resolution}
                    onChange={(e) => handleSelectChange('resolution', e.target.value)}
                    aria-label="Screen Resolution"
                  >
                    <option value="1920 x 1080 (16:9)">1920 x 1080 (16:9)</option>
                    <option value="2560 x 1440 (16:9)">2560 x 1440 (16:9)</option>
                    <option value="3840 x 2160 (16:9)">3840 x 2160 (16:9)</option>
                    <option value="1280 x 720 (16:9)">1280 x 720 (16:9)</option>
                  </select>
                </div>

                {/* VSync */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="refresh" className="settings-row-icon" />
                    <span>VSync</span>
                  </div>
                  <div className="settings-switch-wrap">
                    <span className="settings-switch-text">{settings.vsync ? 'On' : 'Off'}</span>
                    <label className="settings-toggle-switch">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label="VSync"
                        checked={settings.vsync}
                        onChange={() => handleToggle('vsync')}
                      />
                      <span className="settings-switch-slider" />
                    </label>
                  </div>
                </div>

                {/* FPS Limit */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="speedometer" className="settings-row-icon" />
                    <span>FPS Limit</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.fpsLimit}
                    onChange={(e) => handleSelectChange('fpsLimit', e.target.value)}
                    aria-label="FPS Limit"
                  >
                    <option value="60">60</option>
                    <option value="120">120</option>
                    <option value="144">144</option>
                    <option value="240">240</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Card 2: Graphics Quality */}
            <section className="settings-card" aria-label="Graphics Quality Settings">
              <div className="settings-card-header">
                <h2 className="settings-card-title">GRAPHICS QUALITY</h2>
                <span className="settings-card-sub">Adjust visual quality and performance.</span>
              </div>

              <div className="settings-rows-list">
                {/* Graphics Quality Slider */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="star" className="settings-row-icon" />
                    <span>Graphics Quality</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={1}
                      value={settings.graphicsQuality}
                      onChange={(e) => handleSliderChange('graphicsQuality', Number(e.target.value))}
                      aria-label="Graphics Quality Preset"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">
                      {qualityLabels[settings.graphicsQuality] ?? 'High'}
                    </span>
                  </div>
                </div>

                {/* Shadow Quality */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="sun" className="settings-row-icon" />
                    <span>Shadow Quality</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.shadowQuality}
                    onChange={(e) => handleSelectChange('shadowQuality', e.target.value)}
                    aria-label="Shadow Quality"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Ultra">Ultra</option>
                  </select>
                </div>

                {/* Texture Quality */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="layers" className="settings-row-icon" />
                    <span>Texture Quality</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.textureQuality}
                    onChange={(e) => handleSelectChange('textureQuality', e.target.value)}
                    aria-label="Texture Quality"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Ultra">Ultra</option>
                  </select>
                </div>

                {/* Post Processing */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="wand" className="settings-row-icon" />
                    <span>Post Processing</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Post Processing"
                      checked={settings.postProcessing}
                      onChange={() => handleToggle('postProcessing')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Motion Blur */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="circle2" className="settings-row-icon" />
                    <span>Motion Blur</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Motion Blur"
                      checked={settings.motionBlur}
                      onChange={() => handleToggle('motionBlur')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Ambient Occlusion */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="circleHalf" className="settings-row-icon" />
                    <span>Ambient Occlusion</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Ambient Occlusion"
                      checked={settings.ambientOcclusion}
                      onChange={() => handleToggle('ambientOcclusion')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* FOV */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="perspective" className="settings-row-icon" />
                    <span>Field of View (FOV)</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={60}
                      max={110}
                      value={settings.fov}
                      onChange={(e) => handleSliderChange('fov', Number(e.target.value))}
                      aria-label="Field of View"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">{settings.fov}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ---------------- Column 2: Audio & Gameplay & Interface ---------------- */}
          <div className="settings-col">
            {/* Card 1: Audio */}
            <section className="settings-card" aria-label="Audio Settings">
              <div className="settings-card-header">
                <h2 className="settings-card-title">AUDIO</h2>
                <span className="settings-card-sub">Adjust volume levels and audio preferences.</span>
              </div>

              <div className="settings-rows-list">
                {/* Master Volume */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="speaker" className="settings-row-icon" />
                    <span>Master Volume</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.masterVolume}
                      onChange={(e) => handleSliderChange('masterVolume', Number(e.target.value))}
                      aria-label="Master Volume"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">{settings.masterVolume}%</span>
                  </div>
                </div>

                {/* Music Volume */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="music" className="settings-row-icon" />
                    <span>Music Volume</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.musicVolume}
                      onChange={(e) => handleSliderChange('musicVolume', Number(e.target.value))}
                      aria-label="Music Volume"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">{settings.musicVolume}%</span>
                  </div>
                </div>

                {/* SFX Volume */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="wave" className="settings-row-icon" />
                    <span>SFX Volume</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.sfxVolume}
                      onChange={(e) => handleSliderChange('sfxVolume', Number(e.target.value))}
                      aria-label="SFX Volume"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">{settings.sfxVolume}%</span>
                  </div>
                </div>

                {/* Voice Chat */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="mic" className="settings-row-icon" />
                    <span>Voice Chat</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Voice Chat"
                      checked={settings.voiceChat}
                      onChange={() => handleToggle('voiceChat')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>
              </div>
            </section>

            {/* Card 2: Gameplay & Interface */}
            <section className="settings-card" aria-label="Gameplay & Interface Settings">
              <div className="settings-card-header">
                <h2 className="settings-card-title">GAMEPLAY &amp; INTERFACE</h2>
                <span className="settings-card-sub">Customize your gameplay experience.</span>
              </div>

              <div className="settings-rows-list">
                {/* UI Scale */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="screenExpand" className="settings-row-icon" />
                    <span>UI Scale</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={75}
                      max={125}
                      value={settings.uiScale}
                      onChange={(e) => handleSliderChange('uiScale', Number(e.target.value))}
                      aria-label="UI Scale"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">{settings.uiScale}%</span>
                  </div>
                </div>

                {/* Show Minimap */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="map" className="settings-row-icon" />
                    <span>Show Minimap</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Show Minimap"
                      checked={settings.showMinimap}
                      onChange={() => handleToggle('showMinimap')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Show Damage Numbers */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="crosshair" className="settings-row-icon" />
                    <span>Show Damage Numbers</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Show Damage Numbers"
                      checked={settings.showDamageNumbers}
                      onChange={() => handleToggle('showDamageNumbers')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Colorblind Mode */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="palette" className="settings-row-icon" />
                    <span>Colorblind Mode</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.colorblindMode}
                    onChange={(e) => handleSelectChange('colorblindMode', e.target.value)}
                    aria-label="Colorblind Mode"
                  >
                    <option value="Off">Off</option>
                    <option value="Protanopia">Protanopia</option>
                    <option value="Deuteranopia">Deuteranopia</option>
                    <option value="Tritanopia">Tritanopia</option>
                  </select>
                </div>

                {/* Interaction Prompts */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="hand" className="settings-row-icon" />
                    <span>Interaction Prompts</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Interaction Prompts"
                      checked={settings.interactionPrompts}
                      onChange={() => handleToggle('interactionPrompts')}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Sprint Mode */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="runner" className="settings-row-icon" />
                    <span>Sprint Mode</span>
                  </div>
                  <div className="settings-pill-segmented" role="radiogroup" aria-label="Sprint Mode">
                    <button
                      type="button"
                      className={`settings-pill-btn ${settings.sprintMode === 'Hold' ? 'is-active' : ''}`}
                      onClick={() => {
                        uiAudio.playClick()
                        setSettings((p) => ({ ...p, sprintMode: 'Hold' }))
                      }}
                      role="radio"
                      aria-checked={settings.sprintMode === 'Hold'}
                    >
                      Hold
                    </button>
                    <button
                      type="button"
                      className={`settings-pill-btn ${settings.sprintMode === 'Toggle' ? 'is-active' : ''}`}
                      onClick={() => {
                        uiAudio.playClick()
                        setSettings((p) => ({ ...p, sprintMode: 'Toggle' }))
                      }}
                      role="radio"
                      aria-checked={settings.sprintMode === 'Toggle'}
                    >
                      Toggle
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="globe" className="settings-row-icon" />
                    <span>Language</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.language}
                    onChange={(e) => handleSelectChange('language', e.target.value)}
                    aria-label="Language"
                  >
                    <option value="English">English</option>
                    <option value="Español">Español</option>
                    <option value="Français">Français</option>
                    <option value="Deutsch">Deutsch</option>
                    <option value="Português">Português</option>
                  </select>
                </div>

                {/* Functional Item Quantities Switch (Required by automated tests & inventory) */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="layers" className="settings-row-icon" />
                    <span>Item quantities</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Item quantities"
                      checked={showQuantities}
                      onChange={(e) => {
                        uiAudio.playCheck()
                        setShowQuantities(e.target.checked)
                      }}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Functional Interface Motion Switch */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="wand" className="settings-row-icon" />
                    <span>Interface motion</span>
                  </div>
                  <label className="settings-toggle-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-label="Interface motion"
                      checked={motion}
                      onChange={(e) => {
                        uiAudio.playCheck()
                        setMotion(e.target.checked)
                      }}
                    />
                    <span className="settings-switch-slider" />
                  </label>
                </div>

                {/* Functional Panel Opacity */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <SettingsIcon name="circleHalf" className="settings-row-icon" />
                    <span>Panel opacity</span>
                  </div>
                  <div className="settings-slider-row">
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={panelOpacity}
                      onChange={(e) => setPanelOpacity(Number(e.target.value))}
                      aria-label="Panel opacity"
                      className="settings-range"
                    />
                    <span className="settings-slider-val-tag">{panelOpacity}%</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ---------------- Column 3: System Info & Tips ---------------- */}
          <div className="settings-col settings-col-right">
            {/* Card 1: System Info */}
            <section className="settings-card settings-sys-card" aria-label="System Information">
              <div className="settings-card-header">
                <h2 className="settings-card-title">SYSTEM INFO</h2>
                <span className="settings-card-sub">Your current setup and performance.</span>
              </div>

              <div className="settings-sys-list">
                <div className="settings-sys-row">
                  <div className="settings-sys-label">
                    <SettingsIcon name="monitor" className="settings-sys-icon" />
                    <span>Preset</span>
                  </div>
                  <strong className="settings-sys-val is-cyan">High</strong>
                </div>

                <div className="settings-sys-row">
                  <div className="settings-sys-label">
                    <SettingsIcon name="speedometer" className="settings-sys-icon" />
                    <span>FPS Target</span>
                  </div>
                  <strong className="settings-sys-val is-cyan">144</strong>
                </div>

                <div className="settings-sys-row">
                  <div className="settings-sys-label">
                    <SettingsIcon name="wifi" className="settings-sys-icon" />
                    <span>Ping</span>
                  </div>
                  <strong className="settings-sys-val is-green">42 ms</strong>
                </div>

                <div className="settings-sys-row">
                  <div className="settings-sys-label">
                    <SettingsIcon name="chip" className="settings-sys-icon" />
                    <span>GPU</span>
                  </div>
                  <span className="settings-sys-val is-white">NVIDIA RTX 3060</span>
                </div>

                <div className="settings-sys-row">
                  <div className="settings-sys-label">
                    <SettingsIcon name="cpu" className="settings-sys-icon" />
                    <span>CPU</span>
                  </div>
                  <span className="settings-sys-val is-white">AMD Ryzen 5 5600X</span>
                </div>

                <div className="settings-sys-row">
                  <div className="settings-sys-label">
                    <SettingsIcon name="ram" className="settings-sys-icon" />
                    <span>RAM</span>
                  </div>
                  <span className="settings-sys-val is-white">16 GB</span>
                </div>
              </div>
            </section>

            {/* Card 2: Tips */}
            <div className="settings-card settings-tips-card">
              <div className="settings-tips-top">
                <SettingsIcon name="bulb" className="settings-tips-icon" />
                <strong>TIPS</strong>
              </div>
              <p className="settings-tips-body">
                Lowering shadows and post processing can significantly improve performance, especially in busy areas of Sun City.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM ACTION BAR: Reset to Default, Apply, Back
            ========================================================================= */}
        <div className="settings-footer-actions">
          {appliedToast && (
            <div className="settings-toast-msg" role="status">
              <SettingsIcon name="check" />
              <span>Settings successfully updated</span>
            </div>
          )}

          <div className="settings-footer-buttons">
            <button
              type="button"
              className="settings-action-btn btn-reset"
              onClick={handleResetDefaults}
            >
              <SettingsIcon name="refresh" />
              <span>Reset to Default</span>
            </button>

            <button
              type="button"
              className="settings-action-btn btn-apply"
              onClick={handleApply}
            >
              <SettingsIcon name="check" />
              <span>Apply</span>
            </button>

            <button
              type="button"
              className="settings-action-btn btn-back"
              onClick={() => {
                uiAudio.playClick()
                onBack?.()
              }}
            >
              <SettingsIcon name="arrowLeft" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
