import { useState, useEffect, useCallback, useMemo } from 'react'
import { MusicService, type MusicTrack, type PlaybackState } from '../../nerve/preview'

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function MusicApp() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    position: 0,
    volume: 75,
    loop: false,
    shuffle: false,
  })
  const [activeTab, setActiveTab] = useState<'now-playing' | 'tracks' | 'radio'>('now-playing')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'track-1': true,
    'track-3': true,
  })

  // Fetch initial music library
  const refreshLibrary = useCallback(async () => {
    const [libTracks, state] = await MusicService.GetMusicLibrary.request(undefined)
    if (libTracks) setTracks(libTracks)
    if (state) setPlayback(state)
  }, [])

  useEffect(() => {
    refreshLibrary()
    const unsub = MusicService.PlaybackChanged.connect((state) => {
      setPlayback(state)
    })
    return () => unsub()
  }, [refreshLibrary])

  // Simulated playback time advancement when playing
  useEffect(() => {
    if (!playback.isPlaying || !playback.track) return
    const timer = setInterval(() => {
      setPlayback((prev) => {
        if (!prev.track) return prev
        const nextPos = prev.position + 1
        if (nextPos >= prev.track.duration) {
          void MusicService.NextTrack.request(undefined)
          return { ...prev, position: 0 }
        }
        return { ...prev, position: nextPos }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [playback.isPlaying, playback.track])

  const handlePlayTrack = async (trackId: string) => {
    const [ok, state] = await MusicService.PlayTrack.request({ trackId })
    if (ok && state) {
      setPlayback(state)
      setActiveTab('now-playing')
    }
  }

  const handleTogglePlayback = async () => {
    const [ok, state] = await MusicService.TogglePlayback.request(undefined)
    if (ok && state) setPlayback(state)
  }

  const handleNext = async () => {
    const [ok, state] = await MusicService.NextTrack.request(undefined)
    if (ok && state) setPlayback(state)
  }

  const handlePrevious = async () => {
    const [ok, state] = await MusicService.PreviousTrack.request(undefined)
    if (ok && state) setPlayback(state)
  }

  const handleVolume = async (vol: number) => {
    setPlayback((prev) => ({ ...prev, volume: vol }))
    await MusicService.SetVolume.request({ volume: vol })
  }

  const handleSeek = async (sec: number) => {
    setPlayback((prev) => ({ ...prev, position: sec }))
    await MusicService.SeekTrack.request({ position: sec })
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const currentTrack = playback.track ?? tracks[0]
  const isCurrentFavorite = currentTrack ? !!favorites[currentTrack.id] : false

  // Unique Radio Stations derived from tracks
  const radioStations = useMemo(() => {
    const stations: { name: string; track: MusicTrack }[] = []
    const seen = new Set<string>()
    for (const t of tracks) {
      if (t.station && !seen.has(t.station)) {
        seen.add(t.station)
        stations.push({ name: t.station, track: t })
      }
    }
    return stations
  }, [tracks])

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks
    const q = searchQuery.toLowerCase()
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.station && t.station.toLowerCase().includes(q))
    )
  }, [tracks, searchQuery])

  return (
    <div className="music-app-root">
      {/* Top Header Tabs */}
      <header className="music-header">
        <div className="music-tabs-row">
          <button
            type="button"
            className={`music-tab-btn ${activeTab === 'now-playing' ? 'active' : ''}`}
            onClick={() => setActiveTab('now-playing')}
          >
            Now Playing
          </button>
          <button
            type="button"
            className={`music-tab-btn ${activeTab === 'tracks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracks')}
          >
            Tracks ({tracks.length})
          </button>
          <button
            type="button"
            className={`music-tab-btn ${activeTab === 'radio' ? 'active' : ''}`}
            onClick={() => setActiveTab('radio')}
          >
            Radio Stations
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="music-body">
        {/* NOW PLAYING HERO TAB */}
        {activeTab === 'now-playing' && (
          <div className="music-now-playing-tab">
            {/* Album Vinyl / Art Hero */}
            <div className="music-art-wrapper">
              <div
                className={`music-album-art ${playback.isPlaying ? 'is-spinning' : ''}`}
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${currentTrack?.coverColor ?? '#38bdf8'}, #090e17 80%)`,
                }}
              >
                <div className="music-art-grooves" />
                <div className="music-art-center-hole" />
                <div className="music-art-label">
                  <span className="music-art-icon">🎵</span>
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="music-meta-card">
              <div className="music-meta-text">
                <h3 className="music-title">{currentTrack?.title ?? 'No Track Selected'}</h3>
                <p className="music-artist">{currentTrack?.artist ?? 'Unknown Artist'}</p>
                {currentTrack?.station && (
                  <span className="music-station-chip">📻 {currentTrack.station}</span>
                )}
              </div>
              <button
                type="button"
                className={`music-fav-btn ${isCurrentFavorite ? 'is-fav' : ''}`}
                title={isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              >
                {isCurrentFavorite ? '♥' : '♡'}
              </button>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="music-progress-wrapper">
              <input
                type="range"
                className="music-progress-slider"
                aria-label="Track playback position"
                min={0}
                max={currentTrack?.duration ?? 100}
                value={playback.position}
                onChange={(e) => handleSeek(Number(e.target.value))}
              />
              <div className="music-progress-times">
                <span>{formatTime(playback.position)}</span>
                <span>{formatTime(currentTrack?.duration ?? 0)}</span>
              </div>
            </div>

            {/* Primary Audio Controls */}
            <div className="music-controls-row">
              <button
                type="button"
                className={`music-sub-ctrl ${playback.shuffle ? 'active' : ''}`}
                title="Shuffle"
                onClick={() => setPlayback((p) => ({ ...p, shuffle: !p.shuffle }))}
              >
                🔀
              </button>
              <button
                type="button"
                className="music-ctrl-btn"
                title="Previous Track"
                aria-label="Previous Track"
                onClick={handlePrevious}
              >
                ⏮
              </button>
              <button
                type="button"
                className="music-play-btn"
                title={playback.isPlaying ? 'Pause' : 'Play'}
                aria-label={playback.isPlaying ? 'Pause' : 'Play'}
                onClick={handleTogglePlayback}
              >
                {playback.isPlaying ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                className="music-ctrl-btn"
                title="Next Track"
                aria-label="Next Track"
                onClick={handleNext}
              >
                ⏭
              </button>
              <button
                type="button"
                className={`music-sub-ctrl ${playback.loop ? 'active' : ''}`}
                title="Repeat"
                onClick={() => setPlayback((p) => ({ ...p, loop: !p.loop }))}
              >
                🔁
              </button>
            </div>

            {/* Volume Control */}
            <div className="music-volume-row">
              <span className="music-volume-icon">🔈</span>
              <input
                type="range"
                className="music-volume-slider"
                aria-label="Volume level"
                min={0}
                max={100}
                value={playback.volume}
                onChange={(e) => handleVolume(Number(e.target.value))}
              />
              <span className="music-volume-icon">🔊</span>
            </div>
          </div>
        )}

        {/* TRACKS LIST TAB */}
        {activeTab === 'tracks' && (
          <div className="music-tracks-tab">
            <div className="music-search-bar">
              <span className="music-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tracks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="music-clear-search" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>

            <div className="music-tracks-list">
              {filteredTracks.map((t) => {
                const isCurrent = currentTrack?.id === t.id
                return (
                  <article
                    key={t.id}
                    className={`music-track-card ${isCurrent ? 'is-active' : ''}`}
                    onClick={() => handlePlayTrack(t.id)}
                  >
                    <div className="music-track-art-pill" style={{ background: t.coverColor }}>
                      {isCurrent && playback.isPlaying ? '▶' : '🎵'}
                    </div>
                    <div className="music-track-info">
                      <strong className="music-track-title">{t.title}</strong>
                      <span className="music-track-meta">
                        {t.artist} • {t.album}
                      </span>
                    </div>
                    <div className="music-track-right">
                      {t.station && <small className="music-track-station">{t.station}</small>}
                      <time className="music-track-duration">{formatTime(t.duration)}</time>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* RADIO STATIONS TAB */}
        {activeTab === 'radio' && (
          <div className="music-radio-tab">
            <p className="music-radio-header-note">Sun City Radio Stations</p>
            <div className="music-radio-grid">
              {radioStations.map((station) => {
                const isCurrentStation = currentTrack?.station === station.name && playback.isPlaying
                return (
                  <button
                    key={station.name}
                    type="button"
                    className={`music-station-card ${isCurrentStation ? 'is-active' : ''}`}
                    style={{ borderColor: station.track.coverColor }}
                    onClick={() => handlePlayTrack(station.track.id)}
                  >
                    <div
                      className="music-station-avatar"
                      style={{ background: station.track.coverColor }}
                    >
                      📻
                    </div>
                    <div className="music-station-content">
                      <strong>{station.name}</strong>
                      <small>Playing: {station.track.title}</small>
                    </div>
                    {isCurrentStation && (
                      <span className="music-live-badge">ON AIR</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Mini Persistent Bottom Bar (if outside now playing) */}
      {activeTab !== 'now-playing' && currentTrack && (
        <aside className="music-mini-player" onClick={() => setActiveTab('now-playing')}>
          <div className="music-mini-art" style={{ background: currentTrack.coverColor }}>
            🎵
          </div>
          <div className="music-mini-info">
            <strong>{currentTrack.title}</strong>
            <small>{currentTrack.artist}</small>
          </div>
          <button
            type="button"
            className="music-mini-play"
            title={playback.isPlaying ? 'Pause' : 'Play'}
            aria-label={playback.isPlaying ? 'Pause' : 'Play'}
            onClick={(e) => {
              e.stopPropagation()
              handleTogglePlayback()
            }}
          >
            {playback.isPlaying ? '⏸' : '▶'}
          </button>
        </aside>
      )}
    </div>
  )
}
