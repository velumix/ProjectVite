import { useState, useEffect, useCallback, useRef } from 'react'
import { GameScoreService } from '../../nerve/preview'

const COLS = 10
const ROWS = 18

type PieceKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

const PIECES: Record<PieceKind, number[][]> = {
  I: [[0, 0], [-1, 0], [1, 0], [2, 0]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[0, 0], [-1, 0], [1, 0], [0, 1]],
  S: [[0, 0], [1, 0], [0, 1], [-1, 1]],
  Z: [[0, 0], [-1, 0], [0, 1], [1, 1]],
  J: [[0, 0], [-1, 0], [1, 0], [-1, 1]],
  L: [[0, 0], [-1, 0], [1, 0], [1, 1]],
}

const COLORS: Record<PieceKind, string> = {
  I: '#00f0ff',
  O: '#ffd000',
  T: '#b026ff',
  S: '#39ff14',
  Z: '#ff0055',
  J: '#0066ff',
  L: '#ff8800',
}

const KINDS: PieceKind[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

type ActivePiece = {
  kind: PieceKind
  x: number
  y: number
  shape: number[][]
}

export function NeonDropApp() {
  const [board, setBoard] = useState<(PieceKind | null)[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  )
  const [active, setActive] = useState<ActivePiece | null>(null)
  const [nextKind, setNextKind] = useState<PieceKind>('T')
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [highScore, setHighScore] = useState(520)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // Load high score
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores['neon-drop'] === 'number') {
        setHighScore(scores['neon-drop'])
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'neon-drop') setHighScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const spawnPiece = useCallback(
    (kind: PieceKind, curBoard: (PieceKind | null)[][]): { piece: ActivePiece; over: boolean } => {
      const piece: ActivePiece = {
        kind,
        x: 4,
        y: 1,
        shape: PIECES[kind].map((p) => [...p]),
      }

      const over = piece.shape.some(([dx, dy]) => {
        const px = piece.x + dx
        const py = piece.y + dy
        return py >= 0 && curBoard[py] && curBoard[py][px] !== null
      })

      return { piece, over }
    },
    []
  )

  const startNewGame = useCallback(() => {
    const emptyBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    const firstKind = KINDS[Math.floor(Math.random() * KINDS.length)]
    const secondKind = KINDS[Math.floor(Math.random() * KINDS.length)]
    const { piece } = spawnPiece(firstKind, emptyBoard)

    setBoard(emptyBoard)
    setActive(piece)
    setNextKind(secondKind)
    setScore(0)
    setLines(0)
    setGameOver(false)
    setIsPlaying(true)
  }, [spawnPiece])

  // Move validation
  const isValid = useCallback(
    (shape: number[][], x: number, y: number, curBoard: (PieceKind | null)[][]) => {
      return shape.every(([dx, dy]) => {
        const px = x + dx
        const py = y + dy
        if (px < 0 || px >= COLS || py >= ROWS) return false
        if (py >= 0 && curBoard[py][px] !== null) return false
        return true
      })
    },
    []
  )

  const lockPiece = useCallback(
    (piece: ActivePiece, curBoard: (PieceKind | null)[][]) => {
      const nextBoard = curBoard.map((row) => [...row])
      piece.shape.forEach(([dx, dy]) => {
        const px = piece.x + dx
        const py = piece.y + dy
        if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
          nextBoard[py][px] = piece.kind
        }
      })

      // Clear full rows
      let cleared = 0
      const filtered = nextBoard.filter((row) => {
        const full = row.every((c) => c !== null)
        if (full) cleared++
        return !full
      })

      while (filtered.length < ROWS) {
        filtered.unshift(Array(COLS).fill(null))
      }

      if (cleared > 0) {
        const points = cleared === 1 ? 100 : cleared === 2 ? 300 : cleared === 3 ? 500 : 800
        setScore((s) => {
          const nextScore = s + points
          if (nextScore > highScore) setHighScore(nextScore)
          return nextScore
        })
        setLines((l) => l + cleared)
      }

      const nextSpawnKind = nextKind
      const newNext = KINDS[Math.floor(Math.random() * KINDS.length)]
      setNextKind(newNext)

      const { piece: nextP, over } = spawnPiece(nextSpawnKind, filtered)
      setBoard(filtered)

      if (over) {
        setGameOver(true)
        setIsPlaying(false)
        setActive(null)
        GameScoreService.SubmitScore.request({ gameId: 'neon-drop', score: score + cleared * 100 })
      } else {
        setActive(nextP)
      }
    },
    [highScore, nextKind, score, spawnPiece]
  )

  // Game loop (drop timer)
  const activeRef = useRef(active)
  activeRef.current = active
  const boardRef = useRef(board)
  boardRef.current = board

  useEffect(() => {
    if (!isPlaying || gameOver || !active) return

    const timer = setInterval(() => {
      const cur = activeRef.current
      const curB = boardRef.current
      if (!cur) return

      if (isValid(cur.shape, cur.x, cur.y + 1, curB)) {
        setActive({ ...cur, y: cur.y + 1 })
      } else {
        lockPiece(cur, curB)
      }
    }, 600)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver, active, isValid, lockPiece])

  // Controls
  const moveLeft = () => {
    if (!active || gameOver || !isPlaying) return
    if (isValid(active.shape, active.x - 1, active.y, board)) {
      setActive({ ...active, x: active.x - 1 })
    }
  }

  const moveRight = () => {
    if (!active || gameOver || !isPlaying) return
    if (isValid(active.shape, active.x + 1, active.y, board)) {
      setActive({ ...active, x: active.x + 1 })
    }
  }

  const rotate = () => {
    if (!active || gameOver || !isPlaying) return
    // Rotate 90 deg: [x, y] -> [-y, x]
    const rotated = active.shape.map(([dx, dy]) => [-dy, dx])
    if (isValid(rotated, active.x, active.y, board)) {
      setActive({ ...active, shape: rotated })
    }
  }

  const softDrop = () => {
    if (!active || gameOver || !isPlaying) return
    if (isValid(active.shape, active.x, active.y + 1, board)) {
      setActive({ ...active, y: active.y + 1 })
      setScore((s) => s + 1)
    } else {
      lockPiece(active, board)
    }
  }

  const hardDrop = () => {
    if (!active || gameOver || !isPlaying) return
    let dropY = active.y
    while (isValid(active.shape, active.x, dropY + 1, board)) {
      dropY++
    }
    const bonus = dropY - active.y
    setScore((s) => s + bonus * 2)
    lockPiece({ ...active, y: dropY }, board)
  }

  // Generate rendered grid overlaying active piece
  const displayGrid = board.map((r) => [...r])
  if (active) {
    active.shape.forEach(([dx, dy]) => {
      const px = active.x + dx
      const py = active.y + dy
      if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
        displayGrid[py][px] = active.kind
      }
    })
  }

  return (
    <div className="neondrop-app-root">
      <header className="neondrop-header">
        <div className="neondrop-top-row">
          <div>
            <span className="neondrop-title">⚡ NEON DROP</span>
            <small className="neondrop-high">BEST: {highScore}</small>
          </div>
          <div className="neondrop-stats-box">
            <div className="neondrop-stat">
              <label>SCORE</label>
              <span>{score}</span>
            </div>
            <div className="neondrop-stat">
              <label>LINES</label>
              <span>{lines}</span>
            </div>
          </div>
        </div>

        <div className="neondrop-sub-row">
          <div className="neondrop-next-box">
            <label>NEXT</label>
            <div className="next-badge" style={{ color: COLORS[nextKind] }}>
              {nextKind}
            </div>
          </div>

          <div className="neondrop-ctrl-btns">
            <button
              type="button"
              className="neondrop-btn"
              onClick={() => {
                if (!isPlaying && !gameOver) {
                  startNewGame()
                } else {
                  setIsPlaying((p) => !p)
                }
              }}
            >
              {!isPlaying ? 'START' : 'PAUSE'}
            </button>
            <button type="button" className="neondrop-btn" onClick={startNewGame}>
              NEW
            </button>
          </div>
        </div>
      </header>

      {/* Tetris Board */}
      <main className="neondrop-matrix-container">
        <div className="neondrop-matrix">
          {displayGrid.map((row, r) =>
            row.map((kind, c) => (
              <div
                key={`${r}-${c}`}
                className={`neondrop-cell ${kind ? 'active' : ''}`}
                style={{
                  backgroundColor: kind ? COLORS[kind] : 'rgba(15, 23, 42, 0.6)',
                  boxShadow: kind ? `0 0 8px ${COLORS[kind]}` : 'none',
                }}
              />
            ))
          )}

          {/* Game Over Banner */}
          {gameOver && (
            <div className="neondrop-gameover">
              <h3>MATRIX LOCK!</h3>
              <p>Final Score: {score}</p>
              <button
                type="button"
                className="neondrop-retry-btn"
                onClick={startNewGame}
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Arcade D-Pad Controls */}
      <footer className="neondrop-controls">
        <div className="neondrop-dpad">
          <button
            type="button"
            className="nd-btn rotate"
            onClick={rotate}
            aria-label="Rotate Piece"
          >
            ↻
          </button>
          <div className="nd-mid">
            <button
              type="button"
              className="nd-btn left"
              onClick={moveLeft}
              aria-label="Shift Left"
            >
              ◀
            </button>
            <button
              type="button"
              className="nd-btn drop"
              onClick={hardDrop}
              aria-label="Hard Drop"
            >
              ⬇
            </button>
            <button
              type="button"
              className="nd-btn right"
              onClick={moveRight}
              aria-label="Shift Right"
            >
              ▶
            </button>
          </div>
          <button
            type="button"
            className="nd-btn down"
            onClick={softDrop}
            aria-label="Soft Drop"
          >
            ▼
          </button>
        </div>
      </footer>
    </div>
  )
}
