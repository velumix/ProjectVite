import { useEffect, useRef, useState } from 'react'

type Tab = 'world' | 'alarm' | 'stopwatch' | 'timer'

type WorldCity = {
  id: string
  name: string
  offset: number
  region: string
}

type AlarmItem = {
  id: string
  time: string
  label: string
  enabled: boolean
}

type LapItem = {
  index: number
  split: string
  total: string
}

const DEFAULT_CITIES: WorldCity[] = [
  { id: 'sc', name: 'Sun City', offset: 0, region: 'Local Time' },
  { id: 'ls', name: 'Los Santos', offset: -3, region: 'Pacific Time' },
  { id: 'lc', name: 'Liberty City', offset: 0, region: 'Eastern Time' },
  { id: 'lon', name: 'London', offset: 5, region: 'Greenwich Mean Time' },
  { id: 'tok', name: 'Tokyo', offset: 13, region: 'Japan Standard Time' },
]

const DEFAULT_ALARMS: AlarmItem[] = [
  { id: '1', time: '06:45 AM', label: 'Morning Workout', enabled: true },
  { id: '2', time: '08:30 AM', label: 'Shift Briefing', enabled: true },
  { id: '3', time: '10:00 PM', label: 'Night Routine', enabled: false },
]

export function ClockApp() {
  const [tab, setTab] = useState<Tab>('world')
  const [now, setNow] = useState(new Date())

  // World Clock
  const [cities] = useState<WorldCity[]>(DEFAULT_CITIES)

  // Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>(DEFAULT_ALARMS)
  const [showAddAlarm, setShowAddAlarm] = useState(false)
  const [newAlarmTime, setNewAlarmTime] = useState('07:00')
  const [newAlarmLabel, setNewAlarmLabel] = useState('')

  // Stopwatch
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const [laps, setLaps] = useState<LapItem[]>([])
  const stopwatchRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Timer
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(300) // 5 minutes default
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState(300)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerHours, setTimerHours] = useState(0)
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Stopwatch ticker
  useEffect(() => {
    if (stopwatchRunning) {
      lastTimeRef.current = performance.now()
      const step = (time: number) => {
        const delta = time - lastTimeRef.current
        lastTimeRef.current = time
        setStopwatchMs((prev) => prev + delta)
        stopwatchRef.current = requestAnimationFrame(step)
      }
      stopwatchRef.current = requestAnimationFrame(step)
    } else if (stopwatchRef.current) {
      cancelAnimationFrame(stopwatchRef.current)
    }
    return () => {
      if (stopwatchRef.current) cancelAnimationFrame(stopwatchRef.current)
    }
  }, [stopwatchRunning])

  // Timer ticker
  useEffect(() => {
    let interval: number | undefined
    if (timerRunning && timerRemainingSeconds > 0) {
      interval = window.setInterval(() => {
        setTimerRemainingSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerRemainingSeconds])

  const formatMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
  }

  const handleLap = () => {
    const total = formatMs(stopwatchMs)
    const prevMs = laps.length > 0 ? laps[0].index : 0
    const split = formatMs(stopwatchMs - prevMs)
    setLaps([{ index: stopwatchMs, split, total }, ...laps])
  }

  const handleResetStopwatch = () => {
    setStopwatchRunning(false)
    setStopwatchMs(0)
    setLaps([])
  }

  const handleStartTimer = () => {
    const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds
    if (total > 0) {
      setTimerTotalSeconds(total)
      setTimerRemainingSeconds(total)
      setTimerRunning(true)
    }
  }

  const handleAddAlarm = () => {
    if (!newAlarmTime) return
    const [h, m] = newAlarmTime.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    const formatted = `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
    setAlarms((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        time: formatted,
        label: newAlarmLabel || 'Alarm',
        enabled: true,
      },
    ])
    setNewAlarmLabel('')
    setShowAddAlarm(false)
  }

  return (
    <div className="clock-app-container" aria-label="Clock">
      {/* Tab Switcher */}
      <div className="clock-tabs" role="tablist">
        <button
          type="button"
          className={`clock-tab-btn ${tab === 'world' ? 'is-active' : ''}`}
          onClick={() => setTab('world')}
        >
          World Clock
        </button>
        <button
          type="button"
          className={`clock-tab-btn ${tab === 'alarm' ? 'is-active' : ''}`}
          onClick={() => setTab('alarm')}
        >
          Alarm
        </button>
        <button
          type="button"
          className={`clock-tab-btn ${tab === 'stopwatch' ? 'is-active' : ''}`}
          onClick={() => setTab('stopwatch')}
        >
          Stopwatch
        </button>
        <button
          type="button"
          className={`clock-tab-btn ${tab === 'timer' ? 'is-active' : ''}`}
          onClick={() => setTab('timer')}
        >
          Timer
        </button>
      </div>

      {/* Tab 1: World Clock */}
      {tab === 'world' && (
        <div className="clock-content clock-world">
          <div className="clock-section-header">
            <h3>World Clock</h3>
          </div>
          <div className="clock-city-list">
            {cities.map((city) => {
              const cityDate = new Date(now.getTime() + city.offset * 3600000)
              const timeStr = cityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              const diffText = city.offset === 0 ? 'Today' : `${city.offset > 0 ? '+' : ''}${city.offset}HRS`
              return (
                <div key={city.id} className="clock-city-card">
                  <div>
                    <small className="clock-city-region">{city.region} • {diffText}</small>
                    <strong className="clock-city-name">{city.name}</strong>
                  </div>
                  <div className="clock-city-time">{timeStr}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Alarm */}
      {tab === 'alarm' && (
        <div className="clock-content clock-alarm">
          <div className="clock-section-header">
            <h3>Alarms</h3>
            <button
              type="button"
              className="clock-action-btn"
              onClick={() => setShowAddAlarm(true)}
              aria-label="Add alarm"
            >
              + Add
            </button>
          </div>

          <div className="clock-alarm-list">
            {alarms.map((alarm) => (
              <div key={alarm.id} className={`clock-alarm-card ${alarm.enabled ? '' : 'is-disabled'}`}>
                <div>
                  <strong className="clock-alarm-time">{alarm.time}</strong>
                  <span className="clock-alarm-label">{alarm.label}</span>
                </div>
                <label className="clock-toggle-switch">
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() =>
                      setAlarms((prev) =>
                        prev.map((a) => (a.id === alarm.id ? { ...a, enabled: !a.enabled } : a)),
                      )
                    }
                  />
                  <span className="clock-toggle-slider" />
                </label>
              </div>
            ))}
          </div>

          {showAddAlarm && (
            <div className="clock-modal-overlay">
              <div className="clock-modal-card">
                <h4>New Alarm</h4>
                <div className="clock-modal-form">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                  />
                  <label>Label</label>
                  <input
                    type="text"
                    placeholder="Alarm label"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                  />
                </div>
                <div className="clock-modal-actions">
                  <button type="button" onClick={() => setShowAddAlarm(false)}>Cancel</button>
                  <button type="button" className="is-save" onClick={handleAddAlarm}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Stopwatch */}
      {tab === 'stopwatch' && (
        <div className="clock-content clock-stopwatch">
          <div className="clock-stopwatch-display">
            <span>{formatMs(stopwatchMs)}</span>
          </div>

          <div className="clock-stopwatch-controls">
            <button
              type="button"
              className="clock-round-btn is-secondary"
              onClick={stopwatchRunning ? handleLap : handleResetStopwatch}
              disabled={stopwatchMs === 0}
            >
              {stopwatchRunning ? 'Lap' : 'Reset'}
            </button>
            <button
              type="button"
              className={`clock-round-btn ${stopwatchRunning ? 'is-stop' : 'is-start'}`}
              onClick={() => setStopwatchRunning(!stopwatchRunning)}
            >
              {stopwatchRunning ? 'Stop' : 'Start'}
            </button>
          </div>

          {laps.length > 0 && (
            <div className="clock-laps-table">
              <div className="clock-lap-row clock-lap-header">
                <span>Lap</span>
                <span>Split</span>
                <span>Total</span>
              </div>
              {laps.map((lap, index) => (
                <div key={index} className="clock-lap-row">
                  <span>Lap {laps.length - index}</span>
                  <span>{lap.split}</span>
                  <span>{lap.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Timer */}
      {tab === 'timer' && (
        <div className="clock-content clock-timer">
          {timerRunning || timerRemainingSeconds < timerTotalSeconds ? (
            <div className="clock-timer-running-view">
              <div className="clock-timer-circle">
                <span className="clock-timer-countdown">
                  {Math.floor(timerRemainingSeconds / 3600) > 0 &&
                    `${String(Math.floor(timerRemainingSeconds / 3600)).padStart(2, '0')}:`}
                  {String(Math.floor((timerRemainingSeconds % 3600) / 60)).padStart(2, '0')}:
                  {String(timerRemainingSeconds % 60).padStart(2, '0')}
                </span>
                <small className="clock-timer-sub">
                  {timerRunning ? 'Counting down' : 'Paused'}
                </small>
              </div>

              <div className="clock-stopwatch-controls">
                <button
                  type="button"
                  className="clock-round-btn is-secondary"
                  onClick={() => {
                    setTimerRunning(false)
                    setTimerRemainingSeconds(timerTotalSeconds)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`clock-round-btn ${timerRunning ? 'is-pause' : 'is-start'}`}
                  onClick={() => setTimerRunning(!timerRunning)}
                >
                  {timerRunning ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          ) : (
            <div className="clock-timer-setup-view">
              <div className="clock-timer-pickers">
                <div className="clock-picker-column">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={timerHours}
                    onChange={(e) => setTimerHours(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span>hours</span>
                </div>
                <div className="clock-picker-column">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span>min</span>
                </div>
                <div className="clock-picker-column">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span>sec</span>
                </div>
              </div>

              <div className="clock-stopwatch-controls">
                <button
                  type="button"
                  className="clock-round-btn is-start"
                  onClick={handleStartTimer}
                >
                  Start
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
