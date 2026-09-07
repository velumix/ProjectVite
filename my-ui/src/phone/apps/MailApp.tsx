import { useState, useEffect, useCallback } from 'react'
import { MailService, type MailItem, type MailboxStats } from '../../nerve/preview'

type FolderType = 'inbox' | 'sent' | 'trash' | 'starred'

const QUICK_CONTACTS = [
  { name: 'City Services', email: 'services@suncity.gov' },
  { name: 'Sun City Bank', email: 'notifications@suncitybank.com' },
  { name: 'PDM Autos', email: 'sales@pdm-autos.com' },
  { name: "Benny's Customs", email: 'mechanic@bennyscustoms.com' },
  { name: 'Alex Morgan', email: 'alex.morgan@suncity.mail' },
]

export function MailApp() {
  const [mails, setMails] = useState<MailItem[]>([])
  const [stats, setStats] = useState<MailboxStats>({ inboxCount: 0, unreadCount: 0, sentCount: 0, trashCount: 0 })
  const [currentFolder, setCurrentFolder] = useState<FolderType>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null)
  
  // Compose modal state
  const [isComposing, setIsComposing] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const t = setTimeout(() => setToastMessage(null), 2500)
    return () => clearTimeout(t)
  }, [])

  const fetchMailbox = useCallback(async () => {
    const folderParam = currentFolder === 'starred' ? 'inbox' : currentFolder
    const [list, mailboxStats] = await MailService.GetMailbox.request({
      folder: folderParam,
      query: searchQuery.trim() || undefined,
    })

    let displayList = list || []
    if (currentFolder === 'starred') {
      displayList = displayList.filter((m) => m.starred)
    }

    setMails(displayList)
    if (mailboxStats) {
      setStats(mailboxStats)
    }

    // Keep selectedMail updated if currently viewing
    if (selectedMail) {
      const refreshed = displayList.find((m) => m.id === selectedMail.id)
      if (refreshed) {
        setSelectedMail(refreshed)
      }
    }
  }, [currentFolder, searchQuery, selectedMail])

  useEffect(() => {
    fetchMailbox()
  }, [currentFolder, searchQuery])

  // Real-time signal subscription
  useEffect(() => {
    const unsub = MailService.MailChanged.connect(() => {
      fetchMailbox()
    })
    return () => unsub()
  }, [fetchMailbox])

  // Open mail and mark read
  const handleOpenMail = async (mail: MailItem) => {
    setSelectedMail(mail)
    if (!mail.read) {
      await MailService.MarkMailRead.request({ ids: [mail.id], read: true })
      setMails((prev) => prev.map((m) => (m.id === mail.id ? { ...m, read: true } : m)))
    }
  }

  // Toggle star
  const handleToggleStar = async (e: React.MouseEvent, mailId: string) => {
    e.stopPropagation()
    const [ok, isStarred] = await MailService.ToggleMailStar.request({ id: mailId })
    if (ok) {
      setMails((prev) => prev.map((m) => (m.id === mailId ? { ...m, starred: isStarred } : m)))
      if (selectedMail && selectedMail.id === mailId) {
        setSelectedMail((prev) => (prev ? { ...prev, starred: isStarred } : null))
      }
    }
  }

  // Delete mail
  const handleDeleteMail = async (mailId: string) => {
    const isTrash = currentFolder === 'trash'
    const [ok] = await MailService.DeleteMail.request({ ids: [mailId], permanent: isTrash })
    if (ok) {
      showToast(isTrash ? 'Message permanently deleted' : 'Moved to Trash')
      if (selectedMail?.id === mailId) {
        setSelectedMail(null)
      }
      fetchMailbox()
    }
  }

  // Send mail
  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      showToast('Please fill in recipient, subject and body')
      return
    }

    setIsSending(true)
    const [ok, , err] = await MailService.SendMail.request({
      to: composeTo.trim(),
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    })
    setIsSending(false)

    if (ok) {
      setIsComposing(false)
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
      showToast('Email Sent Successfully')
      if (currentFolder === 'sent') {
        fetchMailbox()
      }
    } else {
      showToast(err || 'Failed to send email')
    }
  }

  // Quick reply
  const handleReply = () => {
    if (!selectedMail) return
    setComposeTo(selectedMail.senderAddress)
    setComposeSubject(selectedMail.subject.startsWith('Re:') ? selectedMail.subject : `Re: ${selectedMail.subject}`)
    setComposeBody(`\n\n--- Original Message ---\n${selectedMail.body}`)
    setIsComposing(true)
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="mail-app-root">
      {/* Top App Bar */}
      <header className="mail-app-header">
        <div className="mail-header-title-row">
          <div className="mail-header-brand">
            <span className="mail-brand-icon">✉</span>
            <h2>Mail</h2>
          </div>
          <button
            type="button"
            className="mail-compose-btn"
            title="Compose New Mail"
            aria-label="Compose New Mail"
            onClick={() => {
              setComposeTo('')
              setComposeSubject('')
              setComposeBody('')
              setIsComposing(true)
            }}
          >
            ✏ New
          </button>
        </div>

        {/* Folder Navigation Pills */}
        <nav className="mail-folder-pills">
          <button
            type="button"
            className={`mail-folder-pill ${currentFolder === 'inbox' ? 'active' : ''}`}
            onClick={() => {
              setCurrentFolder('inbox')
              setSelectedMail(null)
            }}
          >
            Inbox {stats.unreadCount > 0 && <span className="mail-badge">{stats.unreadCount}</span>}
          </button>
          <button
            type="button"
            className={`mail-folder-pill ${currentFolder === 'starred' ? 'active' : ''}`}
            onClick={() => {
              setCurrentFolder('starred')
              setSelectedMail(null)
            }}
          >
            Starred
          </button>
          <button
            type="button"
            className={`mail-folder-pill ${currentFolder === 'sent' ? 'active' : ''}`}
            onClick={() => {
              setCurrentFolder('sent')
              setSelectedMail(null)
            }}
          >
            Sent
          </button>
          <button
            type="button"
            className={`mail-folder-pill ${currentFolder === 'trash' ? 'active' : ''}`}
            onClick={() => {
              setCurrentFolder('trash')
              setSelectedMail(null)
            }}
          >
            Trash
          </button>
        </nav>

        {/* Search Bar */}
        <div className="mail-search-bar">
          <span className="mail-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search mail by sender, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="mail-search-clear" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Main Content: List or Detail */}
      <main className="mail-main-content">
        {selectedMail ? (
          /* Email Detail View */
          <div className="mail-detail-view">
            <div className="mail-detail-top-nav">
              <button
                type="button"
                className="mail-detail-back-btn"
                title="Back to List"
                aria-label="Back to List"
                onClick={() => setSelectedMail(null)}
              >
                ‹ {currentFolder.toUpperCase()}
              </button>
              <div className="mail-detail-actions">
                <button
                  type="button"
                  className={`mail-detail-tool-btn ${selectedMail.starred ? 'is-starred' : ''}`}
                  title={selectedMail.starred ? 'Unstar' : 'Star'}
                  onClick={(e) => handleToggleStar(e, selectedMail.id)}
                >
                  {selectedMail.starred ? '★' : '☆'}
                </button>
                <button
                  type="button"
                  className="mail-detail-tool-btn mail-detail-delete-btn"
                  title="Delete Mail"
                  aria-label="Delete Mail"
                  onClick={() => handleDeleteMail(selectedMail.id)}
                >
                  🗑
                </button>
              </div>
            </div>

            <div className="mail-detail-scroll-pane">
              <h3 className="mail-detail-subject">{selectedMail.subject}</h3>

              <div className="mail-detail-sender-row">
                <div className="mail-avatar-badge">{selectedMail.senderName.charAt(0).toUpperCase()}</div>
                <div className="mail-detail-sender-info">
                  <div className="mail-detail-sender-name-row">
                    <strong>{selectedMail.senderName}</strong>
                    <time className="mail-detail-time">{new Date(selectedMail.timestamp).toLocaleString()}</time>
                  </div>
                  <div className="mail-detail-addresses">
                    <span>From: {selectedMail.senderAddress}</span>
                    <span>To: {selectedMail.recipient}</span>
                  </div>
                </div>
              </div>

              <div className="mail-detail-body">
                {selectedMail.body.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <footer className="mail-detail-footer">
              <button type="button" className="mail-detail-footer-btn" onClick={handleReply}>
                ↩ Reply
              </button>
              <button
                type="button"
                className="mail-detail-footer-btn"
                onClick={async () => {
                  await MailService.MarkMailRead.request({ ids: [selectedMail.id], read: false })
                  setSelectedMail(null)
                  showToast('Marked as unread')
                }}
              >
                Mark Unread
              </button>
              <button
                type="button"
                className="mail-detail-footer-btn is-danger"
                onClick={() => handleDeleteMail(selectedMail.id)}
              >
                Delete
              </button>
            </footer>
          </div>
        ) : (
          /* Email List View */
          <div className="mail-list-view">
            {mails.length === 0 ? (
              <div className="mail-empty-state">
                <div className="mail-empty-icon">📭</div>
                <p>No messages in {currentFolder}</p>
                {searchQuery && <small>Try adjusting your search query</small>}
              </div>
            ) : (
              <div className="mail-item-list">
                {mails.map((mail) => (
                  <article
                    key={mail.id}
                    className={`mail-item-card ${!mail.read ? 'is-unread' : ''}`}
                    onClick={() => handleOpenMail(mail)}
                  >
                    <div className="mail-item-avatar">{mail.senderName.charAt(0).toUpperCase()}</div>
                    <div className="mail-item-content">
                      <div className="mail-item-row-top">
                        <span className="mail-item-sender">{mail.senderName}</span>
                        <div className="mail-item-meta">
                          <time className="mail-item-time">{formatTimestamp(mail.timestamp)}</time>
                          <button
                            type="button"
                            className={`mail-star-btn ${mail.starred ? 'active' : ''}`}
                            onClick={(e) => handleToggleStar(e, mail.id)}
                            title={mail.starred ? 'Unstar' : 'Star'}
                            aria-label={mail.starred ? 'Unstar' : 'Star'}
                          >
                            {mail.starred ? '★' : '☆'}
                          </button>
                        </div>
                      </div>
                      <div className="mail-item-subject-row">
                        {!mail.read && <span className="mail-unread-dot" />}
                        <strong className="mail-item-subject">{mail.subject}</strong>
                      </div>
                      <p className="mail-item-snippet">{mail.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Compose Modal */}
      {isComposing && (
        <div className="mail-compose-overlay" role="dialog" aria-modal="true" aria-label="Compose Message">
          <form className="mail-compose-card" onSubmit={handleSendMail}>
            <header className="mail-compose-header">
              <button
                type="button"
                className="mail-compose-cancel-btn"
                onClick={() => setIsComposing(false)}
                disabled={isSending}
              >
                Cancel
              </button>
              <h4>New Message</h4>
              <button type="submit" className="mail-compose-send-btn" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </header>

            {/* Quick Contact Chips */}
            <div className="mail-quick-contacts-row">
              <span className="mail-quick-label">Suggested:</span>
              <div className="mail-quick-chips">
                {QUICK_CONTACTS.map((qc) => (
                  <button
                    key={qc.email}
                    type="button"
                    className="mail-quick-chip"
                    onClick={() => setComposeTo(qc.email)}
                  >
                    {qc.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mail-compose-fields">
              <div className="mail-compose-field-row">
                <label htmlFor="compose-to">To:</label>
                <input
                  id="compose-to"
                  type="email"
                  placeholder="recipient@suncity.mail"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="mail-compose-field-row">
                <label htmlFor="compose-subject">Subject:</label>
                <input
                  id="compose-subject"
                  type="text"
                  placeholder="Subject line"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                />
              </div>

              <div className="mail-compose-body-row">
                <textarea
                  placeholder="Write your email here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="mail-toast-pill" role="alert">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
