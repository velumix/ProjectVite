import { useState, useEffect, useRef } from 'react'
import type { NervePreviewAdapter } from '../../nerve/contracts.ts'
import {
  type PreviewMediaService,
  createMockPhotoSvg,
} from '../../nerve/preview.ts'

export type CameraAppProps = {
  nerve: NervePreviewAdapter
  onOpenPhotos?: () => void
}

const PRESET_SCENES = [
  { name: 'Del Perro Pier', sky: '#0369a1', land: '#164e63', accent: '#fbbf24' },
  { name: 'Chiliad Peak', sky: '#c2410c', land: '#422006', accent: '#facc15' },
  { name: 'Vinewood Hills', sky: '#1e1b4b', land: '#0f172a', accent: '#a855f7' },
  { name: 'Legion Square', sky: '#172554', land: '#111827', accent: '#3b82f6' },
  { name: 'Sandy Shores', sky: '#ca8a04', land: '#78350f', accent: '#f97316' },
  { name: 'Paleto Bay', sky: '#065f46', land: '#064e3b', accent: '#10b981' },
]

export function CameraApp({ nerve, onOpenPhotos }: CameraAppProps) {
  const mediaService = nerve.GetService<PreviewMediaService>('MediaService')

  const [mode, setMode] = useState<'photo' | 'video'>('photo')
  const [zoomIndex, setZoomIndex] = useState<number>(1) // 0: .5x, 1: 1x, 2: 2x, 3: 3x
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off')
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [sceneIdx, setSceneIdx] = useState<number>(0)
  const [recording, setRecording] = useState<boolean>(false)
  const [recordSeconds, setRecordSeconds] = useState<number>(0)
  const [flashTriggered, setFlashTriggered] = useState<boolean>(false)
  const [recentThumb, setRecentThumb] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load latest media item for the bottom-left thumbnail
  useEffect(() => {
    void mediaService.GetMediaList.request({ filter: 'all' }).then(([items]) => {
      if (items && items.length > 0) {
        setRecentThumb(items[0].url)
      }
    })
  }, [mediaService])

  // Timer for video recording
  useEffect(() => {
    if (recording) {
      setRecordSeconds(0)
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    }
  }, [recording])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2000)
  }

  const currentScene = PRESET_SCENES[sceneIdx]
  const zoomLevels = [0.5, 1, 2, 3]
  const currentZoom = zoomLevels[zoomIndex]

  const handleShutter = async () => {
    if (mode === 'photo') {
      // Trigger flash effect animation
      setFlashTriggered(true)
      setTimeout(() => setFlashTriggered(false), 240)

      const photoUrl = createMockPhotoSvg(
        currentScene.name,
        currentScene.sky,
        currentScene.land,
        currentScene.accent,
      )

      const [ok, newItem, err] = await mediaService.CaptureMedia.request({
        mediaType: 'photo',
        url: photoUrl,
        title: `${currentScene.name} Shot`,
        location: currentScene.name,
      })

      if (ok && newItem) {
        setRecentThumb(newItem.url)
        showToast('Photo Saved to Gallery')
      } else {
        showToast(err ?? 'Could not capture photo')
      }
    } else {
      // Video mode
      if (!recording) {
        setRecording(true)
        showToast('Recording Video...')
      } else {
        setRecording(false)
        const videoUrl = createMockPhotoSvg(
          `${currentScene.name} Clip`,
          currentScene.sky,
          currentScene.land,
          '#ef4444',
        )

        const [ok, newItem, err] = await mediaService.CaptureMedia.request({
          mediaType: 'video',
          url: videoUrl,
          title: `${currentScene.name} Video (${recordSeconds}s)`,
          location: currentScene.name,
        })

        if (ok && newItem) {
          setRecentThumb(newItem.url)
          showToast(`Saved ${recordSeconds}s Video`)
        } else {
          showToast(err ?? 'Could not save video')
        }
      }
    }
  }

  const cycleScene = () => {
    setSceneIdx((idx) => (idx + 1) % PRESET_SCENES.length)
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="camera-app-root">
      {/* Top Controls Header */}
      <header className="camera-header-controls">
        <button
          type="button"
          className={`camera-header-btn ${flashMode === 'on' ? 'active' : ''}`}
          onClick={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
          title="Toggle Flash"
          aria-label="Toggle Flash"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {flashMode === 'on' && <span className="camera-flash-indicator" />}
        </button>

        {recording && (
          <div className="camera-record-badge">
            <span className="camera-record-dot" />
            <span>{formatTimer(recordSeconds)}</span>
          </div>
        )}

        <button
          type="button"
          className="camera-header-btn"
          onClick={cycleScene}
          title={`Scene: ${currentScene.name}`}
          aria-label="Cycle Viewfinder Scene"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 8 12 12 16 12 8" />
            <line x1="12" y1="8" x2="16" y2="12" />
          </svg>
        </button>
      </header>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="camera-toast-pill" role="status">
          {toastMessage}
        </div>
      )}

      {/* Main Viewport Simulator */}
      <main className="camera-viewport-container">
        <div
          className={`camera-viewfinder ${facing === 'front' ? 'camera-viewfinder--front' : ''}`}
          style={{ transform: `scale(${currentZoom})` }}
        >
          <div
            className="camera-viewfinder-sky"
            style={{
              background: `linear-gradient(180deg, ${currentScene.sky} 0%, ${currentScene.accent} 100%)`,
            }}
          >
            <div className="camera-dev-sun" />
            <div
              className="camera-dev-mountain"
              style={{ borderBottomColor: currentScene.land }}
            />
          </div>
        </div>

        {/* Viewfinder Scenery Tag */}
        <div className="camera-scenery-overlay">
          <span className="camera-scenery-location">📍 {currentScene.name}</span>
        </div>

        {/* Rule of Thirds Grid */}
        <div className="camera-viewfinder-grid" aria-hidden="true">
          <div className="camera-grid-line h h1" />
          <div className="camera-grid-line h h2" />
          <div className="camera-grid-line v v1" />
          <div className="camera-grid-line v v2" />
        </div>

        {/* Flash Overlay Effect */}
        <div className={`camera-flash-overlay ${flashTriggered ? 'active' : ''}`} />
      </main>

      {/* Zoom Level Switcher */}
      <div className="camera-zoom-bar">
        {zoomLevels.map((lvl, idx) => (
          <button
            key={lvl}
            type="button"
            className={`camera-zoom-btn ${zoomIndex === idx ? 'active' : ''}`}
            onClick={() => setZoomIndex(idx)}
          >
            {lvl < 1 ? '.5' : lvl}x
          </button>
        ))}
      </div>

      {/* Bottom Controls */}
      <footer className="camera-footer-controls">
        {/* Mode Selector */}
        <div className="camera-mode-switcher">
          <button
            type="button"
            className={`camera-mode-btn ${mode === 'photo' ? 'active' : ''}`}
            onClick={() => {
              if (!recording) setMode('photo')
            }}
          >
            PHOTO
          </button>
          <button
            type="button"
            className={`camera-mode-btn ${mode === 'video' ? 'active' : ''}`}
            onClick={() => {
              if (!recording) setMode('video')
            }}
          >
            VIDEO
          </button>
        </div>

        {/* Shutter Bar */}
        <div className="camera-shutter-row">
          {/* Latest Photo Thumbnail */}
          <button
            type="button"
            className="camera-thumbnail-btn"
            onClick={onOpenPhotos}
            title="Open Photos Gallery"
            aria-label="Open Photos Gallery"
          >
            {recentThumb ? (
              <img src={recentThumb} alt="Gallery Preview" className="camera-thumb-img" />
            ) : (
              <div className="camera-thumb-empty">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            className={`camera-shutter-btn ${mode === 'video' ? 'camera-shutter-btn--video' : ''} ${
              recording ? 'recording' : ''
            }`}
            onClick={handleShutter}
            title={mode === 'photo' ? 'Take Photo' : recording ? 'Stop Recording' : 'Start Recording'}
            aria-label="Camera Shutter"
          >
            <div className="camera-shutter-inner" />
          </button>

          {/* Flip Front/Back Camera */}
          <button
            type="button"
            className="camera-flip-btn"
            onClick={() => setFacing(facing === 'back' ? 'front' : 'back')}
            title="Flip Camera"
            aria-label="Flip Camera"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}
