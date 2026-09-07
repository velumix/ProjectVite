import { useState } from 'react'

type Props = {
  onBack?: () => void
}

type HistoryItem = {
  expression: string
  result: string
  time: string
}

export function CalculatorApp({}: Props) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [pendingOp, setPendingOp] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setExpression('')
    setPrevValue(null)
    setPendingOp(null)
    setWaitingForOperand(false)
  }

  const handleBackspace = () => {
    if (waitingForOperand) return
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  const handleToggleSign = () => {
    const num = parseFloat(display)
    if (!isNaN(num) && num !== 0) {
      setDisplay(String(-num))
    }
  }

  const handlePercent = () => {
    const num = parseFloat(display)
    if (!isNaN(num)) {
      setDisplay(String(num / 100))
    }
  }

  const performCalculation = (op: string, a: number, b: number): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const handleOperator = (nextOp: string) => {
    const current = parseFloat(display)
    if (prevValue === null) {
      setPrevValue(current)
      setExpression(`${current} ${nextOp}`)
    } else if (pendingOp && !waitingForOperand) {
      const result = performCalculation(pendingOp, prevValue, current)
      setPrevValue(result)
      setDisplay(String(result))
      setExpression(`${result} ${nextOp}`)
    } else {
      setExpression(`${prevValue} ${nextOp}`)
    }
    setPendingOp(nextOp)
    setWaitingForOperand(true)
  }

  const handleEquals = () => {
    const current = parseFloat(display)
    if (prevValue !== null && pendingOp) {
      const result = performCalculation(pendingOp, prevValue, current)
      const formattedResult = String(Number(result.toFixed(8)))
      const fullExp = `${prevValue} ${pendingOp} ${current}`
      
      setHistory((prev) => [
        {
          expression: fullExp,
          result: formattedResult,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ])

      setDisplay(formattedResult)
      setExpression(`${fullExp} =`)
      setPrevValue(null)
      setPendingOp(null)
      setWaitingForOperand(true)
    }
  }

  return (
    <div className="calc-container" aria-label="Calculator">
      {/* Header with History toggle */}
      <div className="calc-top-bar">
        <button
          type="button"
          className="calc-icon-btn"
          onClick={() => setShowHistory(!showHistory)}
          aria-label="Calculation history"
          title="History"
        >
          ⏱
        </button>
        <span className="calc-title">Calculator</span>
        <button
          type="button"
          className="calc-icon-btn"
          onClick={handleBackspace}
          aria-label="Backspace"
          title="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* Screen Display */}
      <div className="calc-display-panel">
        <div className="calc-expression">{expression}</div>
        <output className="calc-result" aria-live="polite">{display}</output>
      </div>

      {/* Keypad Grid */}
      <div className="calc-keypad-grid">
        <button type="button" className="calc-btn calc-btn-utility" onClick={handleClear}>
          {display === '0' && !prevValue ? 'AC' : 'C'}
        </button>
        <button type="button" className="calc-btn calc-btn-utility" onClick={handleToggleSign}>
          ±
        </button>
        <button type="button" className="calc-btn calc-btn-utility" onClick={handlePercent}>
          %
        </button>
        <button
          type="button"
          className={`calc-btn calc-btn-op ${pendingOp === '÷' && waitingForOperand ? 'is-active' : ''}`}
          onClick={() => handleOperator('÷')}
        >
          ÷
        </button>

        <button type="button" className="calc-btn" onClick={() => handleDigit('7')}>7</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit('8')}>8</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit('9')}>9</button>
        <button
          type="button"
          className={`calc-btn calc-btn-op ${pendingOp === '×' && waitingForOperand ? 'is-active' : ''}`}
          onClick={() => handleOperator('×')}
        >
          ×
        </button>

        <button type="button" className="calc-btn" onClick={() => handleDigit('4')}>4</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit('5')}>5</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit('6')}>6</button>
        <button
          type="button"
          className={`calc-btn calc-btn-op ${pendingOp === '-' && waitingForOperand ? 'is-active' : ''}`}
          onClick={() => handleOperator('-')}
        >
          −
        </button>

        <button type="button" className="calc-btn" onClick={() => handleDigit('1')}>1</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit('2')}>2</button>
        <button type="button" className="calc-btn" onClick={() => handleDigit('3')}>3</button>
        <button
          type="button"
          className={`calc-btn calc-btn-op ${pendingOp === '+' && waitingForOperand ? 'is-active' : ''}`}
          onClick={() => handleOperator('+')}
        >
          +
        </button>

        <button type="button" className="calc-btn calc-btn-zero" onClick={() => handleDigit('0')}>0</button>
        <button type="button" className="calc-btn" onClick={handleDecimal}>.</button>
        <button type="button" className="calc-btn calc-btn-op calc-btn-equals" onClick={handleEquals}>=</button>
      </div>

      {/* History Drawer / Modal */}
      {showHistory && (
        <div className="calc-history-drawer" role="dialog" aria-label="Calculation History">
          <div className="calc-history-header">
            <h4>History</h4>
            {history.length > 0 && (
              <button type="button" onClick={() => setHistory([])} className="calc-history-clear">
                Clear
              </button>
            )}
            <button type="button" onClick={() => setShowHistory(false)} className="calc-history-close">
              ×
            </button>
          </div>
          <div className="calc-history-list">
            {history.length === 0 ? (
              <p className="calc-history-empty">No calculations yet.</p>
            ) : (
              history.map((item, index) => (
                <div
                  key={index}
                  className="calc-history-row"
                  onClick={() => {
                    setDisplay(item.result)
                    setShowHistory(false)
                  }}
                >
                  <small>{item.expression}</small>
                  <strong>= {item.result}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
