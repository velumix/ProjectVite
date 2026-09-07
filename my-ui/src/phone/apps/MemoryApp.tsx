import { useState, useEffect, useCallback, useRef } from 'react'
import { GameScoreService } from '../../nerve/preview'

type Card = {
  id: string
  symbol: string
  flipped: boolean
  matched: boolean
}

const ALL_SYMBOLS = ['⭐', '❤️', '🌙', '☀️', '☁️', '⚡', '💎', '🟣', '🔺', '🌸']

export function MemoryApp() {
  const [difficulty, setDifficulty] = useState<'small' | 'medium' | 'large'>('small')
  const [cards, setCards] = useState<Card[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [timeSeconds, setTimeSeconds] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [bestScore, setBestScore] = useState(45)

  // Load high score
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores.memory === 'number') {
        setBestScore(scores.memory)
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'memory') setBestScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const initGame = useCallback((diff: 'small' | 'medium' | 'large') => {
    const pairCount = diff === 'small' ? 6 : diff === 'medium' ? 8 : 10
    const chosenSymbols = ALL_SYMBOLS.slice(0, pairCount)
    const deck: Card[] = []

    chosenSymbols.forEach((sym, idx) => {
      deck.push({ id: `card-${idx}-a`, symbol: sym, flipped: false, matched: false })
      deck.push({ id: `card-${idx}-b`, symbol: sym, flipped: false, matched: false })
    })

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }

    setCards(deck)
    setSelectedIds([])
    setMoves(0)
    setTimeSeconds(0)
    setIsPlaying(false)
    setIsWon(false)
  }, [])

  useEffect(() => {
    initGame(difficulty)
  }, [difficulty, initGame])

  // Timer
  useEffect(() => {
    if (!isPlaying || isWon) return
    const timer = setInterval(() => setTimeSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [isPlaying, isWon])

  const lockRef = useRef(false)

  const handleCardClick = (id: string) => {
    if (lockRef.current) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.flipped || card.matched) return

    if (!isPlaying) setIsPlaying(true)

    const nextFlipped = [...selectedIds, id]
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    )

    if (nextFlipped.length === 1) {
      setSelectedIds(nextFlipped)
    } else if (nextFlipped.length === 2) {
      setMoves((m) => m + 1)
      setSelectedIds(nextFlipped)
      lockRef.current = true

      const [firstId, secondId] = nextFlipped
      const firstCard = cards.find((c) => c.id === firstId)
      const secondCard = card

      if (firstCard && firstCard.symbol === secondCard.symbol) {
        // Match found!
        setTimeout(() => {
          setCards((prev) => {
            const nextCards = prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, matched: true, flipped: true }
                : c
            )
            // Check win
            if (nextCards.every((c) => c.matched)) {
              setIsWon(true)
              setIsPlaying(false)
              // Calculate score: base 100 - moves - seconds
              const score = Math.max(10, 100 - moves * 2 - timeSeconds)
              GameScoreService.SubmitScore.request({ gameId: 'memory', score })
            }
            return nextCards
          })
          setSelectedIds([])
          lockRef.current = false
        }, 350)
      } else {
        // Mismatch - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, flipped: false }
                : c
            )
          )
          setSelectedIds([])
          lockRef.current = false
        }, 750)
      }
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const columnsClass = difficulty === 'small' ? 'cols-3' : 'cols-4'

  return (
    <div className="memory-app-root">
      <header className="memory-header">
        <div className="memory-top-row">
          <div>
            <span className="memory-title">🎴 MEMORY PAIRS</span>
            <small className="memory-high">BEST SCORE: {bestScore}</small>
          </div>
          <div className="memory-stats-box">
            <div className="memory-stat">
              <label>MOVES</label>
              <span>{moves}</span>
            </div>
            <div className="memory-stat">
              <label>TIME</label>
              <span>{formatTime(timeSeconds)}</span>
            </div>
          </div>
        </div>

        <div className="memory-diff-row">
          {(['small', 'medium', 'large'] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={`memory-diff-btn ${difficulty === d ? 'active' : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d.toUpperCase()} ({d === 'small' ? '6' : d === 'medium' ? '8' : '10'} PAIRS)
            </button>
          ))}
        </div>
      </header>

      {/* Card Grid */}
      <main className="memory-grid-container">
        <div className={`memory-card-grid ${columnsClass}`}>
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`memory-card-tile ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              aria-label={`Card ${card.flipped || card.matched ? card.symbol : 'hidden'}`}
            >
              <div className="card-face card-back">❓</div>
              <div className="card-face card-front">{card.symbol}</div>
            </button>
          ))}
        </div>

        {/* Victory Dialog */}
        {isWon && (
          <div className="memory-win-overlay">
            <div className="memory-win-dialog">
              <h3>🎉 STAGE CLEARED!</h3>
              <p>Completed in {moves} moves ({formatTime(timeSeconds)})</p>
              <button
                type="button"
                className="memory-replay-btn"
                onClick={() => initGame(difficulty)}
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="memory-footer">
        <button
          type="button"
          className="memory-restart-btn"
          onClick={() => initGame(difficulty)}
        >
          RESET BOARD
        </button>
      </footer>
    </div>
  )
}
