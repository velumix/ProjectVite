import { useState, useEffect, useCallback } from 'react'
import {
  RadioService,
  type RadioState,
} from '../../nerve/preview'

export function RadioApp() {
  const [radioState, setRadioState] = useState<RadioState | null>(null)
  const [freqInput, setFreqInput] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadRadio = useCallback(async () => {
    const [state] = await RadioService.GetRadioState.request(undefined)
    if (state) {
      setRadioState(state)
      setFreqInput(state.frequency.toFixed(1))
    }
  }, [])

  useEffect(() => {
    loadRadio()
    const unsubState = RadioService.RadioStateChanged.connect((state) => {
      setRadioState({ ...state })
      setFreqInput(state.frequency.toFixed(1))
    })
    const unsubSpeaker = RadioService.SpeakerTalkingChanged.connect((ev) => {
      setRadioState((prev) => (prev ? { ...prev, activeSpeakers: ev.activeSpeakers } : prev))
    })
    return () => {
      unsubState()
      unsubSpeaker()
    }
  }, [loadRadio])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleTogglePower = async () => {
    if (!radioState) return
    if (radioState.connected) {
      await RadioService.DisconnectRadio.request(undefined)
      showToast('Radio transmitter powered down')
    } else {
      await RadioService.ConnectFrequency.request({ frequency: parseFloat(freqInput) || 101.5 })
      showToast('Radio transmitter online')
    }
  }

  const handleSetFrequency = async (freqVal: number) => {
    const [ok, err] = await RadioService.ConnectFrequency.request({ frequency: freqVal })
    if (ok) {
      setFreqInput(freqVal.toFixed(1))
      showToast(`Tuned to ${freqVal.toFixed(1)} MHz`)
    } else if (err) {
      showToast(err)
    }
  }

  const handleVolumeChange = async (vol: number) => {
    await RadioService.SetVolume.request({ volume: vol })
    setRadioState((prev) => (prev ? { ...prev, volume: vol } : prev))
  }

  const handleToggleMute = async () => {
    const [ok, _, muted] = await RadioService.ToggleMute.request(undefined)
    if (ok && muted !== undefined) {
      setRadioState((prev) => (prev ? { ...prev, micMuted: muted } : prev))
      showToast(muted ? 'Microphone muted' : 'Microphone unmuted')
    }
  }

  const handlePTT = async (talking: boolean) => {
    if (!radioState || !radioState.connected || radioState.micMuted) return
    await RadioService.PushToTalk.request({ isTalking: talking })
  }

  if (!radioState) return <div className="radio-loading">Connecting radio tuner...</div>

  return (
    <div className="radio-app-root">
      {/* Header */}
      <header className="radio-header">
        <div className="radio-top-row">
          <div className="radio-branding">
            <span className="radio-tower-icon">📻</span>
            <h3>TACTICAL RADIO</h3>
          </div>
          <button
            type="button"
            className={`radio-power-btn ${radioState.connected ? 'online' : 'offline'}`}
            onClick={handleTogglePower}
          >
            {radioState.connected ? 'PWR ON' : 'PWR OFF'}
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="radio-toast" role="status">
          <span>📡</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main Radio Tuner Body */}
      <main className="radio-main-scroll">
        {/* Retro Green LCD Display */}
        <div className={`radio-lcd-screen ${radioState.connected ? 'active' : 'inactive'}`}>
          <div className="radio-lcd-top">
            <span className="radio-lcd-indicator">
              {radioState.connected ? '● TX/RX LIVE' : '○ STANDBY'}
            </span>
            <span className="radio-lcd-signal">📶 5/5 BARS</span>
          </div>

          <div className="radio-lcd-freq">
            <span className="radio-freq-num">
              {radioState.connected ? radioState.frequency.toFixed(1) : '---.-'}
            </span>
            <span className="radio-freq-unit">MHz</span>
          </div>

          <div className="radio-lcd-status">
            {radioState.connected ? (
              radioState.activeSpeakers.length > 0 ? (
                <span className="radio-speaker-active">
                  🎙️ {radioState.activeSpeakers.join(', ')} TRANSMITTING
                </span>
              ) : (
                <span className="radio-channel-idle">FREQUENCY CLEAR - READY</span>
              )
            ) : (
              <span className="radio-channel-idle">TRANSCEIVER OFFLINE</span>
            )}
          </div>
        </div>

        {/* Manual Frequency Input Tuner */}
        <div className="radio-tuner-row">
          <input
            type="number"
            step="0.1"
            placeholder="Freq (e.g. 101.5)"
            value={freqInput}
            onChange={(e) => setFreqInput(e.target.value)}
            disabled={!radioState.connected}
          />
          <button
            type="button"
            className="radio-tune-btn"
            onClick={() => handleSetFrequency(parseFloat(freqInput) || 101.5)}
            disabled={!radioState.connected}
          >
            TUNE
          </button>
        </div>

        {/* Quick Presets */}
        <div className="radio-section-box">
          <label className="radio-section-label">FREQUENCY PRESETS</label>
          <div className="radio-presets-grid">
            {radioState.presets.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`radio-preset-chip ${radioState.connected && radioState.frequency === p.freq ? 'selected' : ''}`}
                onClick={() => handleSetFrequency(p.freq)}
                disabled={!radioState.connected}
              >
                <span>{p.name}</span>
                <small>{p.freq.toFixed(1)}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Mic Controls */}
        <div className="radio-section-box">
          <div className="radio-vol-header">
            <label className="radio-section-label">RECEIVER VOLUME</label>
            <span className="radio-vol-val">{radioState.volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={radioState.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="radio-vol-slider"
          />

          <div className="radio-mute-row">
            <button
              type="button"
              className={`radio-mute-btn ${radioState.micMuted ? 'muted' : ''}`}
              onClick={handleToggleMute}
              disabled={!radioState.connected}
            >
              {radioState.micMuted ? '🔇 MIC MUTED' : '🎤 MIC LIVE'}
            </button>
          </div>
        </div>

        {/* Big Push-To-Talk Key */}
        <div className="radio-ptt-container">
          <button
            type="button"
            className={`radio-ptt-button ${radioState.isTalking ? 'talking' : ''}`}
            onPointerDown={() => handlePTT(true)}
            onMouseDown={() => handlePTT(true)}
            onPointerUp={() => handlePTT(false)}
            onMouseUp={() => handlePTT(false)}
            onTouchStart={() => handlePTT(true)}
            onTouchEnd={() => handlePTT(false)}
            disabled={!radioState.connected || radioState.micMuted}
          >
            <div className="radio-ptt-glow" />
            <span className="radio-ptt-text">
              {radioState.isTalking ? 'TRANSMITTING' : 'HOLD TO TALK'}
            </span>
            <small>PUSH TO TALK (PTT)</small>
          </button>
        </div>

        {/* Active Channel Members */}
        <div className="radio-section-box">
          <label className="radio-section-label">
            CHANNEL OPERATORS ({radioState.channelMembers.length})
          </label>
          <div className="radio-members-list">
            {radioState.channelMembers.map((m) => {
              const isSpeaking = radioState.activeSpeakers.includes(m)
              return (
                <div key={m} className={`radio-member-row ${isSpeaking ? 'speaking' : ''}`}>
                  <div className="radio-member-left">
                    <span className={`radio-member-dot ${isSpeaking ? 'active' : ''}`} />
                    <strong>{m}</strong>
                  </div>
                  {isSpeaking && <span className="radio-speaking-tag">TX</span>}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
