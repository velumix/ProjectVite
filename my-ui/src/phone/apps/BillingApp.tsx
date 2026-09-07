import { useState, useEffect, useCallback } from 'react'
import {
  BillingService,
  type InvoiceItem,
} from '../../nerve/preview'

type FilterStatus = 'all' | 'unpaid' | 'paid'

export function BillingApp() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPayingAll, setIsPayingAll] = useState(false)

  const loadInvoices = useCallback(async () => {
    const [list] = await BillingService.GetInvoices.request(undefined)
    if (list) setInvoices(list)
  }, [])

  useEffect(() => {
    loadInvoices()
    const unsubSingle = BillingService.InvoicePaid.connect((paidInv) => {
      setInvoices((prev) => prev.map((i) => (i.id === paidInv.id ? { ...paidInv } : i)))
    })
    const unsubBatch = BillingService.InvoicesBatchPaid.connect((updatedList) => {
      setInvoices(updatedList)
    })
    return () => {
      unsubSingle()
      unsubBatch()
    }
  }, [loadInvoices])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handlePaySingle = async (inv: InvoiceItem) => {
    const [ok, err, updated] = await BillingService.PayInvoice.request({ invoiceId: inv.id })
    if (ok && updated) {
      showToast(`Paid $${updated.amount.toLocaleString()} for ${updated.title}`)
    } else if (err) {
      showToast(err)
    }
  }

  const handlePayAll = async () => {
    setIsPayingAll(true)
    const [ok, count, total] = await BillingService.PayAll.request(undefined)
    setIsPayingAll(false)
    if (ok) {
      showToast(`Paid all ${count} pending invoices ($${total.toLocaleString()})!`)
    }
  }

  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid')
  const totalUnpaidAmount = unpaidInvoices.reduce((acc, i) => acc + i.amount, 0)
  const overdueCount = unpaidInvoices.filter((i) => i.status === 'overdue').length

  const filteredInvoices = invoices.filter((i) => {
    if (filter === 'unpaid') return i.status !== 'paid'
    if (filter === 'paid') return i.status === 'paid'
    return true
  })

  const categoryIcons: Record<string, string> = {
    citation: '🚨',
    utility: '⚡',
    service: '🔧',
    tax: '🏛️',
  }

  return (
    <div className="billing-app-root">
      {/* Header */}
      <header className="billing-header">
        <div className="billing-top-row">
          <div className="billing-branding">
            <span className="billing-logo">💳</span>
            <div>
              <h3>Billing & Citations</h3>
              <small>Sun City Municipal Portal</small>
            </div>
          </div>
          {overdueCount > 0 && (
            <span className="billing-overdue-alert">{overdueCount} Overdue</span>
          )}
        </div>

        {/* Total Outstanding Card */}
        <div className="billing-summary-card">
          <div className="billing-summary-info">
            <span className="billing-summary-label">TOTAL OUTSTANDING BALANCE</span>
            <div className="billing-summary-num">
              ${totalUnpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <small>{unpaidInvoices.length} unpaid bill{unpaidInvoices.length === 1 ? '' : 's'}</small>
          </div>

          {unpaidInvoices.length > 0 && (
            <button
              type="button"
              className="billing-pay-all-btn"
              disabled={isPayingAll}
              onClick={handlePayAll}
            >
              {isPayingAll ? 'PAYING...' : 'PAY ALL'}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <nav className="billing-filter-ribbon">
          <button
            type="button"
            className={`billing-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({invoices.length})
          </button>
          <button
            type="button"
            className={`billing-filter-pill ${filter === 'unpaid' ? 'active' : ''}`}
            onClick={() => setFilter('unpaid')}
          >
            Unpaid ({unpaidInvoices.length})
          </button>
          <button
            type="button"
            className={`billing-filter-pill ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => setFilter('paid')}
          >
            Paid ({invoices.length - unpaidInvoices.length})
          </button>
        </nav>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="billing-toast" role="status">
          <span>💳</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main List */}
      <main className="billing-main-scroll">
        {filteredInvoices.length === 0 ? (
          <div className="billing-empty">
            <span>🎉</span>
            <p>No invoices matching this filter.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <article key={inv.id} className={`billing-invoice-card ${inv.status}`}>
              <div className="billing-card-icon">
                {categoryIcons[inv.category] || '📄'}
              </div>

              <div className="billing-card-details">
                <div className="billing-card-header-row">
                  <h4 className="billing-invoice-title">{inv.title}</h4>
                  <span className={`billing-status-tag ${inv.status}`}>
                    {inv.status.toUpperCase()}
                  </span>
                </div>
                <small className="billing-sender">{inv.sender}</small>
                <div className="billing-date-row">
                  <small>Due: {new Date(inv.dueDate).toLocaleDateString()}</small>
                </div>
              </div>

              <div className="billing-card-actions">
                <strong className="billing-amount">
                  ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
                {inv.status !== 'paid' ? (
                  <button
                    type="button"
                    className="billing-pay-btn"
                    onClick={() => handlePaySingle(inv)}
                  >
                    PAY NOW
                  </button>
                ) : (
                  <span className="billing-paid-tag">✓ PAID</span>
                )}
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  )
}
