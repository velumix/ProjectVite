import { useState, useEffect, useCallback } from 'react'
import {
  CrewService,
  MapService,
  type CrewInfo,
  type TurfZone,
  type CrewMember,
} from '../../nerve/preview'

type Props = {
  onOpenMap?: () => void
}

type TabType = 'turf' | 'roster' | 'comms'

export function CrewLinkApp({ onOpenMap }: Props) {
  const [crew, setCrew] = useState<CrewInfo | null>(null)
  const [tab, setTab] = useState<TabType>('turf')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [broadcastDraft, setBroadcastDraft] = useState('')

  const loadCrew = useCallback(async () => {
    const [info] = await CrewService.GetCrew.request(undefined)
    if (info) setCrew(info)
  }, [])

  useEffect(() => {
    loadCrew()
    const unsubBank = CrewService.CrewBankUpdated.connect((newBalance) => {
      setCrew((prev) => (prev ? { ...prev, bankBalance: newBalance } : prev))
    })
    const unsubBc = CrewService.CrewBroadcastSent.connect((bc) => {
      setCrew((prev) => (prev ? { ...prev, broadcasts: [bc, ...prev.broadcasts] } : prev))
    })
    return () => {
      unsubBank()
      unsubBc()
    }
  }, [loadCrew])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleDeposit = async (amount: number) => {
    const [ok, err, newBal] = await CrewService.DepositBank.request({ amount })
    if (ok && newBal !== undefined) {
      showToast(`Deposited $${amount.toLocaleString()} into Crew Vault`)
    } else if (err) {
      showToast(err)
    }
  }

  const handlePromote = async (mem: CrewMember, rank: string) => {
    const [ok, err] = await CrewService.PromoteMember.request({
      memberId: mem.id,
      newRank: rank,
    })
    if (ok) {
      showToast(`${mem.name} promoted to ${rank.toUpperCase()}`)
      setCrew((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) => (m.id === mem.id ? { ...m, rank: rank as any } : m)),
            }
          : prev
      )
    } else if (err) {
      showToast(err)
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastDraft.trim()) return
    const [ok, err] = await CrewService.BroadcastAlert.request({ message: broadcastDraft.trim() })
    if (ok) {
      showToast('Tactical broadcast transmitted to all crew members')
      setBroadcastDraft('')
    } else if (err) {
      showToast(err)
    }
  }

  const handleRouteTurf = async (t: TurfZone) => {
    const [ok] = await MapService.SetWaypoint.request({
      x: t.x,
      y: t.y,
      label: `TURF: ${t.name}`,
    })
    if (ok) {
      showToast(`GPS set to ${t.name}`)
      if (onOpenMap) onOpenMap()
    }
  }

  if (!crew) return <div className="crew-loading">Loading CrewLink...</div>

  const onlineMembers = crew.members.filter((m) => m.online)
  const totalHourlyIncome = crew.turfs.reduce((acc, t) => acc + t.incomePerHour, 0)

  return (
    <div className="crew-app-root">
      {/* Header */}
      <header className="crew-header">
        <div className="crew-top-row">
          <div className="crew-branding">
            <span className="crew-tag-pill">{crew.tag}</span>
            <div>
              <h3>{crew.name}</h3>
              <small>Reputation: {crew.reputation.toLocaleString()} PTS</small>
            </div>
          </div>
          <span className="crew-online-badge">🟢 {onlineMembers.length} Online</span>
        </div>

        {/* Bank Banner */}
        <div className="crew-bank-banner">
          <div className="crew-bank-info">
            <span className="crew-bank-label">CREW VAULT BALANCE</span>
            <strong className="crew-bank-balance">
              ${crew.bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
            <small>+${totalHourlyIncome.toLocaleString()}/hr turf revenue</small>
          </div>
          <div className="crew-deposit-actions">
            <button
              type="button"
              className="crew-deposit-btn"
              onClick={() => handleDeposit(5000)}
            >
              +$5k
            </button>
            <button
              type="button"
              className="crew-deposit-btn"
              onClick={() => handleDeposit(25000)}
            >
              +$25k
            </button>
          </div>
        </div>

        {/* Tab Ribbon */}
        <nav className="crew-tab-ribbon">
          <button
            type="button"
            className={`crew-tab-btn ${tab === 'turf' ? 'active' : ''}`}
            onClick={() => setTab('turf')}
          >
            Turf ({crew.turfs.length})
          </button>
          <button
            type="button"
            className={`crew-tab-btn ${tab === 'roster' ? 'active' : ''}`}
            onClick={() => setTab('roster')}
          >
            Roster ({crew.members.length})
          </button>
          <button
            type="button"
            className={`crew-tab-btn ${tab === 'comms' ? 'active' : ''}`}
            onClick={() => setTab('comms')}
          >
            Comms ({crew.broadcasts.length})
          </button>
        </nav>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="crew-toast" role="status">
          <span>🛡️</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main Content */}
      <main className="crew-main-scroll">
        {/* Turf Tab */}
        {tab === 'turf' && (
          <div className="crew-section-list">
            {crew.turfs.map((t) => (
              <article key={t.id} className="crew-turf-card">
                <div className="crew-turf-header">
                  <div>
                    <span className={`crew-turf-status ${t.status}`}>
                      {t.status.toUpperCase()}
                    </span>
                    <h4 className="crew-turf-name">{t.name}</h4>
                  </div>
                  <strong className="crew-turf-income">+${t.incomePerHour}/hr</strong>
                </div>

                <div className="crew-control-bar-wrapper">
                  <div className="crew-control-bar-labels">
                    <span>Control</span>
                    <strong>{t.controlPct}%</strong>
                  </div>
                  <div className="crew-control-track">
                    <div
                      className="crew-control-fill"
                      style={{ width: `${t.controlPct}%` }}
                    />
                  </div>
                </div>

                <div className="crew-turf-footer">
                  <button
                    type="button"
                    className="crew-turf-gps-btn"
                    onClick={() => handleRouteTurf(t)}
                  >
                    📍 Route GPS Waypoint
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Roster Tab */}
        {tab === 'roster' && (
          <div className="crew-section-list">
            {crew.members.map((m) => (
              <article key={m.id} className="crew-member-card">
                <div className="crew-member-info">
                  <div className="crew-avatar-circle">
                    {m.online ? '🟢' : '⚪'}
                  </div>
                  <div>
                    <h4 className="crew-member-name">{m.name}</h4>
                    <span className={`crew-rank-tag ${m.rank}`}>
                      {m.rank.toUpperCase()}
                    </span>
                  </div>
                </div>

                {m.rank !== 'leader' && (
                  <div className="crew-member-actions">
                    <select
                      value={m.rank}
                      onChange={(e) => handlePromote(m, e.target.value)}
                      className="crew-rank-select"
                    >
                      <option value="recruit">Recruit</option>
                      <option value="enforcer">Enforcer</option>
                      <option value="officer">Officer</option>
                    </select>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Comms Tab */}
        {tab === 'comms' && (
          <div className="crew-comms-view">
            <div className="crew-broadcast-input-box">
              <input
                type="text"
                placeholder="Broadcast tactical dispatch to crew..."
                value={broadcastDraft}
                onChange={(e) => setBroadcastDraft(e.target.value)}
              />
              <button
                type="button"
                className="crew-send-bc-btn"
                onClick={handleBroadcast}
              >
                BROADCAST
              </button>
            </div>

            <div className="crew-broadcast-feed">
              {crew.broadcasts.map((b) => (
                <article key={b.id} className="crew-bc-card">
                  <div className="crew-bc-header">
                    <strong className="crew-bc-author">{b.author}</strong>
                    <small className="crew-bc-time">
                      {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <p className="crew-bc-msg">{b.message}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
