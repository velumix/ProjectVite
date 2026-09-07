type Props = {
  onHome: () => void
  interactive?: boolean
}

export function PhoneHomeIndicator({ onHome, interactive = true }: Props) {
  return (
    <div className="phone-home-indicator-bar">
      <button
        type="button"
        className="phone-home-indicator-pill-btn"
        onClick={onHome}
        aria-label="Return to Springboard"
        disabled={!interactive}
        title="Return to Springboard"
      >
        <span className="phone-home-indicator-line" />
      </button>
    </div>
  )
}
