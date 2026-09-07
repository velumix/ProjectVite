import { useState, useEffect, useCallback, useRef } from 'react'
import { GameScoreService } from '../../nerve/preview'

type Point = { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

const BOARD_SIZE = 15

export function SnakeApp() {
  const [snake, setSnake] = useState<Point[]>([
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 7, y: 9 },
  ])
  const [food, setFood] = useState<Point>({ x: 4, y: 4 })
  const [direction, setDirection] = useState<Direction>('UP')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [speed, setSpeed] = useState<'relaxed' | 'normal' | 'fast'>('normal')

  const dirRef = useRef(direction)
  dirRef.current = direction

  // Load high scores
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores.snake === 'number') {
        setHighScore(scores.snake)
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'snake') setHighScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      }
      if (!currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)) break
    }
    return newFood
  }, [])

  const restartGame = () => {
    const initialSnake = [
      { x: 7, y: 7 },
      { x: 7, y: 8 },
      { x: 7, y: 9 },
    ]
    setSnake(initialSnake)
    setFood(spawnFood(initialSnake))
    setDirection('UP')
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }

  const handleGameOver = useCallback((finalScore: number) => {
    setGameOver(true)
    setIsPlaying(false)
    GameScoreService.SubmitScore.request({ gameId: 'snake', score: finalScore })
  }, [])

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const intervalMs = speed === 'relaxed' ? 220 : speed === 'fast' ? 120 : 160
    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0]
        let nextHead: Point

        switch (dirRef.current) {
          case 'UP':
            nextHead = { x: head.x, y: head.y - 1 }
            break
          case 'DOWN':
            nextHead = { x: head.x, y: head.y + 1 }
            break
          case 'LEFT':
            nextHead = { x: head.x - 1, y: head.y }
            break
          case 'RIGHT':
            nextHead = { x: head.x + 1, y: head.y }
            break
        }

        // Wall collision
        if (
          nextHead.x < 0 ||
          nextHead.x >= BOARD_SIZE ||
          nextHead.y < 0 ||
          nextHead.y >= BOARD_SIZE
        ) {
          handleGameOver(score)
          return prev
        }

        // Self collision
        if (prev.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y)) {
          handleGameOver(score)
          return prev
        }

        const eatsFood = nextHead.x === food.x && nextHead.y === food.y
        const nextSnake = [nextHead, ...prev]

        if (eatsFood) {
          const newScore = score + 10
          setScore(newScore)
          if (newScore > highScore) setHighScore(newScore)
          setFood(spawnFood(nextSnake))
        } else {
          nextSnake.pop()
        }

        return nextSnake
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver, speed, food, score, highScore, handleGameOver, spawnFood])

  const changeDirection = (newDir: Direction) => {
    if (!isPlaying) setIsPlaying(true)
    const cur = dirRef.current
    if (newDir === 'UP' && cur === 'DOWN') return
    if (newDir === 'DOWN' && cur === 'UP') return
    if (newDir === 'LEFT' && cur === 'RIGHT') return
    if (newDir === 'RIGHT' && cur === 'LEFT') return
    setDirection(newDir)
  }

  return (
    <div className="snake-app-root">
      <header className="snake-header">
        <div className="snake-stats-row">
          <div>
            <span className="snake-title">🐍 SNAKE RETRO</span>
            <div className="snake-high">BEST: {highScore}</div>
          </div>
          <div className="snake-score-box">
            <label>SCORE</label>
            <span>{score}</span>
          </div>
        </div>

        <div className="snake-speed-row">
          {(['relaxed', 'normal', 'fast'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`snake-speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Board */}
      <div className="snake-board-container">
        <div className="snake-board">
          {/* Food */}
          <div
            className="snake-food"
            style={{
              left: `${(food.x / BOARD_SIZE) * 100}%`,
              top: `${(food.y / BOARD_SIZE) * 100}%`,
              width: `${100 / BOARD_SIZE}%`,
              height: `${100 / BOARD_SIZE}%`,
            }}
          />

          {/* Snake Segments */}
          {snake.map((seg, i) => (
            <div
              key={i}
              className={`snake-segment ${i === 0 ? 'head' : 'body'}`}
              style={{
                left: `${(seg.x / BOARD_SIZE) * 100}%`,
                top: `${(seg.y / BOARD_SIZE) * 100}%`,
                width: `${100 / BOARD_SIZE}%`,
                height: `${100 / BOARD_SIZE}%`,
              }}
            />
          ))}

          {/* Game Over Banner */}
          {gameOver && (
            <div className="snake-overlay">
              <h4>GAME OVER</h4>
              <p>Score: {score}</p>
              <button type="button" className="snake-restart-btn" onClick={restartGame}>
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls & D-Pad */}
      <footer className="snake-controls">
        <div className="snake-actions-row">
          <button
            type="button"
            className="snake-toggle-btn"
            onClick={() => setIsPlaying((p) => !p)}
          >
            {isPlaying ? 'PAUSE' : 'START'}
          </button>
          <button type="button" className="snake-toggle-btn" onClick={restartGame}>
            RESTART
          </button>
        </div>

        <div className="snake-dpad">
          <button
            type="button"
            className="dpad-btn up"
            onClick={() => changeDirection('UP')}
            aria-label="Up"
          >
            ▲
          </button>
          <div className="dpad-middle">
            <button
              type="button"
              className="dpad-btn left"
              onClick={() => changeDirection('LEFT')}
              aria-label="Left"
            >
              ◀
            </button>
            <div className="dpad-center" />
            <button
              type="button"
              className="dpad-btn right"
              onClick={() => changeDirection('RIGHT')}
              aria-label="Right"
            >
              ▶
            </button>
          </div>
          <button
            type="button"
            className="dpad-btn down"
            onClick={() => changeDirection('DOWN')}
            aria-label="Down"
          >
            ▼
          </button>
        </div>
      </footer>
    </div>
  )
}
