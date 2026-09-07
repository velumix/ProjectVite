import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DarkChatService,
  type DarkChannel,
  type DarkMessage,
} from '../../nerve/preview'

export function DarkChatApp() {
  const [channels, setChannels] = useState<DarkChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<DarkChannel | null>(null)
  const [messages, setMessages] = useState<DarkMessage[]>([])
  const [burnerName, setBurnerName] = useState('Ghost_404')
  const [passcodePromptChan, setPasscodePromptChan] = useState<DarkChannel | null>(null)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [draft, setDraft] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const loadChannels = useCallback(async () => {
    const [list] = await DarkChatService.GetChannels.request(undefined)
    if (list) setChannels(list)
  }, [])

  useEffect(() => {
    loadChannels()
  }, [loadChannels])

  useEffect(() => {
    const unsub = DarkChatService.DarkMessageReceived.connect((msg) => {
      if (activeChannel && msg.channelId === activeChannel.id) {
        setMessages((prev) => [...prev, msg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    })
    return () => {
      unsub()
    }
  }, [activeChannel])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleOpenChannel = async (chan: DarkChannel, code?: string) => {
    if (chan.hasPasscode && !code) {
      setPasscodePromptChan(chan)
      setPasscodeInput('')
      return
    }
    const [ok, err, msgs] = await DarkChatService.GetMessages.request({
      channelId: chan.id,
      passcode: code,
    })
    if (ok && msgs) {
      setActiveChannel(chan)
      setMessages(msgs)
      setPasscodePromptChan(null)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } else {
      showToast(err || 'Failed to enter channel')
    }
  }

  const handleSendMessage = async () => {
    if (!activeChannel || !draft.trim()) return
    const [ok, err] = await DarkChatService.SendMessage.request({
      channelId: activeChannel.id,
      body: draft.trim(),
      burnerName: burnerName.trim() || 'Ghost_404',
    })
    if (ok) {
      setDraft('')
    } else if (err) {
      showToast(err)
    }
  }

  return (
    <div className="darkchat-app-root">
      {/* Header */}
      <header className="darkchat-header">
        <div className="darkchat-top-row">
          <div className="darkchat-branding">
            <span className="darkchat-logo">🕶️</span>
            <div>
              <h3>DarkChat</h3>
              <small>End-to-End Encrypted Burner</small>
            </div>
          </div>
          <div className="darkchat-burner-tag">
            <span>Burner:</span>
            <input
              type="text"
              className="darkchat-burner-input"
              value={burnerName}
              onChange={(e) => setBurnerName(e.target.value)}
              title="Change your ephemeral burner alias"
            />
          </div>
        </div>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="darkchat-toast" role="status">
          <span>🔒</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Passcode Entry Modal */}
      {passcodePromptChan && (
        <div className="darkchat-passcode-modal">
          <div className="darkchat-passcode-dialog">
            <h4>Encrypted Channel Lock</h4>
            <p>Enter 4-digit decrypt key for #{passcodePromptChan.name}</p>
            <input
              type="password"
              placeholder="Passcode..."
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              autoFocus
            />
            <div className="darkchat-modal-btns">
              <button
                type="button"
                className="darkchat-cancel-btn"
                onClick={() => setPasscodePromptChan(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="darkchat-unlock-btn"
                onClick={() => handleOpenChannel(passcodePromptChan, passcodeInput)}
              >
                Decrypt & Enter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View: Channel List or Active Chat */}
      {!activeChannel ? (
        <main className="darkchat-channels-scroll">
          <div className="darkchat-section-label">
            <span>AVAILABLE CHANNELS</span>
            <small>Zero Metadata Logged</small>
          </div>

          <div className="darkchat-channel-list">
            {channels.map((c) => (
              <div
                key={c.id}
                className="darkchat-channel-card"
                onClick={() => handleOpenChannel(c)}
                role="button"
                tabIndex={0}
              >
                <div className="darkchat-channel-main">
                  <div className="darkchat-channel-name-row">
                    <strong className="darkchat-channel-title">#{c.name}</strong>
                    {c.hasPasscode && <span className="darkchat-lock-tag">🔒 PASSCODE</span>}
                  </div>
                  <p className="darkchat-channel-topic">{c.topic}</p>
                </div>
                <span className="darkchat-members-badge">👥 {c.memberCount}</span>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <div className="darkchat-room-container">
          {/* Room Navigation Header */}
          <div className="darkchat-room-header">
            <button
              type="button"
              className="darkchat-back-btn"
              onClick={() => setActiveChannel(null)}
            >
              ← Channels
            </button>
            <div className="darkchat-room-info">
              <strong>#{activeChannel.name}</strong>
              <small>Ephemeral Session Active</small>
            </div>
            <span className="darkchat-sec-badge">256-BIT</span>
          </div>

          {/* Message History */}
          <div className="darkchat-messages-scroll">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`darkchat-msg-row ${m.isSelf ? 'self' : 'peer'}`}
              >
                <div className="darkchat-msg-bubble">
                  <div className="darkchat-msg-meta">
                    <span className="darkchat-sender">{m.senderBurner}</span>
                    <small className="darkchat-time">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <p className="darkchat-msg-text">{m.body}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            className="darkchat-input-bar"
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
          >
            <input
              type="text"
              placeholder={`Transmit to #${activeChannel.name}...`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" disabled={!draft.trim()}>
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
