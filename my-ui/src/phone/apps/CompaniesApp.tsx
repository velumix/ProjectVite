import { useState, useEffect, useCallback } from 'react'
import {
  CompanyService,
  MapService,
  type CompanyListing,
  type ServiceTicket,
} from '../../nerve/preview'

type Props = {
  onOpenMap?: () => void
  onCall?: (number: string) => void
}

type TabMode = 'directory' | 'jobs' | 'tickets'

export function CompaniesApp({ onOpenMap, onCall }: Props) {
  const [companies, setCompanies] = useState<CompanyListing[]>([])
  const [tickets, setTickets] = useState<ServiceTicket[]>([])
  const [tab, setTab] = useState<TabMode>('directory')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Ticket modal
  const [selectedCompForTicket, setSelectedCompForTicket] = useState<CompanyListing | null>(null)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')

  const loadData = useCallback(async () => {
    const [comps] = await CompanyService.GetCompanies.request(undefined)
    if (comps) setCompanies(comps)
    const [tkts] = await CompanyService.GetTickets.request(undefined)
    if (tkts) setTickets(tkts)
  }, [])

  useEffect(() => {
    loadData()
    const unsubApp = CompanyService.JobApplicationSubmitted.connect((app) => {
      setToastMessage(`Application submitted for ${app.role} at ${app.companyName}!`)
    })
    const unsubTicket = CompanyService.TicketCreated.connect((tkt) => {
      setTickets((prev) => [tkt, ...prev])
    })
    return () => {
      unsubApp()
      unsubTicket()
    }
  }, [loadData])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleRouteGps = async (c: CompanyListing) => {
    const [ok] = await MapService.SetWaypoint.request({
      x: c.x,
      y: c.y,
      label: c.name,
    })
    if (ok) {
      showToast(`GPS set to ${c.name}`)
      if (onOpenMap) onOpenMap()
    }
  }

  const handleQuickApply = async (c: CompanyListing) => {
    const [ok, err] = await CompanyService.ApplyForJob.request({
      companyId: c.id,
      coverLetter: 'Experienced candidate ready for immediate start.',
    })
    if (!ok && err) {
      showToast(err)
    }
  }

  const handleCreateTicket = async () => {
    if (!selectedCompForTicket || !ticketSubject.trim()) {
      showToast('Subject is required')
      return
    }
    const [ok, err, tkt] = await CompanyService.CreateTicket.request({
      companyId: selectedCompForTicket.id,
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
    })
    if (ok && tkt) {
      showToast(`Ticket #${tkt.ticketId} opened with ${selectedCompForTicket.name}`)
      setSelectedCompForTicket(null)
      setTicketSubject('')
      setTicketMessage('')
      setTab('tickets')
    } else if (err) {
      showToast(err)
    }
  }

  const hiringCompanies = companies.filter((c) => c.hiring)

  return (
    <div className="companies-app-root">
      {/* Header */}
      <header className="companies-header">
        <div className="companies-top-row">
          <div className="companies-branding">
            <span className="companies-logo">🏢</span>
            <div>
              <h3>City Directory</h3>
              <small>Businesses & Employment</small>
            </div>
          </div>
          <span className="companies-total-badge">{companies.length} Registered</span>
        </div>

        {/* View Switcher Ribbon */}
        <nav className="companies-tab-ribbon">
          <button
            type="button"
            className={`companies-tab-btn ${tab === 'directory' ? 'active' : ''}`}
            onClick={() => setTab('directory')}
          >
            Directory
          </button>
          <button
            type="button"
            className={`companies-tab-btn ${tab === 'jobs' ? 'active' : ''}`}
            onClick={() => setTab('jobs')}
          >
            Jobs ({hiringCompanies.length})
          </button>
          <button
            type="button"
            className={`companies-tab-btn ${tab === 'tickets' ? 'active' : ''}`}
            onClick={() => setTab('tickets')}
          >
            Tickets ({tickets.length})
          </button>
        </nav>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="companies-toast" role="status">
          <span>🏢</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Ticket Modal */}
      {selectedCompForTicket && (
        <div className="companies-modal-backdrop">
          <div className="companies-modal-dialog">
            <div className="companies-modal-header">
              <div>
                <h4>Open Support Ticket</h4>
                <small>{selectedCompForTicket.name}</small>
              </div>
              <button
                type="button"
                className="companies-close-modal"
                onClick={() => setSelectedCompForTicket(null)}
              >
                ✕
              </button>
            </div>

            <div className="companies-form">
              <input
                type="text"
                placeholder="Inquiry Subject..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />
              <textarea
                placeholder="Describe your request or order details..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={3}
              />
              <button
                type="button"
                className="companies-submit-ticket-btn"
                onClick={handleCreateTicket}
              >
                SUBMIT INQUIRY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="companies-main-scroll">
        {/* Directory Tab */}
        {tab === 'directory' && (
          <div className="companies-list">
            {companies.map((c) => (
              <article key={c.id} className="companies-card">
                <div className="companies-card-top">
                  <div>
                    <span className="companies-category-tag">{c.category}</span>
                    <h4 className="companies-card-name">{c.name}</h4>
                    <p className="companies-address">📍 {c.address}</p>
                  </div>
                  <div className="companies-card-rating">
                    <span className={`companies-open-pill ${c.open ? 'open' : 'closed'}`}>
                      {c.open ? 'OPEN' : 'CLOSED'}
                    </span>
                    <span className="companies-stars">★ {c.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="companies-action-bar">
                  <button
                    type="button"
                    className="companies-action-btn"
                    onClick={() => onCall?.(c.phone)}
                  >
                    📞 {c.phone}
                  </button>
                  <button
                    type="button"
                    className="companies-action-btn"
                    onClick={() => handleRouteGps(c)}
                  >
                    📍 Route GPS
                  </button>
                  <button
                    type="button"
                    className="companies-action-btn"
                    onClick={() => setSelectedCompForTicket(c)}
                  >
                    ✉ Ticket
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Jobs Tab */}
        {tab === 'jobs' && (
          <div className="companies-list">
            {hiringCompanies.map((c) => (
              <article key={c.id} className="companies-job-card">
                <div className="companies-job-header">
                  <div>
                    <span className="companies-job-hiring-tag">NOW HIRING</span>
                    <h4 className="companies-job-role">{c.jobRole}</h4>
                    <small className="companies-job-company">{c.name} • {c.category}</small>
                  </div>
                  <div className="companies-wage-box">
                    <strong>${c.hourlyWage}</strong>
                    <small>/ hr</small>
                  </div>
                </div>

                <div className="companies-job-footer">
                  <span className="companies-job-loc">📍 {c.address}</span>
                  <button
                    type="button"
                    className="companies-apply-btn"
                    onClick={() => handleQuickApply(c)}
                  >
                    ⚡ Quick Apply
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Tickets Tab */}
        {tab === 'tickets' && (
          <div className="companies-list">
            {tickets.length === 0 ? (
              <div className="companies-empty">
                <span>✉️</span>
                <p>No active service tickets found.</p>
              </div>
            ) : (
              tickets.map((t) => (
                <article key={t.ticketId} className="companies-ticket-card">
                  <div className="companies-ticket-top">
                    <div>
                      <span className="companies-ticket-id">#{t.ticketId}</span>
                      <h4 className="companies-ticket-subject">{t.subject}</h4>
                      <small className="companies-ticket-company">{t.companyName}</small>
                    </div>
                    <span className={`companies-ticket-status ${t.status}`}>
                      {t.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="companies-ticket-msg">{t.message}</p>
                  <div className="companies-ticket-footer">
                    <small>Submitted: {new Date(t.createdAt).toLocaleDateString()}</small>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
