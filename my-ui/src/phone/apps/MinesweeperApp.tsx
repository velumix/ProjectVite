import { useState, useEffect, useCallback } from 'react'
import { GameScoreService } from '../../nerve/preview'

type Cell = {
  r: number
  c: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

type Difficulty = 'quick' | 'classic' | 'expert'

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  quick: { rows: 8, cols: 8, mines: 10 },
  classic: { rows: 10, cols: 10, mines: 18 },
  expert: { rows: 12, cols: 12, mines: 30 },
}

export function MinesweeperApp() {
  const [difficulty, setDifficulty] = useState<Difficulty>('quick')
  const [grid, setGrid] = useState<Cell[][]>([])
  const [flagMode, setFlagMode] = useState(false)
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [bestScore, setBestScore] = useState(180)

  // Load high score
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores.minesweeper === 'number') {
        setBestScore(scores.minesweeper)
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'minesweeper') setBestScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const initBoard = useCallback((diff: Difficulty) => {
    const { rows, cols, mines } = CONFIGS[diff]
    const board: Cell[][] = []

    for (let r = 0; r < rows; r++) {
      const row: Cell[] = []
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        })
      }
      board.push(row)
    }

    // Place mines
    let placed = 0
    while (placed < mines) {
      const mr = Math.floor(Math.random() * rows)
      const mc = Math.floor(Math.random() * cols)
      if (!board[mr][mc].isMine) {
        board[mr][mc].isMine = true
        placed++
      }
    }

    // Calculate adjacent counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].isMine) continue
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
              count++
            }
          }
        }
        board[r][c].adjacentMines = count
      }
    }

    setGrid(board)
    setStatus('idle')
    setTimerSeconds(0)
  }, [])

  useEffect(() => {
    initBoard(difficulty)
  }, [difficulty, initBoard])

  // Timer
  useEffect(() => {
    if (status !== 'playing') return
    const timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [status])

  const revealCell = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return
    const cell = grid[r][c]
    if (cell.isRevealed || cell.isFlagged) return

    if (status === 'idle') setStatus('playing')

    const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })))

    if (cell.isMine) {
      // Game Over! Reveal all mines
      for (let row of nextGrid) {
        for (let c of row) {
          if (c.isMine) c.isRevealed = true
        }
      }
      setGrid(nextGrid)
      setStatus('lost')
      return
    }

    // Flood fill algorithm
    const queue: Array<[number, number]> = [[r, c]]
    nextGrid[r][c].isRevealed = true

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!
      const current = nextGrid[currR][currC]

      if (current.adjacentMines === 0) {
        const { rows, cols } = CONFIGS[difficulty]
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr
            const nc = currC + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = nextGrid[nr][nc]
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true
                if (neighbor.adjacentMines === 0) {
                  queue.push([nr, nc])
                }
              }
            }
          }
        }
      }
    }

    // Check Win
        let unrevealedNonMines = 0
    for (let row of nextGrid) {
      for (let c of row) {
        if (!c.isMine && !c.isRevealed) unrevealedNonMines++
      }
    }

    setGrid(nextGrid)

    if (unrevealedNonMines === 0) {
      setStatus('won')
      const score = Math.max(10, 500 - timerSeconds)
      GameScoreService.SubmitScore.request({ gameId: 'minesweeper', score })
    }
  }

  const toggleFlag = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return
    const cell = grid[r][c]
    if (cell.isRevealed) return

    if (status === 'idle') setStatus('playing')

    setGrid((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) =>
          ri === r && ci === c ? { ...cell, isFlagged: !cell.isFlagged } : cell
        )
      )
    )
  }

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      toggleFlag(r, c)
    } else {
      revealCell(r, c)
    }
  }

  const flagsCount = grid.flat().filter((c) => c.isFlagged).length
  const minesLeft = Math.max(0, CONFIGS[difficulty].mines - flagsCount)

  const getNumberColor = (num: number): string => {
    switch (num) {
      case 1: return '#3b82f6'
      case 2: return '#10b981'
      case 3: return '#ef4444'
      case 4: return '#8b5cf6'
      case 5: return '#b91c1c'
      case 6: return '#06b6d4'
      case 7: return '#111827'
      case 8: return '#6b7280'
      default: return '#fff'
    }
  }

  return (
    <div className="minesweeper-app-root">
      <header className="minesweeper-header">
        <div className="minesweeper-top-row">
          <div className="minesweeper-counter-box">
            <span className="minesweeper-icon">💣</span>
            <span className="minesweeper-num">{String(minesLeft).padStart(3, '0')}</span>
          </div>

          <button
            type="button"
            className="minesweeper-face-btn"
            onClick={() => initBoard(difficulty)}
            aria-label="Restart Game"
          >
            {status === 'lost' ? '😵' : status === 'won' ? '😎' : '😊'}
          </button>

          <div className="minesweeper-counter-box">
            <span className="minesweeper-icon">⏱️</span>
            <span className="minesweeper-num">{String(timerSeconds).padStart(3, '0')}</span>
          </div>
        </div>

        <div className="minesweeper-toolbar">
          <div className="minesweeper-diff-group">
            {(['quick', 'classic', 'expert'] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={`minesweeper-diff-btn ${difficulty === d ? 'active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`minesweeper-flag-toggle ${flagMode ? 'active' : ''}`}
            onClick={() => setFlagMode((f) => !f)}
          >
            🚩 {flagMode ? 'FLAGGING' : 'DIGGING'}
          </button>
        </div>
      </header>

      {/* Grid View */}
      <main className="minesweeper-board-container">
        <div
          className={`minesweeper-grid diff-${difficulty}`}
          style={{
            gridTemplateColumns: `repeat(${CONFIGS[difficulty].cols}, 1fr)`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                className={`minesweeper-cell ${cell.isRevealed ? 'revealed' : 'hidden'} ${cell.isMine && cell.isRevealed ? 'mine' : ''}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  toggleFlag(r, c)
                }}
                aria-label={`Cell ${r}-${c}`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.adjacentMines > 0 ? (
                    <span style={{ color: getNumberColor(cell.adjacentMines) }}>
                      {cell.adjacentMines}
                    </span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>
      </main>

      <footer className="minesweeper-footer">
        <small className="minesweeper-record">BEST SCORE: {bestScore} PTS</small>
      </footer>
    </div>
  )
}
