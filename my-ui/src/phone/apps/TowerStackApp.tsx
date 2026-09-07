import { useState, useEffect, useCallback, useRef } from 'react'
import { GameScoreService } from '../../nerve/preview'

type PlacedBlock = {
  id: number
  x: number // percentage 0-100
  width: number // percentage
  color: string
}

const BLOCK_COLORS = [
  '#ff4d67',
  '#ffd23f',
  '#27dff2',
  '#a879ff',
  '#ff7a3d',
  '#36e6a0',
]

export function TowerStackApp() {
  const [blocks, setBlocks] = useState<PlacedBlock[]>([
    { id: 0, x: 25, width: 50, color: BLOCK_COLORS[0] },
  ])
  const [activeX, setActiveX] = useState(10)
  const [activeWidth, setActiveWidth] = useState(50)
  const [activeDirection, setActiveDirection] = useState<'right' | 'left'>('right')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(34)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [perfectCombo, setPerfectCombo] = useState(0)
  const [effectText, setEffectText] = useState<string | null>(null)

  // Load high score
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores['tower-stack'] === 'number') {
        setHighScore(scores['tower-stack'])
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'tower-stack') setHighScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const startNewGame = useCallback(() => {
    setBlocks([{ id: 0, x: 25, width: 50, color: BLOCK_COLORS[0] }])
    setActiveX(0)
    setActiveWidth(50)
    setActiveDirection('right')
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
    setPerfectCombo(0)
    setEffectText(null)
  }, [])

  // Animation frame loop for sliding block
  const xRef = useRef(activeX)
  xRef.current = activeX
  const dirRef = useRef(activeDirection)
  dirRef.current = activeDirection
  const wRef = useRef(activeWidth)
  wRef.current = activeWidth

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const speed = 1.2
    const interval = setInterval(() => {
      let nextX = xRef.current + (dirRef.current === 'right' ? speed : -speed)
      let nextDir = dirRef.current

      if (nextX + wRef.current >= 100) {
        nextX = 100 - wRef.current
        nextDir = 'left'
      } else if (nextX <= 0) {
        nextX = 0
        nextDir = 'right'
      }

      setActiveX(nextX)
      setActiveDirection(nextDir)
    }, 20)

    return () => clearInterval(interval)
  }, [isPlaying, gameOver])

  const showEffect = (text: string) => {
    setEffectText(text)
    setTimeout(() => setEffectText(null), 1200)
  }

  const dropBlock = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      return
    }
    if (gameOver) {
      startNewGame()
      return
    }

    const currentTop = blocks[blocks.length - 1]
    const curX = activeX
    const curW = activeWidth

    // Check overlap with current top
    const overlapLeft = Math.max(curX, currentTop.x)
    const overlapRight = Math.min(curX + curW, currentTop.x + currentTop.width)
    const overlapWidth = overlapRight - overlapLeft

    if (overlapWidth <= 0) {
      // Total miss! Game over
      setGameOver(true)
      setIsPlaying(false)
      showEffect('MISSED!')
      GameScoreService.SubmitScore.request({ gameId: 'tower-stack', score })
      return
    }

    // Check if nearly perfect
    const diff = Math.abs(curX - currentTop.x)
    let newX = overlapLeft
    let newWidth = overlapWidth

    if (diff < 1.5) {
      // Perfect placement!
      newX = currentTop.x
      newWidth = currentTop.width
      const nextCombo = perfectCombo + 1
      setPerfectCombo(nextCombo)
      showEffect(`PERFECT! x${nextCombo}`)
    } else {
      setPerfectCombo(0)
    }

    const nextScore = score + 1
    setScore(nextScore)
    if (nextScore > highScore) setHighScore(nextScore)

    const color = BLOCK_COLORS[nextScore % BLOCK_COLORS.length]
    const nextPlaced: PlacedBlock = {
      id: nextScore,
      x: newX,
      width: newWidth,
      color,
    }

    setBlocks((prev) => [...prev, nextPlaced])
    setActiveWidth(newWidth)
    setActiveX(0)
    setActiveDirection('right')
  }

  // Display only top 7 blocks in visible viewport
  const visibleBlocks = blocks.slice(-7)

  return (
    <div className="towerstack-app-root">
      <header className="towerstack-header">
        <div className="towerstack-top-row">
          <div>
            <span className="towerstack-title">🏗️ TOWER STACK</span>
            <small className="towerstack-high">RECORD: {highScore} FLOORS</small>
          </div>
          <div className="towerstack-score-badge">
            <label>HEIGHT</label>
            <span>{score}</span>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="towerstack-viewport" onClick={dropBlock}>
        {effectText && <div className="towerstack-effect">{effectText}</div>}

        {/* Stack Container */}
        <div className="towerstack-tower">
          {visibleBlocks.map((b, idx) => (
            <div
              key={b.id}
              className="towerstack-block placed"
              style={{
                left: `${b.x}%`,
                width: `${b.width}%`,
                bottom: `${idx * 34 + 20}px`,
                backgroundColor: b.color,
                boxShadow: `0 0 10px ${b.color}88`,
              }}
            />
          ))}

          {/* Sliding active block */}
          {isPlaying && !gameOver && (
            <div
              className="towerstack-block active"
              style={{
                left: `${activeX}%`,
                width: `${activeWidth}%`,
                bottom: `${visibleBlocks.length * 34 + 20}px`,
                backgroundColor: BLOCK_COLORS[(score + 1) % BLOCK_COLORS.length],
                boxShadow: `0 0 14px ${BLOCK_COLORS[(score + 1) % BLOCK_COLORS.length]}`,
              }}
            />
          )}

          {/* Game Over Banner */}
          {gameOver && (
            <div className="towerstack-gameover">
              <h3>TOWER COLLAPSED!</h3>
              <p>Floors Reached: {score}</p>
              <button
                type="button"
                className="towerstack-retry-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  startNewGame()
                }}
              >
                STACK AGAIN
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="towerstack-footer">
        <button
          type="button"
          className="towerstack-drop-btn"
          onClick={dropBlock}
        >
          {gameOver ? 'RETRY' : isPlaying ? 'DROP BLOCK (TAP)' : 'START GAME'}
        </button>
      </footer>
    </div>
  )
}
