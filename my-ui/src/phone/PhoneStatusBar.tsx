import { useEffect, useState, type ReactNode } from 'react'
import { BatteryIcon, CellularIcon, LockIcon, PlaneIcon, WifiIcon } from './PhoneIcons'

type Props = {
  carrier?: string
  battery?: number
  charging?: boolean
  wifiEnabled?: boolean
  airplaneMode?: boolean
  cellularEnabled?: boolean
  onOpenControlCenter?: () => void
  onLockPhone?: () => void
  children?: ReactNode
}

export function PhoneStatusBar({
  battery = 87,
  charging = false,
  wifiEnabled = true,
  airplaneMode = false,
  cellularEnabled = true,
  onOpenControlCenter,
  onLockPhone,
  children,
}: Props) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    update()
    const interval = window.setInterval(update, 10000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <header className="phone-statusbar" aria-label="Phone status bar">
      {/* Left section: Time and optional airplane mode tag, click to lock */}
      <div className="phone-statusbar-left">
        <button
          type="button"
          className="phone-statusbar-time-btn"
          onClick={onLockPhone}
          title="Lock phone"
          aria-label="Lock phone"
        >
          <time className="phone-statusbar-time">{time}</time>
          <LockIcon size={11} className="phone-statusbar-lock-hint" />
        </button>
        {airplaneMode && (
          <span className="phone-statusbar-carrier">AIRPLANE MODE</span>
        )}
      </div>

      {/* Dynamic Island center slot if passed */}
      {children}

      {/* Right section: Indicators, click to toggle Control Center */}
      <button
        type="button"
        className="phone-statusbar-right"
        onClick={onOpenControlCenter}
        title="Open Control Center"
        aria-label="Open Control Center"
      >
        <div className="phone-statusbar-icons">
          {airplaneMode ? (
            <PlaneIcon size={12} className="text-amber-400" />
          ) : (
            <>
              {cellularEnabled && <CellularIcon size={12} />}
              {wifiEnabled && <WifiIcon size={12} />}
            </>
          )}
          <span className="phone-statusbar-battery-text">{battery}%</span>
          <BatteryIcon size={17} level={battery} charging={charging} />
        </div>
      </button>
    </header>
  )
}
