import { useState, useEffect, useCallback } from 'react'
import {
  MemosService,
  type VoiceMemo,
} from '../../nerve/preview'

export function MemosApp() {
  const [memos, setMemos] = useState<VoiceMemo[]>([])
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [memoTitle, setMemoTitle] = useState('')
  const [memoNotes, setMemoNotes] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadMemos = useCallback(async () => {
    const [list] = await MemosService.GetMemos.request(undefined)
    if (list) setMemos(list)
  }, [])

  useEffect(() => {
    loadMemos()
    const unsubSaved = MemosService.MemoSaved.connect((item) => {
      setMemos((prev) => [item, ...prev])
    })
    const unsubDeleted = MemosService.MemoDeleted.connect((payload) => {
      setMemos((prev) => prev.filter((m) => m.id !== payload.id))
      setActivePlayingId((curr) => (curr === payload.id ? null : curr))
    })
    return () => {
      unsubSaved()
      unsubDeleted()
    }
  }, [loadMemos])

  useEffect(() => {
    let timer: number | null = null
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordDuration(0)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRecording])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleTogglePlay = (id: string) => {
    if (activePlayingId === id) {
      setActivePlayingId(null)
    } else {
      setActivePlayingId(id)
    }
  }

  const handleDelete = async (id: string) => {
    const [ok] = await MemosService.DeleteMemo.request({ id })
    if (ok) {
      setMemos((prev) => prev.filter((m) => m.id !== id))
      showToast('Voice memo deleted')
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setSaveModalOpen(true)
    setMemoTitle(`Voice Memo ${memos.length + 1}`)
  }

  const handleSaveMemo = async () => {
    if (!memoTitle.trim()) {
      showToast('Title is required')
      return
    }
    const [ok, err, item] = await MemosService.SaveMemo.request({
      title: memoTitle.trim(),
      durationSec: Math.max(3, recordDuration),
      notes: memoNotes.trim(),
    })
    if (ok && item) {
      showToast('Voice memo saved!')
      setSaveModalOpen(false)
      setMemoTitle('')
      setMemoNotes('')
    } else if (err) {
      showToast(err)
    }
  }

  const formatSec = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${mins}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="memos-app-root">
      {/* Header */}
      <header className="memos-header">
        <div className="memos-top-row">
          <div>
            <h3 className="memos-title">Voice Memos</h3>
            <small className="memos-count">{memos.length} Recordings</small>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="memos-toast" role="status">
          <span>🎙️</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Recording Drawer / Modal */}
      {saveModalOpen && (
        <div className="memos-modal-backdrop">
          <div className="memos-modal-dialog">
            <div className="memos-modal-header">
              <span>Save Audio Recording</span>
              <button
                type="button"
                className="memos-modal-close"
                onClick={() => setSaveModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="memos-form">
              <input
                type="text"
                placeholder="Memo title..."
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
              />
              <textarea
                placeholder="Notes / transcription details..."
                value={memoNotes}
                onChange={(e) => setMemoNotes(e.target.value)}
                rows={2}
              />
              <button
                type="button"
                className="memos-save-btn"
                onClick={handleSaveMemo}
              >
                SAVE MEMO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memos List */}
      <main className="memos-list-scroll">
        {memos.length === 0 ? (
          <div className="memos-empty">No voice memos recorded yet.</div>
        ) : (
          memos.map((m) => {
            const isPlaying = activePlayingId === m.id
            return (
              <article key={m.id} className="memos-card">
                <div className="memos-card-top">
                  <div>
                    <h4 className="memos-card-title">{m.title}</h4>
                    <small className="memos-card-date">
                      {m.date} • {formatSec(m.durationSec)}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="memos-delete-btn"
                    onClick={() => handleDelete(m.id)}
                    aria-label="Delete Memo"
                  >
                    🗑️
                  </button>
                </div>

                {m.notes && <p className="memos-card-notes">{m.notes}</p>}

                {/* Waveform Visualization */}
                <div className="memos-waveform-row">
                  <div className={`memos-waveform-bars ${isPlaying ? 'playing' : ''}`}>
                    {m.waveform.map((val, idx) => (
                      <span
                        key={idx}
                        className="memos-wave-bar"
                        style={{ height: `${Math.max(4, val * 26)}px` }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`memos-play-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={() => handleTogglePlay(m.id)}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                </div>
              </article>
            )
          })
        )}
      </main>

      {/* Bottom Recording Control Bar */}
      <footer className="memos-bottom-bar">
        {isRecording ? (
          <div className="memos-recording-active">
            <div className="memos-rec-dot" />
            <span className="memos-timer">{formatSec(recordDuration)}</span>
            <button
              type="button"
              className="memos-stop-rec-btn"
              onClick={handleStopRecording}
            >
              STOP RECORDING
            </button>
          </div>
        ) : (
          <div className="memos-record-idle">
            <button
              type="button"
              className="memos-record-btn"
              onClick={() => setIsRecording(true)}
              aria-label="Record Audio"
            >
              <span className="memos-rec-inner" />
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
