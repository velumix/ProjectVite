import { useState, useEffect, useCallback } from 'react'
import {
  FlareService,
  type FlareProfile,
  type FlareMessage,
} from '../../nerve/preview'

type TabType = 'discover' | 'matches'

export function FlareApp() {
  const [profiles, setProfiles] = useState<FlareProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [tab, setTab] = useState<TabType>('discover')
  const [activeMatch, setActiveMatch] = useState<FlareProfile | null>(null)
  const [messages, setMessages] = useState<FlareMessage[]>([])
  const [chatDraft, setChatDraft] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [matchedPopup, setMatchedPopup] = useState<FlareProfile | null>(null)

  const loadProfiles = useCallback(async () => {
    const [list] = await FlareService.GetProfiles.request(undefined)
    if (list) setProfiles(list)
  }, [])

  useEffect(() => {
    loadProfiles()
    const unsubMatch = FlareService.NewMatch.connect((p) => {
      setMatchedPopup(p)
      setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, isMatch: true } : x)))
    })
    const unsubMsg = FlareService.NewFlareMessage.connect((msg) => {
      setMessages((prev) => [...prev, msg])
    })
    return () => {
      unsubMatch()
      unsubMsg()
    }
  }, [loadProfiles])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleSwipe = async (direction: 'like' | 'pass') => {
    const current = profiles[currentIndex]
    if (!current) return

    const [ok, _, isMatch] = await FlareService.SwipeProfile.request({
      profileId: current.id,
      direction,
    })

    if (ok) {
      if (direction === 'like' && isMatch) {
        setMatchedPopup(current)
      }
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const openMatchChat = async (match: FlareProfile) => {
    setActiveMatch(match)
    const [msgs] = await FlareService.GetMessages.request({ matchId: match.id })
    if (msgs) setMessages(msgs)
  }

  const handleSendMessage = async () => {
    if (!activeMatch || !chatDraft.trim()) return
    const [ok, err, msg] = await FlareService.SendMessage.request({
      matchId: activeMatch.id,
      text: chatDraft.trim(),
    })
    if (ok && msg) {
      setChatDraft('')
    } else if (err) {
      showToast(err)
    }
  }

  const matches = profiles.filter((p) => p.isMatch)
  const currentProfile = profiles[currentIndex]

  return (
    <div className="flare-app-root">
      {/* Header */}
      <header className="flare-header">
        <div className="flare-top-row">
          <div className="flare-branding">
            <span className="flare-flame-icon">🔥</span>
            <h3>FLARE</h3>
          </div>
          <span className="flare-matches-pill">
            ❤️ {matches.length} Matches
          </span>
        </div>

        {/* Tab Ribbon */}
        <nav className="flare-tab-ribbon">
          <button
            type="button"
            className={`flare-tab-btn ${tab === 'discover' ? 'active' : ''}`}
            onClick={() => {
              setTab('discover')
              setActiveMatch(null)
            }}
          >
            Discover
          </button>
          <button
            type="button"
            className={`flare-tab-btn ${tab === 'matches' ? 'active' : ''}`}
            onClick={() => setTab('matches')}
          >
            Matches ({matches.length})
          </button>
        </nav>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="flare-toast" role="status">
          <span>🔥</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Match Overlay Celebration Modal */}
      {matchedPopup && (
        <div className="flare-match-backdrop">
          <div className="flare-match-card">
            <span className="flare-match-fire">🔥</span>
            <h2>IT'S A MATCH!</h2>
            <p>You and {matchedPopup.name} liked each other.</p>
            <div className="flare-match-btns">
              <button
                type="button"
                className="flare-chat-match-btn"
                onClick={() => {
                  const p = matchedPopup
                  setMatchedPopup(null)
                  setTab('matches')
                  openMatchChat(p)
                }}
              >
                Send a Message
              </button>
              <button
                type="button"
                className="flare-dismiss-match-btn"
                onClick={() => setMatchedPopup(null)}
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flare-main-content">
        {tab === 'discover' ? (
          currentProfile ? (
            <div className="flare-deck-container">
              <div className="flare-card-wrapper">
                <div className="flare-profile-photo-sim">
                  <div className="flare-photo-gradient" />
                  <div className="flare-photo-info">
                    <div className="flare-name-age">
                      <strong>{currentProfile.name}</strong>
                      <span>{currentProfile.age}</span>
                    </div>
                    <small className="flare-distance">📍 {currentProfile.distanceKm} km away</small>
                  </div>
                </div>

                <div className="flare-card-body">
                  <p className="flare-bio">{currentProfile.bio}</p>
                  <div className="flare-interests-row">
                    {currentProfile.interests.map((int) => (
                      <span key={int} className="flare-interest-pill">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Swipe Action Buttons */}
              <div className="flare-swipe-actions">
                <button
                  type="button"
                  className="flare-swipe-btn pass"
                  onClick={() => handleSwipe('pass')}
                  aria-label="Pass"
                >
                  ✕
                </button>
                <button
                  type="button"
                  className="flare-swipe-btn like"
                  onClick={() => handleSwipe('like')}
                  aria-label="Like"
                >
                  ❤️
                </button>
              </div>
            </div>
          ) : (
            <div className="flare-empty-deck">
              <span>🎉</span>
              <h4>That's everyone for now!</h4>
              <p>Check back later for new profiles nearby in Los Santos.</p>
            </div>
          )
        ) : (
          /* Matches Tab */
          activeMatch ? (
            <div className="flare-chat-view">
              <div className="flare-chat-header">
                <button
                  type="button"
                  className="flare-chat-back"
                  onClick={() => setActiveMatch(null)}
                >
                  ←
                </button>
                <strong>{activeMatch.name}</strong>
              </div>

              <div className="flare-chat-history">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flare-bubble ${m.sender === 'Alex Mercer' ? 'outgoing' : 'incoming'}`}
                  >
                    <p>{m.text}</p>
                    <small>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                ))}
              </div>

              <div className="flare-chat-input-bar">
                <input
                  type="text"
                  placeholder={`Message ${activeMatch.name}...`}
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  type="button"
                  className="flare-send-msg-btn"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flare-matches-grid">
              {matches.length === 0 ? (
                <div className="flare-empty-matches">
                  <span>💔</span>
                  <p>No matches yet. Keep swiping!</p>
                </div>
              ) : (
                matches.map((m) => (
                  <article
                    key={m.id}
                    className="flare-match-item"
                    onClick={() => openMatchChat(m)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flare-match-avatar">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flare-match-summary">
                      <strong>{m.name}, {m.age}</strong>
                      <small>{m.bio.slice(0, 45)}...</small>
                    </div>
                  </article>
                ))
              )}
            </div>
          )
        )}
      </main>
    </div>
  )
}
