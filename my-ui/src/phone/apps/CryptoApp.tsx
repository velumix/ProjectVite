import { useState, useEffect, useCallback } from 'react'
import {
  CryptoService,
  type CryptoHolding,
  type CryptoTransaction,
} from '../../nerve/preview'

type Tab = 'portfolio' | 'markets' | 'trade' | 'history'

export function CryptoApp() {
  const [tab, setTab] = useState<Tab>('portfolio')
  const [holdings, setHoldings] = useState<CryptoHolding[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([])

  // Trade form state
  const [tradeCoin, setTradeCoin] = useState('BTC')
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy')
  const [tradeAmount, setTradeAmount] = useState('0.01')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const loadData = useCallback(async () => {
    const [h, total, addr, txs] = await CryptoService.GetPortfolio.request(undefined)
    if (h) setHoldings(h)
    if (total !== undefined) setTotalValue(total)
    if (addr) setWalletAddress(addr)
    if (txs) setTransactions(txs)
  }, [])

  useEffect(() => {
    loadData()
    const unsub = CryptoService.PortfolioUpdated.connect((nextHoldings, nextTotal, nextTxs) => {
      setHoldings(nextHoldings)
      setTotalValue(nextTotal)
      setTransactions(nextTxs)
    })
    return () => {
      unsub()
    }
  }, [loadData])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const selectedCoinInfo = holdings.find((c) => c.coin === tradeCoin)
  const estUsd = selectedCoinInfo ? (parseFloat(tradeAmount) || 0) * selectedCoinInfo.priceUsd : 0

  const handleExecuteTrade = async () => {
    const amt = parseFloat(tradeAmount)
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter a valid positive amount')
      return
    }

    setIsBusy(true)
    const [ok, err, tx] = await CryptoService.TradeCoin.request({
      coin: tradeCoin,
      side: tradeSide,
      amount: amt,
    })
    setIsBusy(false)

    if (ok && tx) {
      showToast(
        `Successfully ${tradeSide === 'buy' ? 'bought' : 'sold'} ${amt} ${tradeCoin} ($${tx.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
      )
      setTab('portfolio')
    } else if (err) {
      showToast(err)
    }
  }

  const copyWallet = () => {
    navigator.clipboard?.writeText(walletAddress)
    showToast('Wallet address copied to clipboard!')
  }

  const coinIcons: Record<string, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    SUN: '☀️',
    SHIB: '🐕',
  }

  return (
    <div className="crypto-app-root">
      {/* App Header */}
      <header className="crypto-header">
        <div className="crypto-top-row">
          <div className="crypto-branding">
            <span className="crypto-logo">⚡</span>
            <h3>Satoshi Wallet</h3>
          </div>
          <button type="button" className="crypto-address-pill" onClick={copyWallet} title="Copy Address">
            <span>{walletAddress || '0x4f8b...9c12'}</span>
            <small>📋</small>
          </button>
        </div>

        {/* Portfolio Value Summary */}
        <div className="crypto-balance-card">
          <span className="crypto-balance-label">TOTAL PORTFOLIO VALUE</span>
          <div className="crypto-balance-num">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="crypto-balance-trend">
            <span className="crypto-trend-badge positive">+7.8% (24h)</span>
            <small>Fleeca Bank Direct</small>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <nav className="crypto-nav-ribbon">
          <button
            type="button"
            className={`crypto-nav-btn ${tab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setTab('portfolio')}
          >
            Portfolio
          </button>
          <button
            type="button"
            className={`crypto-nav-btn ${tab === 'markets' ? 'active' : ''}`}
            onClick={() => setTab('markets')}
          >
            Markets
          </button>
          <button
            type="button"
            className={`crypto-nav-btn ${tab === 'trade' ? 'active' : ''}`}
            onClick={() => setTab('trade')}
          >
            Trade
          </button>
          <button
            type="button"
            className={`crypto-nav-btn ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            History
          </button>
        </nav>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="crypto-toast" role="status">
          <span>⚡</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main Tab Views */}
      <main className="crypto-main-scroll">
        {/* PORTFOLIO TAB */}
        {tab === 'portfolio' && (
          <section className="crypto-holdings-list">
            <div className="crypto-section-header">
              <h4>Your Assets</h4>
              <button
                type="button"
                className="crypto-quick-trade-btn"
                onClick={() => setTab('trade')}
              >
                + Swap / Trade
              </button>
            </div>

            {holdings.map((h) => (
              <article key={h.coin} className="crypto-coin-card">
                <div className="crypto-coin-icon">{coinIcons[h.coin] || '🪙'}</div>
                <div className="crypto-coin-info">
                  <div className="crypto-coin-title">
                    <strong>{h.name}</strong>
                    <span className="crypto-coin-symbol">{h.symbol}</span>
                  </div>
                  <small className="crypto-coin-price">
                    ${h.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </small>
                </div>
                <div className="crypto-coin-balance">
                  <strong>{h.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</strong>
                  <span className="crypto-coin-usd">
                    ${h.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`crypto-change-tag ${h.change24h >= 0 ? 'pos' : 'neg'}`}>
                    {h.change24h >= 0 ? '▲' : '▼'} {Math.abs(h.change24h)}%
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* MARKETS TAB */}
        {tab === 'markets' && (
          <section className="crypto-markets-list">
            <div className="crypto-section-header">
              <h4>Live Crypto Market</h4>
              <small>Real-time Sun City Exchange</small>
            </div>

            {holdings.map((h) => (
              <div key={h.coin} className="crypto-market-row">
                <div className="crypto-market-coin">
                  <span className="crypto-coin-icon-sm">{coinIcons[h.coin] || '🪙'}</span>
                  <div>
                    <strong>{h.name}</strong>
                    <small>{h.symbol}/USD</small>
                  </div>
                </div>
                <div className="crypto-market-sparkline">
                  <div
                    className={`crypto-spark-bar ${h.change24h >= 0 ? 'pos' : 'neg'}`}
                    style={{ width: `${Math.min(100, Math.abs(h.change24h) * 5 + 30)}%` }}
                  />
                </div>
                <div className="crypto-market-rates">
                  <strong>${h.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  <span className={`crypto-change-tag ${h.change24h >= 0 ? 'pos' : 'neg'}`}>
                    {h.change24h >= 0 ? '+' : ''}{h.change24h}%
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TRADE TAB */}
        {tab === 'trade' && (
          <section className="crypto-trade-panel">
            <div className="crypto-trade-toggle-row">
              <button
                type="button"
                className={`crypto-side-btn buy ${tradeSide === 'buy' ? 'active' : ''}`}
                onClick={() => setTradeSide('buy')}
              >
                BUY
              </button>
              <button
                type="button"
                className={`crypto-side-btn sell ${tradeSide === 'sell' ? 'active' : ''}`}
                onClick={() => setTradeSide('sell')}
              >
                SELL
              </button>
            </div>

            {/* Coin selector */}
            <div className="crypto-form-group">
              <label>Select Cryptocurrency</label>
              <div className="crypto-coin-pills">
                {holdings.map((h) => (
                  <button
                    key={h.coin}
                    type="button"
                    className={`crypto-coin-pill ${tradeCoin === h.coin ? 'active' : ''}`}
                    onClick={() => setTradeCoin(h.coin)}
                  >
                    <span>{coinIcons[h.coin] || '🪙'}</span>
                    <strong>{h.coin}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="crypto-form-group">
              <label>Amount ({tradeCoin})</label>
              <div className="crypto-amount-input-box">
                <input
                  type="number"
                  step="any"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                />
                <button
                  type="button"
                  className="crypto-max-btn"
                  onClick={() => {
                    if (tradeSide === 'sell' && selectedCoinInfo) {
                      setTradeAmount(selectedCoinInfo.amount.toString())
                    } else {
                      setTradeAmount('1.0')
                    }
                  }}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Cost estimate */}
            <div className="crypto-summary-box">
              <div className="crypto-summary-row">
                <span>Unit Price:</span>
                <strong>${selectedCoinInfo?.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}</strong>
              </div>
              <div className="crypto-summary-row highlight">
                <span>Total Estimated USD:</span>
                <strong>${estUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <small>Debits directly from your Fleeca Bank checking balance</small>
            </div>

            {/* Action button */}
            <button
              type="button"
              className={`crypto-execute-btn ${tradeSide}`}
              disabled={isBusy}
              onClick={handleExecuteTrade}
            >
              {isBusy
                ? 'EXECUTING...'
                : `${tradeSide.toUpperCase()} ${tradeCoin} NOW`}
            </button>
          </section>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <section className="crypto-history-list">
            <div className="crypto-section-header">
              <h4>Recent Transactions</h4>
              <small>{transactions.length} Records</small>
            </div>

            {transactions.length === 0 ? (
              <p className="crypto-empty">No transaction history yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="crypto-tx-card">
                  <div className={`crypto-tx-icon ${tx.side}`}>
                    {tx.side === 'buy' ? '↙' : tx.side === 'sell' ? '↗' : '➔'}
                  </div>
                  <div className="crypto-tx-info">
                    <div className="crypto-tx-title">
                      <strong>
                        {tx.side.toUpperCase()} {tx.coin}
                      </strong>
                    </div>
                    <small className="crypto-tx-time">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </small>
                  </div>
                  <div className="crypto-tx-amounts">
                    <strong>
                      {tx.side === 'buy' ? '+' : '-'}{tx.amount} {tx.coin}
                    </strong>
                    <span className="crypto-tx-usd">
                      ${tx.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  )
}
