import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  SETTINGS_CATEGORIES,
  INITIAL_SETTINGS_STATE,
  normalizeSettings,
  type StreamlinedSettingsState,
} from './settings-data.ts'
import { uiAudio } from '../audio/ui-audio.ts'
import { nervePreview, type PreviewSettingsService } from '../nerve/preview.ts'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'
import './settings.css'

interface SettingsScreenProps {
  showQuantities?: boolean
  setShowQuantities?: (val: boolean) => void
  motion?: boolean
  setMotion?: (val: boolean) => void
  panelOpacity?: number
  setPanelOpacity?: (val: number) => void
  nerve?: NervePreviewAdapter
  onBack?: () => void
  onClose?: () => void
}

export function SettingsScreen({
  showQuantities = true,
  setShowQuantities,
  motion = true,
  setMotion,
  panelOpacity = 100,
  setPanelOpacity,
  nerve,
}: SettingsScreenProps) {
  const [activeCategory, setActiveCategory] = useState('general')
  const [saveState, setSaveState] = useState<'loading' | 'saved' | 'saving' | 'error'>('loading')
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const lastSavedSettings = useRef<string | null>(null)
  const [settings, setSettings] = useState<StreamlinedSettingsState>({
    ...INITIAL_SETTINGS_STATE,
    showQuantities,
    motion,
    panelOpacity,
  })

  const settingsService = (nerve ?? nervePreview).GetService<PreviewSettingsService>('SettingsService')

  const applyLoadedSettings = useCallback((next: StreamlinedSettingsState) => {
    setSettings(next)
    setShowQuantities?.(next.showQuantities)
    setMotion?.(next.motion)
    setPanelOpacity?.(next.panelOpacity)
  }, [setMotion, setPanelOpacity, setShowQuantities])

  useEffect(() => {
    let mounted = true
    const connection = settingsService.SettingsChanged.connect((next) => {
      if (!mounted) return
      const normalized = normalizeSettings(next)
      lastSavedSettings.current = JSON.stringify(normalized)
      applyLoadedSettings(normalized)
      setSaveState('saved')
    })

    void settingsService.GetSettings.request(undefined)
      .then(([stored]) => {
        if (!mounted) return
        const normalized = normalizeSettings(stored)
        lastSavedSettings.current = JSON.stringify(normalized)
        applyLoadedSettings(normalized)
        setSaveState('saved')
      })
      .catch(() => {
        if (mounted) setSaveState('error')
      })

    return () => {
      mounted = false
      connection()
    }
  }, [applyLoadedSettings, settingsService])

  useEffect(() => {
    const serialized = JSON.stringify(settings)
    if (saveState === 'loading' || serialized === lastSavedSettings.current) return
    setSaveState('saving')
    const timeout = window.setTimeout(() => {
      void settingsService.SaveSettings.request(settings)
        .then(([success]) => {
          if (success) {
            lastSavedSettings.current = serialized
            setSaveState('saved')
          } else {
            setSaveState('error')
          }
        })
        .catch(() => setSaveState('error'))
    }, 180)
    return () => window.clearTimeout(timeout)
  }, [settings, saveState, settingsService])

  const updateSetting = <K extends keyof StreamlinedSettingsState>(
    key: K,
    val: StreamlinedSettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: val }))
    setSaveState('saving')
    if (key === 'showQuantities' && setShowQuantities) {
      setShowQuantities(val as boolean)
    }
    if (key === 'motion' && setMotion) {
      setMotion(val as boolean)
    }
    if (key === 'panelOpacity' && setPanelOpacity) {
      setPanelOpacity(val as number)
    }
  }

  const handleCategoryClick = (catId: string) => {
    uiAudio.playTick()
    setActiveCategory(catId)
    const target = sectionRefs.current[catId]
    const content = contentRef.current
    if (target && content) {
      const top = target.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop - 8
      content.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const resetSettings = () => {
    uiAudio.playClick()
    applyLoadedSettings({ ...INITIAL_SETTINGS_STATE })
    setSaveState('saving')
  }

  const settingsStatus = {
    loading: 'LOADING SETTINGS…',
    saved: 'SETTINGS SAVED.',
    saving: 'SAVING SETTINGS…',
    error: 'SETTINGS SAVE FAILED.',
  }[saveState]

  const colorblindModes = ['Off', 'Deuteranopia', 'Protanopia', 'Tritanopia'] as const

  return (
    <div className="settings-v2-container">
      {/* Main Two-Column Layout */}
      <div className="settings-v2-main">
        {/* Left Navigation Sidebar */}
        <nav className="settings-v2-sidebar" aria-label="Settings Categories">
          {SETTINGS_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`settings-v2-nav-item${isActive ? ' is-active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                aria-pressed={isActive}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="settings-v2-nav-icon">
                  <CategoryIcon name={cat.icon} />
                </div>
                <div className="settings-v2-nav-text">
                  <span className="settings-v2-nav-label">{cat.name}</span>
                  <span className="settings-v2-nav-sub">{cat.subtitle}</span>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Right Scrollable Content Area */}
        <div ref={contentRef} className="settings-v2-content">
          {/* ================= SECTION 1: GENERAL ================= */}
          <section ref={node => { sectionRefs.current.general = node }} data-settings-category="general" className="settings-v2-card" aria-label="General Settings">
            <div className="settings-v2-card-header">
              <h2 className="settings-v2-card-title">GENERAL</h2>
              <p className="settings-v2-card-sub">Basic preferences for your experience.</p>
            </div>

            <div className="settings-v2-rows">
              {/* Language */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Language</span>
                    <span className="settings-v2-row-desc">Select your preferred language.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <div className="settings-v2-select-wrapper">
                    <select
                      aria-label="Language"
                      value={settings.language}
                      onChange={e => {
                        uiAudio.playClick()
                        updateSetting('language', e.target.value)
                      }}
                      className="settings-v2-select"
                    >
                      <option value="English">English</option>
                      <option value="Español">Español</option>
                      <option value="Français">Français</option>
                      <option value="Deutsch">Deutsch</option>
                      <option value="Português">Português</option>
                    </select>
                    <div className="settings-v2-select-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* UI Scale */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">UI Scale</span>
                    <span className="settings-v2-row-desc">Adjust the size of in-game UI elements.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="UI Scale"
                    min={0.75}
                    max={1.25}
                    step={0.05}
                    value={settings.uiScale}
                    onChange={v => updateSetting('uiScale', v)}
                  />
                </div>
              </div>

              {/* Show Tooltips */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Show Tooltips</span>
                    <span className="settings-v2-row-desc">Display helpful tips around the game.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <ToggleSwitch
                    label="Show Tooltips"
                    checked={settings.showTooltips}
                    onChange={v => updateSetting('showTooltips', v)}
                  />
                </div>
              </div>

              {/* Streamer Mode */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 10s3-3 5-3 5 3 5 3 3-3 5-3 5 3 5 3-3 7-10 7-10-7-10-7z" />
                      <circle cx="8" cy="10" r="1" />
                      <circle cx="16" cy="10" r="1" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Streamer Mode</span>
                    <span className="settings-v2-row-desc">Hides your username and sensitive information.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <ToggleSwitch
                    label="Streamer Mode"
                    checked={settings.streamerMode}
                    onChange={v => updateSetting('streamerMode', v)}
                  />
                </div>
              </div>

              {/* Item quantities */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Item quantities</span>
                    <span className="settings-v2-row-desc">Show stack counts in your inventory.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <ToggleSwitch
                    label="Item quantities"
                    checked={settings.showQuantities}
                    onChange={v => updateSetting('showQuantities', v)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 2: GRAPHICS ================= */}
          <section ref={node => { sectionRefs.current.graphics = node }} data-settings-category="graphics" className="settings-v2-card" aria-label="Graphics Settings">
            <div className="settings-v2-card-header">
              <h2 className="settings-v2-card-title">GRAPHICS</h2>
              <p className="settings-v2-card-sub">Adjust visual quality and performance settings.</p>
            </div>

            <div className="settings-v2-rows">
              {/* Performance Preset */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Performance Preset</span>
                    <span className="settings-v2-row-desc">Choose the overall visual quality.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <div className="settings-v2-preset-group" role="radiogroup" aria-label="Performance Preset">
                    {(['Quality', 'Balanced', 'Performance'] as const).map(preset => {
                      const isSel = settings.performancePreset === preset
                      return (
                        <button
                          key={preset}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          className={`settings-v2-preset-pill${isSel ? ' is-active' : ''}`}
                          onClick={() => {
                            uiAudio.playClick()
                            updateSetting('performancePreset', preset)
                          }}
                        >
                          {preset}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Disable Post Processing */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Disable Post Processing</span>
                    <span className="settings-v2-row-desc">Disables depth of field, motion blur, and extra effects.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <ToggleSwitch
                    label="Disable Post Processing"
                    checked={settings.disablePostProcessing}
                    onChange={v => updateSetting('disablePostProcessing', v)}
                  />
                </div>
              </div>

              {/* Reduce Effects */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="21" x2="4" y2="14" />
                      <line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" />
                      <line x1="20" y1="12" x2="20" y2="3" />
                      <line x1="1" y1="14" x2="7" y2="14" />
                      <line x1="9" y1="8" x2="15" y2="8" />
                      <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Reduce Effects</span>
                    <span className="settings-v2-row-desc">Reduces particles, weather effects, and ambient details.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <ToggleSwitch
                    label="Reduce Effects"
                    checked={settings.reduceEffects}
                    onChange={v => updateSetting('reduceEffects', v)}
                  />
                </div>
              </div>

              {/* Lower Reflection Detail */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Lower Reflection Detail</span>
                    <span className="settings-v2-row-desc">Improves performance by reducing reflection quality.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <ToggleSwitch
                    label="Lower Reflection Detail"
                    checked={settings.lowerReflectionDetail}
                    onChange={v => updateSetting('lowerReflectionDetail', v)}
                  />
                </div>
              </div>

              {/* Shadow Detail */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Shadow Detail</span>
                    <span className="settings-v2-row-desc">Adjust the quality of shadows.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="Shadow Detail"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={settings.shadowDetail}
                    onChange={v => updateSetting('shadowDetail', v)}
                  />
                </div>
              </div>

              {/* View Distance */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">View Distance</span>
                    <span className="settings-v2-row-desc">Adjust how far you can see world objects.</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="View Distance"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={settings.viewDistance}
                    onChange={v => updateSetting('viewDistance', v)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 3: AUDIO ================= */}
          <section ref={node => { sectionRefs.current.audio = node }} data-settings-category="audio" className="settings-v2-card" aria-label="Audio Settings">
            <div className="settings-v2-card-header">
              <h2 className="settings-v2-card-title">AUDIO</h2>
              <p className="settings-v2-card-sub">Control in-game audio levels.</p>
            </div>

            <div className="settings-v2-rows">
              {/* Master Volume */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Master Volume</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="Master Volume"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={settings.masterVolume}
                    onChange={v => updateSetting('masterVolume', v)}
                  />
                </div>
              </div>

              {/* Music Volume */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Music Volume</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="Music Volume"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={settings.musicVolume}
                    onChange={v => updateSetting('musicVolume', v)}
                  />
                </div>
              </div>

              {/* SFX Volume */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">SFX Volume</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="SFX Volume"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={settings.sfxVolume}
                    onChange={v => updateSetting('sfxVolume', v)}
                  />
                </div>
              </div>

              {/* Radio Volume */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <circle cx="8" cy="14" r="3" />
                      <circle cx="16" cy="14" r="3" />
                      <line x1="4" y1="4" x2="10" y2="7" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Radio Volume</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="Radio Volume"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={settings.radioVolume}
                    onChange={v => updateSetting('radioVolume', v)}
                  />
                </div>
              </div>

              {/* Voice Chat Volume */}
              <div className="settings-v2-row">
                <div className="settings-v2-row-left">
                  <div className="settings-v2-row-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                  <div className="settings-v2-row-info">
                    <span className="settings-v2-row-title">Voice Chat Volume</span>
                  </div>
                </div>
                <div className="settings-v2-row-right">
                  <SliderControl
                    label="Voice Chat Volume"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={settings.voiceChatVolume}
                    onChange={v => updateSetting('voiceChatVolume', v)}
                  />
                </div>
              </div>
            </div>
          </section>

          <SettingsCategoryCard
            category="controls"
            title="CONTROLS"
            description="Tune movement and camera input."
            sectionRef={node => { sectionRefs.current.controls = node }}
          >
            <SettingsOption title="Look Sensitivity" description="Adjust camera movement speed.">
              <SliderControl label="Look Sensitivity" min={0.1} max={1} step={0.05} value={settings.lookSensitivity} onChange={v => updateSetting('lookSensitivity', v)} />
            </SettingsOption>
            <SettingsOption title="Invert Look" description="Invert the vertical camera axis.">
              <ToggleSwitch label="Invert Look" checked={settings.invertLook} onChange={v => updateSetting('invertLook', v)} />
            </SettingsOption>
            <SettingsOption title="Hold to Sprint" description="Keep sprint active while the sprint key is held.">
              <ToggleSwitch label="Hold to Sprint" checked={settings.holdToSprint} onChange={v => updateSetting('holdToSprint', v)} />
            </SettingsOption>
          </SettingsCategoryCard>

          <SettingsCategoryCard
            category="hud"
            title="HUD"
            description="Choose which information stays visible in play."
            sectionRef={node => { sectionRefs.current.hud = node }}
          >
            <SettingsOption title="Show Minimap" description="Display the city minimap.">
              <ToggleSwitch label="Show Minimap" checked={settings.showMinimap} onChange={v => updateSetting('showMinimap', v)} />
            </SettingsOption>
            <SettingsOption title="Show Compass" description="Display navigation headings.">
              <ToggleSwitch label="Show Compass" checked={settings.showCompass} onChange={v => updateSetting('showCompass', v)} />
            </SettingsOption>
            <SettingsOption title="Damage Numbers" description="Show damage values over affected targets.">
              <ToggleSwitch label="Damage Numbers" checked={settings.damageNumbers} onChange={v => updateSetting('damageNumbers', v)} />
            </SettingsOption>
          </SettingsCategoryCard>

          <SettingsCategoryCard
            category="notifications"
            title="NOTIFICATIONS"
            description="Control alerts and message indicators."
            sectionRef={node => { sectionRefs.current.notifications = node }}
          >
            <SettingsOption title="Show Notifications" description="Display in-game notifications.">
              <ToggleSwitch label="Show Notifications" checked={settings.showNotifications} onChange={v => updateSetting('showNotifications', v)} />
            </SettingsOption>
            <SettingsOption title="Mission Alerts" description="Show updates for active missions.">
              <ToggleSwitch label="Mission Alerts" checked={settings.missionAlerts} onChange={v => updateSetting('missionAlerts', v)} />
            </SettingsOption>
            <SettingsOption title="Chat Notifications" description="Show new chat message alerts.">
              <ToggleSwitch label="Chat Notifications" checked={settings.chatNotifications} onChange={v => updateSetting('chatNotifications', v)} />
            </SettingsOption>
          </SettingsCategoryCard>

          <SettingsCategoryCard
            category="accessibility"
            title="ACCESSIBILITY"
            description="Make the interface easier to read and use."
            sectionRef={node => { sectionRefs.current.accessibility = node }}
          >
            <SettingsOption title="Colorblind Mode" description="Apply a color filter for common color vision differences.">
              <SelectControl label="Colorblind Mode" value={settings.colorblindMode} options={colorblindModes} onChange={v => updateSetting('colorblindMode', v as StreamlinedSettingsState['colorblindMode'])} />
            </SettingsOption>
            <SettingsOption title="Subtitles" description="Show captions for spoken audio.">
              <ToggleSwitch label="Subtitles" checked={settings.subtitles} onChange={v => updateSetting('subtitles', v)} />
            </SettingsOption>
            <SettingsOption title="High Contrast" description="Increase contrast around interface elements.">
              <ToggleSwitch label="High Contrast" checked={settings.highContrast} onChange={v => updateSetting('highContrast', v)} />
            </SettingsOption>
          </SettingsCategoryCard>

          <SettingsCategoryCard
            category="advanced"
            title="ADVANCED"
            description="Developer and diagnostic options for this experience."
            sectionRef={node => { sectionRefs.current.advanced = node }}
          >
            <SettingsOption title="Developer Mode" description="Enable extra development controls.">
              <ToggleSwitch label="Developer Mode" checked={settings.developerMode} onChange={v => updateSetting('developerMode', v)} />
            </SettingsOption>
            <SettingsOption title="Network Stats" description="Show network timing and transport status.">
              <ToggleSwitch label="Network Stats" checked={settings.showNetworkStats} onChange={v => updateSetting('showNetworkStats', v)} />
            </SettingsOption>
            <div className="settings-v2-reset-row">
              <button type="button" className="settings-v2-reset-button" onClick={resetSettings}>Reset all settings</button>
            </div>
          </SettingsCategoryCard>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="settings-v2-footer">
        <div className="settings-v2-footer-left">
          <span className="settings-v2-motto">SUN CITY STATE OF MIND</span>
        </div>
        <div className="settings-v2-footer-right">
          <span className="settings-v2-autosave">SETTINGS SAVE AUTOMATICALLY.</span>
          <span className={`settings-v2-autosave settings-v2-save-state is-${saveState}`} aria-live="polite">{settingsStatus}</span>
        </div>
      </footer>
    </div>
  )
}

/* ---------------- Subcomponents ---------------- */

function SettingsCategoryCard({
  category,
  title,
  description,
  sectionRef,
  children,
}: {
  category: string
  title: string
  description: string
  sectionRef: (node: HTMLElement | null) => void
  children: ReactNode
}) {
  return (
    <section ref={sectionRef} data-settings-category={category} className="settings-v2-card" aria-label={`${title} Settings`}>
      <div className="settings-v2-card-header">
        <h2 className="settings-v2-card-title">{title}</h2>
        <p className="settings-v2-card-sub">{description}</p>
      </div>
      <div className="settings-v2-rows">{children}</div>
    </section>
  )
}

function SettingsOption({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="settings-v2-row">
      <div className="settings-v2-row-left">
        <div className="settings-v2-row-icon" aria-hidden="true"><span className="settings-v2-row-mark" /></div>
        <div className="settings-v2-row-info">
          <span className="settings-v2-row-title">{title}</span>
          <span className="settings-v2-row-desc">{description}</span>
        </div>
      </div>
      <div className="settings-v2-row-right">{children}</div>
    </div>
  )
}

function SelectControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: string) => void }) {
  return (
    <div className="settings-v2-select-wrapper">
      <select aria-label={label} value={value} onChange={event => { uiAudio.playClick(); onChange(event.target.value) }} className="settings-v2-select">
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      <div className="settings-v2-select-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
    </div>
  )
}

function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (val: number) => void
}) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <div className="settings-v2-slider-box">
      <input
        type="range"
        className="settings-v2-range-slider"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{
          background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${percentage}%, rgba(30, 41, 59, 0.9) ${percentage}%, rgba(30, 41, 59, 0.9) 100%)`,
        }}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <span className="settings-v2-slider-val">{value.toFixed(2)}</span>
    </div>
  )
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <label className="settings-v2-switch-label">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={e => {
          uiAudio.playCheck()
          onChange(e.target.checked)
        }}
        className="settings-v2-switch-input"
      />
    </label>
  )
}

function CategoryIcon({ name }: { name: string }) {
  switch (name) {
    case 'gear':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    case 'monitor':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    case 'speaker':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )
    case 'gamepad':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <line x1="15" y1="13" x2="15.01" y2="13" />
          <line x1="18" y1="11" x2="18.01" y2="11" />
          <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
      )
    case 'layout':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    case 'accessibility':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="2" />
          <path d="m4 9 8 2 8-2" />
          <path d="M6.5 13l2 8" />
          <path d="M17.5 13l-2 8" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    case 'wrench':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    default:
      return null
  }
}
