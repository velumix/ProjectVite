import { useRef } from 'react'

type Props = {
  onHome: () => void
  interactive?: boolean
  isHome?: boolean
}

export function PhoneHomeIndicator({ onHome, interactive = true, isHome = false }: Props) {
  const startYRef = useRef<number | null>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    startYRef.current = e.clientY
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (startYRef.current !== null) {
      const deltaY = startYRef.current - e.clientY
      // If user swiped upward by 10px or more, trigger home/close action
      if (deltaY > 10) {
        onHome()
      }
      startYRef.current = null
    }
  }

  return (
    <div className="phone-home-indicator-bar">
      <button
        type="button"
        className="phone-home-indicator-pill-btn"
        onClick={onHome}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        aria-label={isHome ? 'Close Phone' : 'Return to Springboard'}
        disabled={!interactive}
        title={isHome ? 'Close Phone (Home Bar)' : 'Return to Springboard'}
      >
        <span className="phone-home-indicator-line" />
      </button>
    </div>
  )
}
