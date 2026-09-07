import { useEffect, useState } from 'react'
import type { NervePreviewAdapter } from '../../nerve/contracts.ts'
import {
  type BankingOverview,
  type BankingTransaction,
  type PhoneContact,
  type PreviewBankingService,
} from '../../nerve/preview.ts'

type Props = {
  nerve: NervePreviewAdapter
  contacts?: PhoneContact[]
}

type Tab = 'overview' | 'activity'
type Filter = 'all' | 'in' | 'out'

export function BankingApp({ nerve, contacts = [] }: Props) {
  const banking = nerve.GetService<PreviewBankingService>('BankingService')

  const [overview, setOverview] = useState<BankingOverview | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedTx, setSelectedTx] = useState<BankingTransaction | null>(null)

  // Modal states
  const [showTransfer, setShowTransfer] = useState(false)
  const [showAtm, setShowAtm] = useState<'deposit' | 'withdraw' | null>(null)

  // Transfer form
  const [targetNumber, setTargetNumber] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferNote, setTransferNote] = useState('')
  const [atmAmount, setAtmAmount] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchOverview = () => {
    void banking.GetBankingOverview.request(undefined).then(([data]) => {
      setOverview(data)
    })
  }

  useEffect(() => {
    fetchOverview()
    const unsubscribe = banking.BankingChanged.connect(() => {
      fetchOverview()
    })
    return () => {
      unsubscribe()
    }
  }, [banking])

  const handleSendTransfer = () => {
    setErrorMsg('')
    setSuccessMsg('')
    const amount = parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid transfer amount.')
      return
    }
    if (!targetNumber.trim()) {
      setErrorMsg('Please select or enter a recipient.')
      return
    }

    void banking.TransferMoney.request({
      amount,
      phoneNumber: targetNumber.trim(),
      note: transferNote.trim(),
    }).then(([success, err]) => {
      if (!success) {
        setErrorMsg(err ?? 'Transfer failed.')
      } else {
        setSuccessMsg(`Sent $${amount.toLocaleString()} successfully!`)
        setTimeout(() => {
          setShowTransfer(false)
          setTransferAmount('')
          setTargetNumber('')
          setTransferNote('')
          setSuccessMsg('')
          fetchOverview()
        }, 1200)
      }
    })
  }

  const handleAtmAction = (type: 'deposit' | 'withdraw') => {
    setErrorMsg('')
    setSuccessMsg('')
    const amount = parseFloat(atmAmount)
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid amount.')
      return
    }

    const action = type === 'deposit' ? banking.DepositMoney : banking.WithdrawMoney
    void action.request({ amount }).then(([success, err]) => {
      if (!success) {
        setErrorMsg(err ?? `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} failed.`)
      } else {
        setSuccessMsg(`${type === 'deposit' ? 'Deposited' : 'Withdrew'} $${amount.toLocaleString()}!`)
        setTimeout(() => {
          setShowAtm(null)
          setAtmAmount('')
          setSuccessMsg('')
          fetchOverview()
        }, 1200)
      }
    })
  }

  if (!overview) {
    return (
      <div className="bank-app-container bank-loading">
        <div className="bank-spinner" />
        <p>Connecting to Sun City Bank...</p>
      </div>
    )
  }

  const isIncoming = (kind: string) => kind === 'deposit' || kind === 'transfer_in'

  const filteredTransactions = overview.transactions.filter((tx) => {
    if (filter === 'in') return isIncoming(tx.kind)
    if (filter === 'out') return !isIncoming(tx.kind)
    return true
  })

  // 7-day activity calculations
  const totalIncome = overview.transactions
    .filter((tx) => isIncoming(tx.kind))
    .reduce((sum, tx) => sum + tx.amount, 0)
  const totalExpenses = overview.transactions
    .filter((tx) => !isIncoming(tx.kind))
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="bank-app-container" aria-label="Sun City Banking">
      {/* Header */}
      <div className="bank-top-nav">
        <div className="bank-brand">
          <span className="bank-logo-badge">🏛️</span>
          <div>
            <h3>Sun City Bank</h3>
            <small>{overview.playerName}</small>
          </div>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="bank-hero-card">
        <div className="bank-hero-top">
          <span>CHECKING ACCOUNT</span>
          <span className="bank-card-chip">•••• 4892</span>
        </div>
        <div className="bank-balance-row">
          <strong className="bank-balance-num">
            {overview.currency}{overview.bank.toLocaleString()}
          </strong>
        </div>
        <div className="bank-hero-bottom">
          <span>Cash on Hand: <strong>{overview.currency}{overview.cash.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Quick Action FABs */}
      <div className="bank-action-row">
        <button
          type="button"
          className="bank-action-btn is-primary"
          onClick={() => {
            setErrorMsg('')
            setSuccessMsg('')
            setShowTransfer(true)
          }}
          aria-label="Transfer money"
        >
          <span className="bank-action-icon">↗</span>
          <small>Transfer</small>
        </button>
        <button
          type="button"
          className="bank-action-btn"
          onClick={() => {
            setErrorMsg('')
            setSuccessMsg('')
            setShowAtm('deposit')
          }}
          aria-label="ATM Deposit"
        >
          <span className="bank-action-icon">↓</span>
          <small>Deposit</small>
        </button>
        <button
          type="button"
          className="bank-action-btn"
          onClick={() => {
            setErrorMsg('')
            setSuccessMsg('')
            setShowAtm('withdraw')
          }}
          aria-label="ATM Withdraw"
        >
          <span className="bank-action-icon">↑</span>
          <small>Withdraw</small>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bank-tabs" role="tablist">
        <button
          type="button"
          className={`bank-tab-btn ${tab === 'overview' ? 'is-active' : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`bank-tab-btn ${tab === 'activity' ? 'is-active' : ''}`}
          onClick={() => setTab('activity')}
        >
          Activity
        </button>
      </div>

      {/* Tab 1: Overview */}
      {tab === 'overview' && (
        <div className="bank-tab-content">
          {/* Income vs Expenses Bar */}
          <div className="bank-metrics-card">
            <div className="bank-metrics-header">
              <span>CASH FLOW</span>
              <small>Last 30 Days</small>
            </div>
            <div className="bank-metrics-split">
              <div className="bank-metric-item is-income">
                <small>Income</small>
                <strong>+{overview.currency}{totalIncome.toLocaleString()}</strong>
              </div>
              <div className="bank-metric-item is-expense">
                <small>Expenses</small>
                <strong>−{overview.currency}{totalExpenses.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Recent Activity snippet */}
          <div className="bank-section-heading">
            <h4>Recent Transactions</h4>
            <button type="button" onClick={() => setTab('activity')} className="bank-view-all">
              View All
            </button>
          </div>
          <div className="bank-tx-list">
            {overview.transactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="bank-tx-card"
                onClick={() => setSelectedTx(tx)}
              >
                <div className={`bank-tx-icon ${isIncoming(tx.kind) ? 'is-in' : 'is-out'}`}>
                  {isIncoming(tx.kind) ? '↙' : '↗'}
                </div>
                <div className="bank-tx-info">
                  <strong>{tx.label}</strong>
                  <small>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small>
                </div>
                <div className={`bank-tx-amount ${isIncoming(tx.kind) ? 'is-in' : 'is-out'}`}>
                  {isIncoming(tx.kind) ? '+' : '−'}{overview.currency}{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Full Activity */}
      {tab === 'activity' && (
        <div className="bank-tab-content">
          <div className="bank-filter-chips">
            <button
              type="button"
              className={`bank-filter-chip ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`bank-filter-chip ${filter === 'in' ? 'is-active' : ''}`}
              onClick={() => setFilter('in')}
            >
              Income
            </button>
            <button
              type="button"
              className={`bank-filter-chip ${filter === 'out' ? 'is-active' : ''}`}
              onClick={() => setFilter('out')}
            >
              Expenses
            </button>
          </div>

          <div className="bank-tx-list">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bank-tx-card"
                onClick={() => setSelectedTx(tx)}
              >
                <div className={`bank-tx-icon ${isIncoming(tx.kind) ? 'is-in' : 'is-out'}`}>
                  {isIncoming(tx.kind) ? '↙' : '↗'}
                </div>
                <div className="bank-tx-info">
                  <strong>{tx.label}</strong>
                  <small>{tx.reference} • {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                </div>
                <div className={`bank-tx-amount ${isIncoming(tx.kind) ? 'is-in' : 'is-out'}`}>
                  {isIncoming(tx.kind) ? '+' : '−'}{overview.currency}{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="bank-empty-state">No transactions recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Transfer Sheet Modal */}
      {showTransfer && (
        <div className="bank-modal-overlay">
          <div className="bank-modal-card" role="dialog" aria-label="Transfer Money">
            <div className="bank-modal-header">
              <h4>Send Wire Transfer</h4>
              <button type="button" onClick={() => setShowTransfer(false)}>×</button>
            </div>

            {errorMsg && <div className="bank-alert-error">{errorMsg}</div>}
            {successMsg && <div className="bank-alert-success">{successMsg}</div>}

            <div className="bank-form-group">
              <label>Recipient Contact</label>
              {contacts.length > 0 && (
                <div className="bank-contact-chips">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      className={`bank-contact-pill ${targetNumber === contact.number ? 'is-selected' : ''}`}
                      onClick={() => setTargetNumber(contact.number)}
                    >
                      {contact.name}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Or enter phone number (e.g. 555-0142)"
                value={targetNumber}
                onChange={(e) => setTargetNumber(e.target.value)}
              />
            </div>

            <div className="bank-form-group">
              <label>Amount ({overview.currency})</label>
              <input
                type="number"
                min="1"
                max={overview.bank}
                placeholder="0"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <div className="bank-amount-quickies">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTransferAmount(String(amt))}
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bank-form-group">
              <label>Note / Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. For car repairs"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
              />
            </div>

            <div className="bank-modal-actions">
              <button type="button" onClick={() => setShowTransfer(false)}>Cancel</button>
              <button
                type="button"
                className="bank-btn-submit"
                onClick={handleSendTransfer}
                disabled={!targetNumber || !transferAmount}
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATM Deposit / Withdraw Modal */}
      {showAtm && (
        <div className="bank-modal-overlay">
          <div className="bank-modal-card" role="dialog" aria-label={`ATM ${showAtm}`}>
            <div className="bank-modal-header">
              <h4>ATM {showAtm === 'deposit' ? 'Cash Deposit' : 'Cash Withdrawal'}</h4>
              <button type="button" onClick={() => setShowAtm(null)}>×</button>
            </div>

            {errorMsg && <div className="bank-alert-error">{errorMsg}</div>}
            {successMsg && <div className="bank-alert-success">{successMsg}</div>}

            <p className="bank-atm-hint">
              {showAtm === 'deposit'
                ? `Cash Available: ${overview.currency}${overview.cash.toLocaleString()}`
                : `Bank Balance: ${overview.currency}${overview.bank.toLocaleString()}`}
            </p>

            <div className="bank-form-group">
              <label>Amount ({overview.currency})</label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={atmAmount}
                onChange={(e) => setAtmAmount(e.target.value)}
              />
              <div className="bank-amount-quickies">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAtmAmount(String(amt))}
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bank-modal-actions">
              <button type="button" onClick={() => setShowAtm(null)}>Cancel</button>
              <button
                type="button"
                className="bank-btn-submit"
                onClick={() => handleAtmAction(showAtm)}
                disabled={!atmAmount}
              >
                Confirm {showAtm === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="bank-modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="bank-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="bank-modal-header">
              <h4>Transaction Receipt</h4>
              <button type="button" onClick={() => setSelectedTx(null)}>×</button>
            </div>
            <div className="bank-tx-detail-hero">
              <span className={`bank-tx-detail-amount ${isIncoming(selectedTx.kind) ? 'is-in' : 'is-out'}`}>
                {isIncoming(selectedTx.kind) ? '+' : '−'}{overview.currency}{selectedTx.amount.toLocaleString()}
              </span>
              <small>{selectedTx.label}</small>
            </div>
            <div className="bank-tx-detail-rows">
              <div>
                <span>Type</span>
                <strong>{selectedTx.kind.toUpperCase()}</strong>
              </div>
              <div>
                <span>Reference</span>
                <code>{selectedTx.reference}</code>
              </div>
              <div>
                <span>Date & Time</span>
                <strong>{new Date(selectedTx.createdAt).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
