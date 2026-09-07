import { useEffect, useState, type KeyboardEvent } from 'react'
import { CameraIcon, ChevronUpIcon, FlashlightIcon, LockIcon, UnlockIcon } from './PhoneIcons'

export type PhoneNotificationItem = {
  id: string
  app: string
  title: string
  body: string
  time: string
}

type Props = {
  locked: boolean
  onUnlock: () => void
  carrier?: string
  notifications?: PhoneNotificationItem[]
  onDismissNotification?: (id: string) => void
  onClearNotifications?: () => void
  flashlightActive?: boolean
  onToggleFlashlight?: () => void
  onLaunchCamera?: () => void
}

export function PhoneLockScreen({
  locked,
  onUnlock,
  notifications = [],
  onDismissNotification,
  onClearNotifications,
  flashlightActive = false,
  onToggleFlashlight,
  onLaunchCamera,
}: Props) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
      setDate(
        d.toLocaleDateString([], {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
      )
    }
    updateTime()
    const interval = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const handleUnlock = () => {
    setUnlocking(true)
    setTimeout(() => {
      onUnlock()
      setUnlocking(false)
    }, 250)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault()
      handleUnlock()
    }
  }

  if (!locked) return null

  return (
    <section
      className={`phone-lockscreen ${unlocking ? 'is-unlocking' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Lock screen"
    >
      <div className="phone-lockscreen-backdrop" />

      {/* Top Lock Icon */}
      <div className="phone-lockscreen-header">
        <button
          type="button"
          className="phone-lockscreen-lock-btn"
          onClick={handleUnlock}
          aria-label="Tap to unlock"
        >
          {unlocking ? <UnlockIcon size={20} className="text-emerald-400" /> : <LockIcon size={20} />}
        </button>
      </div>

      {/* Center Date & Clock */}
      <div className="phone-lockscreen-clock">
        <p className="phone-lockscreen-date">{date || 'Monday, September 7'}</p>
        <time className="phone-lockscreen-time">{time || '12:00'}</time>
      </div>

      {/* Notifications Stack */}
      <div className="phone-lockscreen-notifications">
        {notifications.length > 0 && (
          <div className="phone-notifs-container">
            <div className="phone-notifs-header">
              <span>NOTIFICATIONS</span>
              {notifications.length > 1 && onClearNotifications && (
                <button
                  type="button"
                  className="phone-notifs-clear"
                  onClick={onClearNotifications}
                  aria-label="Clear all notifications"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="phone-notifs-list">
              {notifications.map((notif) => (
                <div key={notif.id} className="phone-notif-bubble">
                  <div className="phone-notif-title-row">
                    <strong>{notif.title}</strong>
                    <time>{notif.time}</time>
                  </div>
                  <p>{notif.body}</p>
                  {onDismissNotification && (
                    <button
                      type="button"
                      className="phone-notif-dismiss"
                      onClick={() => onDismissNotification(notif.id)}
                      aria-label={`Dismiss notification from ${notif.title}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quick Shortcuts and Swipe To Unlock */}
      <div className="phone-lockscreen-bottom">
        <div className="phone-lockscreen-shortcuts">
          <button
            type="button"
            className={`phone-shortcut-fab ${flashlightActive ? 'is-active' : ''}`}
            onClick={onToggleFlashlight}
            aria-label="Toggle Flashlight"
          >
            <FlashlightIcon size={18} />
          </button>
          <button
            type="button"
            className="phone-shortcut-fab"
            onClick={onLaunchCamera}
            aria-label="Open Camera"
          >
            <CameraIcon size={18} />
          </button>
        </div>

        <button
          type="button"
          className="phone-lockscreen-swipe-prompt"
          onClick={handleUnlock}
          aria-label="Swipe up to unlock"
        >
          <ChevronUpIcon size={16} className="animate-bounce" />
          <span>Swipe up to unlock</span>
          <span className="phone-home-indicator-pill" />
        </button>
      </div>
    </section>
  )
}
