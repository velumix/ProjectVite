import { BluetoothIcon, CameraIcon, FlashlightIcon, MoonIcon, PauseIcon, PlaneIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, SunIcon, VolumeIcon, WifiIcon } from './PhoneIcons'

type Props = {
  open: boolean
  onClose: () => void
  airplaneMode: boolean
  wifiEnabled: boolean
  bluetoothEnabled: boolean
  darkMode: boolean
  onToggleSetting: (key: 'airplaneMode' | 'wifiEnabled' | 'bluetoothEnabled' | 'darkMode') => void
  brightness: number
  onChangeBrightness: (val: number) => void
  volume: number
  onChangeVolume: (val: number) => void
  flashlightActive: boolean
  onToggleFlashlight: () => void
  musicPlaying: boolean
  currentTrack: { title: string; artist: string }
  onToggleMusic: () => void
  onLaunchApp: (appId: string) => void
}

export function PhoneControlCenter({
  open,
  onClose,
  airplaneMode,
  wifiEnabled,
  bluetoothEnabled,
  darkMode,
  onToggleSetting,
  brightness,
  onChangeBrightness,
  volume,
  onChangeVolume,
  flashlightActive,
  onToggleFlashlight,
  musicPlaying,
  currentTrack,
  onToggleMusic,
  onLaunchApp,
}: Props) {
  if (!open) return null

  return (
    <aside
      className="phone-control-center-overlay"
      role="dialog"
      aria-label="Control Center"
      onClick={onClose}
    >
      <div className="phone-control-center" onClick={(e) => e.stopPropagation()}>
        <div className="phone-cc-handle" onClick={onClose}>
          <span className="phone-cc-pull-bar" />
        </div>

        <div className="phone-cc-grid">
          {/* Connectivity Plate */}
          <div className="phone-cc-card phone-cc-connectivity">
            <button
              type="button"
              className={`phone-cc-round-btn ${airplaneMode ? 'is-active' : ''}`}
              onClick={() => onToggleSetting('airplaneMode')}
              aria-label="Airplane mode toggle"
              title="Airplane mode"
            >
              <PlaneIcon size={18} />
            </button>
            <button
              type="button"
              className={`phone-cc-round-btn ${cellularActive(airplaneMode) ? 'is-active' : 'is-disabled'}`}
              disabled={airplaneMode}
              aria-label="Cellular Data"
              title="Cellular Data"
            >
              <span className="phone-cc-cellular-glyph">📶</span>
            </button>
            <button
              type="button"
              className={`phone-cc-round-btn ${wifiEnabled && !airplaneMode ? 'is-active' : ''}`}
              onClick={() => onToggleSetting('wifiEnabled')}
              aria-label="Wi-Fi toggle"
              title="Wi-Fi"
            >
              <WifiIcon size={18} />
            </button>
            <button
              type="button"
              className={`phone-cc-round-btn ${bluetoothEnabled && !airplaneMode ? 'is-active' : ''}`}
              onClick={() => onToggleSetting('bluetoothEnabled')}
              aria-label="Bluetooth toggle"
              title="Bluetooth"
            >
              <BluetoothIcon size={18} />
            </button>
          </div>

          {/* Music Plate */}
          <div className="phone-cc-card phone-cc-media">
            <div className="phone-cc-media-info">
              <strong>{currentTrack.title}</strong>
              <small>{currentTrack.artist}</small>
            </div>
            <div className="phone-cc-media-controls">
              <button type="button" aria-label="Previous track"><SkipBackIcon size={15} /></button>
              <button type="button" onClick={onToggleMusic} aria-label={musicPlaying ? 'Pause' : 'Play'}>
                {musicPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              </button>
              <button type="button" aria-label="Next track"><SkipForwardIcon size={15} /></button>
            </div>
          </div>

          {/* Sliders Plate */}
          <div className="phone-cc-sliders-row">
            {/* Brightness Slider */}
            <div className="phone-cc-vertical-slider">
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => onChangeBrightness(Number(e.target.value))}
                aria-label="Brightness"
                className="phone-cc-slider-input"
              />
              <div className="phone-cc-slider-fill" style={{ height: `${brightness}%` }} />
              <div className="phone-cc-slider-icon">
                <SunIcon size={18} />
              </div>
            </div>

            {/* Volume Slider */}
            <div className="phone-cc-vertical-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                aria-label="Volume"
                className="phone-cc-slider-input"
              />
              <div className="phone-cc-slider-fill" style={{ height: `${volume}%` }} />
              <div className="phone-cc-slider-icon">
                <VolumeIcon size={18} />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="phone-cc-actions-grid">
            <button
              type="button"
              className={`phone-cc-action-btn ${flashlightActive ? 'is-active' : ''}`}
              onClick={onToggleFlashlight}
              aria-label="Flashlight"
            >
              <FlashlightIcon size={20} />
              <small>Torch</small>
            </button>
            <button
              type="button"
              className={`phone-cc-action-btn ${darkMode ? 'is-active' : ''}`}
              onClick={() => onToggleSetting('darkMode')}
              aria-label="Dark Mode"
            >
              <MoonIcon size={20} />
              <small>Dark</small>
            </button>
            <button
              type="button"
              className="phone-cc-action-btn"
              onClick={() => {
                onClose()
                onLaunchApp('calculator')
              }}
              aria-label="Open Calculator"
            >
              <span className="text-base font-bold">±</span>
              <small>Calc</small>
            </button>
            <button
              type="button"
              className="phone-cc-action-btn"
              onClick={() => {
                onClose()
                onLaunchApp('camera')
              }}
              aria-label="Open Camera"
            >
              <CameraIcon size={20} />
              <small>Camera</small>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

function cellularActive(airplane: boolean) {
  return !airplane
}
