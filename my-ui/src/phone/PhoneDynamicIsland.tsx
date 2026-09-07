import { useEffect, useState } from 'react'
import { FlashlightIcon, PauseIcon, PhoneCallIcon, PhoneOffIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from './PhoneIcons'

type Props = {
  activeCall?: { status: string; number: string } | null
  onEndCall?: () => void
  musicPlaying?: boolean
  currentTrack?: { title: string; artist: string }
  onToggleMusic?: () => void
  flashlightActive?: boolean
  onToggleFlashlight?: () => void
}

export function PhoneDynamicIsland({
  activeCall,
  onEndCall,
  musicPlaying = false,
  currentTrack = { title: 'Neon Highway', artist: 'Sun City FM' },
  onToggleMusic,
  flashlightActive = false,
  onToggleFlashlight,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [callSeconds, setCallSeconds] = useState(0)

  // Timer for active call
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'connected') {
      setCallSeconds(0)
      return
    }
    const interval = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [activeCall])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const hasActivity = Boolean(activeCall || musicPlaying || flashlightActive)

  return (
    <div
      className={`phone-island ${expanded ? 'is-expanded' : ''} ${hasActivity ? 'has-activity' : ''}`}
      onClick={() => {
        if (hasActivity) setExpanded(!expanded)
      }}
      role="region"
      aria-label="Dynamic Island"
    >
      {!expanded ? (
        <div className="phone-island-compact">
          {activeCall ? (
            <>
              <span className="phone-island-call-pill">
                <PhoneCallIcon size={12} className="text-emerald-400 animate-pulse" />
                <time>{formatTimer(callSeconds)}</time>
              </span>
              <div className="phone-island-wave">
                <span /><span /><span /><span />
              </div>
            </>
          ) : musicPlaying ? (
            <>
              <span className="phone-island-music-pill">
                <span className="phone-island-music-dot" />
                <small>{currentTrack.title}</small>
              </span>
              <div className="phone-island-wave is-music">
                <span /><span /><span />
              </div>
            </>
          ) : flashlightActive ? (
            <div className="phone-island-torch-pill">
              <FlashlightIcon size={12} className="text-amber-300" />
            </div>
          ) : (
            <div className="phone-island-idle">
              <span className="phone-camera-lens" />
            </div>
          )}
        </div>
      ) : (
        <div className="phone-island-expanded-content" onClick={(e) => e.stopPropagation()}>
          {activeCall ? (
            <div className="phone-island-call-card">
              <div className="phone-island-call-info">
                <div className="phone-island-avatar">
                  <PhoneCallIcon size={16} />
                </div>
                <div>
                  <h4>{activeCall.number}</h4>
                  <small>{activeCall.status === 'connected' ? formatTimer(callSeconds) : activeCall.status}</small>
                </div>
              </div>
              <div className="phone-island-actions">
                <button
                  type="button"
                  className="phone-island-btn-end"
                  onClick={() => {
                    onEndCall?.()
                    setExpanded(false)
                  }}
                  aria-label="End call from Dynamic Island"
                >
                  <PhoneOffIcon size={16} />
                </button>
              </div>
            </div>
          ) : musicPlaying ? (
            <div className="phone-island-music-card">
              <div className="phone-island-music-header">
                <div className="phone-island-artwork" />
                <div>
                  <h4>{currentTrack.title}</h4>
                  <small>{currentTrack.artist}</small>
                </div>
              </div>
              <div className="phone-island-controls">
                <button type="button" aria-label="Previous track"><SkipBackIcon size={14} /></button>
                <button type="button" onClick={onToggleMusic} aria-label={musicPlaying ? 'Pause' : 'Play'}>
                  {musicPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                </button>
                <button type="button" aria-label="Next track"><SkipForwardIcon size={14} /></button>
              </div>
            </div>
          ) : flashlightActive ? (
            <div className="phone-island-torch-card">
              <span>Flashlight Active</span>
              <button
                type="button"
                className="phone-island-btn-pill"
                onClick={() => {
                  onToggleFlashlight?.()
                  setExpanded(false)
                }}
              >
                Turn Off
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="phone-island-close"
            onClick={() => setExpanded(false)}
            aria-label="Collapse Dynamic Island"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
