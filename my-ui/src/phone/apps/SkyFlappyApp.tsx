import { useState, useEffect, useCallback, useRef } from 'react'
import { GameScoreService } from '../../nerve/preview'

type Pipe = {
  id: number
  x: number // percentage 0-100
  topHeight: number // percentage
  bottomHeight: number // percentage
  passed: boolean
}

export function SkyFlappyApp() {
  const [theme, setTheme] = useState<'dawn' | 'neon' | 'storm'>('neon')
  const [birdY, setBirdY] = useState(48) // percentage 0-100
  const [velocity, setVelocity] = useState(0)
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(28)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // Load high score
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores['sky-flappy'] === 'number') {
        setHighScore(scores['sky-flappy'])
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'sky-flappy') setHighScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const startNewGame = useCallback(() => {
    setBirdY(45)
    setVelocity(-4)
    setPipes([
      { id: 1, x: 100, topHeight: 30, bottomHeight: 35, passed: false },
      { id: 2, x: 160, topHeight: 25, bottomHeight: 40, passed: false },
    ])
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }, [])

  const flap = () => {
    if (gameOver) {
      startNewGame()
      return
    }
    if (!isPlaying) {
      startNewGame()
      return
    }
    setVelocity(-5.5)
  }

  // Physics loop
  const birdYRef = useRef(birdY)
  birdYRef.current = birdY
  const velRef = useRef(velocity)
  velRef.current = velocity
  const pipesRef = useRef(pipes)
  pipesRef.current = pipes

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const timer = setInterval(() => {
      // 1. Gravity
      const nextVel = velRef.current + 0.4
      const nextBirdY = birdYRef.current + nextVel

      // Floor or ceiling hit
      if (nextBirdY >= 92 || nextBirdY <= 4) {
        setGameOver(true)
        setIsPlaying(false)
        GameScoreService.SubmitScore.request({ gameId: 'sky-flappy', score })
        return
      }

      setBirdY(nextBirdY)
      setVelocity(nextVel)

      // 2. Pipes motion
      const nextPipes = pipesRef.current.map((p) => ({ ...p, x: p.x - 1.2 }))

      // Check pipe collisions (bird is at x: 25%, width: 8%, height: 6%)
      const birdBox = { left: 22, right: 28, top: nextBirdY - 3, bottom: nextBirdY + 3 }

      for (let p of nextPipes) {
        if (p.x < 32 && p.x + 14 > 22) {
          // In pipe horizontal range
          if (birdBox.top < p.topHeight || birdBox.bottom > 100 - p.bottomHeight) {
            setGameOver(true)
            setIsPlaying(false)
            GameScoreService.SubmitScore.request({ gameId: 'sky-flappy', score })
            return
          }
        }

        // Score increment
        if (!p.passed && p.x + 14 < 22) {
          p.passed = true
          setScore((s) => {
            const nextScore = s + 1
            if (nextScore > highScore) setHighScore(nextScore)
            return nextScore
          })
        }
      }

      // Recycle offscreen pipe
      if (nextPipes[0] && nextPipes[0].x < -18) {
        nextPipes.shift()
        const topH = Math.floor(Math.random() * 35) + 15
        const bottomH = Math.max(15, 65 - topH)
        const lastX = nextPipes[nextPipes.length - 1].x
        nextPipes.push({
          id: Date.now(),
          x: lastX + 60,
          topHeight: topH,
          bottomHeight: bottomH,
          passed: false,
        })
      }

      setPipes(nextPipes)
    }, 25)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver, score, highScore])

  return (
    <div className={`skyflappy-app-root theme-${theme}`}>
      <header className="skyflappy-header">
        <div className="skyflappy-top-row">
          <div>
            <span className="skyflappy-title">🕊️ SKY FLAPPY</span>
            <small className="skyflappy-high">RECORD: {highScore}</small>
          </div>
          <div className="skyflappy-score-badge">
            <label>SCORE</label>
            <span>{score}</span>
          </div>
        </div>

        <div className="skyflappy-theme-row">
          {(['neon', 'dawn', 'storm'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`skyflappy-theme-btn ${theme === t ? 'active' : ''}`}
              onClick={() => setTheme(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Play Area */}
      <main className="skyflappy-world" onClick={flap}>
        {/* Bird */}
        <div
          className="skyflappy-bird"
          style={{
            top: `${birdY}%`,
            left: '25%',
            transform: `translate(-50%, -50%) rotate(${Math.max(-25, Math.min(60, velocity * 5))}deg)`,
          }}
        >
          <span className="bird-emoji">🐤</span>
        </div>

        {/* Pipes */}
        {pipes.map((p) => (
          <div key={p.id} className="skyflappy-pipe-pair">
            {/* Top pipe */}
            <div
              className="skyflappy-pipe top"
              style={{
                left: `${p.x}%`,
                height: `${p.topHeight}%`,
              }}
            />
            {/* Bottom pipe */}
            <div
              className="skyflappy-pipe bottom"
              style={{
                left: `${p.x}%`,
                height: `${p.bottomHeight}%`,
              }}
            />
          </div>
        ))}

        {/* Ground */}
        <div className="skyflappy-ground" />

        {/* Game Over Banner */}
        {gameOver && (
          <div className="skyflappy-gameover">
            <h3>CRASHED!</h3>
            <p>Score: {score}</p>
            <button
              type="button"
              className="skyflappy-retry-btn"
              onClick={(e) => {
                e.stopPropagation()
                startNewGame()
              }}
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </main>

      <footer className="skyflappy-footer">
        <button
          type="button"
          className="skyflappy-flap-btn"
          onClick={flap}
        >
          {gameOver ? 'RETRY' : isPlaying ? 'FLAP (TAP)' : 'TAP TO FLY'}
        </button>
      </footer>
    </div>
  )
}
