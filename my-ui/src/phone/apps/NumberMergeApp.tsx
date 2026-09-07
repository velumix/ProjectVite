import { useState, useEffect, useCallback } from 'react'
import { GameScoreService } from '../../nerve/preview'

type Grid = number[][]

export function NumberMergeApp() {
  const [grid, setGrid] = useState<Grid>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(2048)
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)

  // Load high score
  useEffect(() => {
    GameScoreService.GetGameScores.request(undefined).then(([scores]) => {
      if (scores && typeof scores['number-merge'] === 'number') {
        setHighScore(scores['number-merge'])
      }
    })
    const unsub = GameScoreService.ScoreUpdated.connect((ev) => {
      if (ev.gameId === 'number-merge') setHighScore(ev.highScore)
    })
    return () => unsub()
  }, [])

  const spawnRandom = (board: Grid): Grid => {
    const emptyCoords: Array<[number, number]> = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCoords.push([r, c])
      }
    }
    if (emptyCoords.length === 0) return board
    const [r, c] = emptyCoords[Math.floor(Math.random() * emptyCoords.length)]
    const newBoard = board.map((row) => [...row])
    newBoard[r][c] = Math.random() < 0.85 ? 2 : 4
    return newBoard
  }

  const startNewGame = useCallback(() => {
    let board: Grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    board = spawnRandom(board)
    board = spawnRandom(board)
    setGrid(board)
    setScore(0)
    setGameOver(false)
    setHasWon(false)
  }, [])

  useEffect(() => {
    startNewGame()
  }, [startNewGame])

  const slideLine = (line: number[]): { newLine: number[]; points: number } => {
    const nonZeros = line.filter((v) => v !== 0)
    const res: number[] = []
    let points = 0

    for (let i = 0; i < nonZeros.length; i++) {
      if (i < nonZeros.length - 1 && nonZeros[i] === nonZeros[i + 1]) {
        const merged = nonZeros[i] * 2
        res.push(merged)
        points += merged
        i++ // skip next
      } else {
        res.push(nonZeros[i])
      }
    }

    while (res.length < 4) res.push(0)
    return { newLine: res, points }
  }

  const checkGameOver = (board: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return false
        if (c < 3 && board[r][c] === board[r][c + 1]) return false
        if (r < 3 && board[r][c] === board[r + 1][c]) return false
      }
    }
    return true
  }

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return

    let changed = false
    let earned = 0
    const nextGrid = grid.map((r) => [...r])

    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        const { newLine, points } = slideLine(nextGrid[r])
        if (newLine.some((v, i) => v !== nextGrid[r][i])) changed = true
        nextGrid[r] = newLine
        earned += points
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const rev = [...nextGrid[r]].reverse()
        const { newLine, points } = slideLine(rev)
        newLine.reverse()
        if (newLine.some((v, i) => v !== nextGrid[r][i])) changed = true
        nextGrid[r] = newLine
        earned += points
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        const col = [nextGrid[0][c], nextGrid[1][c], nextGrid[2][c], nextGrid[3][c]]
        const { newLine, points } = slideLine(col)
        if (newLine.some((v, i) => v !== col[i])) changed = true
        for (let r = 0; r < 4; r++) nextGrid[r][c] = newLine[r]
        earned += points
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        const col = [nextGrid[3][c], nextGrid[2][c], nextGrid[1][c], nextGrid[0][c]]
        const { newLine, points } = slideLine(col)
        newLine.reverse()
        if (newLine.some((v, i) => v !== nextGrid[i][c])) changed = true
        for (let r = 0; r < 4; r++) nextGrid[r][c] = newLine[r]
        earned += points
      }
    }

    if (changed) {
      const spawned = spawnRandom(nextGrid)
      const nextScore = score + earned
      setGrid(spawned)
      setScore(nextScore)
      if (nextScore > highScore) setHighScore(nextScore)

      // Check win
      if (spawned.some((r) => r.some((v) => v >= 2048))) {
        setHasWon(true)
      }

      // Check game over
      if (checkGameOver(spawned)) {
        setGameOver(true)
        GameScoreService.SubmitScore.request({ gameId: 'number-merge', score: nextScore })
      }
    }
  }

  const getTileColor = (val: number): string => {
    switch (val) {
      case 2: return '#eee4da'
      case 4: return '#ede0c8'
      case 8: return '#f2b179'
      case 16: return '#f59563'
      case 32: return '#f67c5f'
      case 64: return '#f65e3b'
      case 128: return '#edcf72'
      case 256: return '#edcc61'
      case 512: return '#edc850'
      case 1024: return '#edc53f'
      case 2048: return '#edc22e'
      default: return val > 2048 ? '#3c3a32' : 'rgba(238, 228, 218, 0.35)'
    }
  }

  return (
    <div className="numbermerge-app-root">
      <header className="numbermerge-header">
        <div className="numbermerge-top-row">
          <div>
            <span className="numbermerge-logo">2048</span>
            <small className="numbermerge-sub">MERGE TILES</small>
          </div>
          <div className="numbermerge-scores">
            <div className="numbermerge-score-box">
              <label>SCORE</label>
              <span>{score}</span>
            </div>
            <div className="numbermerge-score-box">
              <label>BEST</label>
              <span>{highScore}</span>
            </div>
          </div>
        </div>

        <div className="numbermerge-actions">
          <button
            type="button"
            className="numbermerge-newgame-btn"
            onClick={startNewGame}
          >
            NEW GAME
          </button>
        </div>
      </header>

      {/* 4x4 Board */}
      <main className="numbermerge-board-wrap">
        <div className="numbermerge-board">
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`numbermerge-cell ${val > 0 ? 'filled' : 'empty'}`}
                style={{
                  backgroundColor: getTileColor(val),
                  color: val > 4 ? '#f9f6f2' : '#776e65',
                }}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}

          {/* Game Over / Win Overlay */}
          {(gameOver || hasWon) && (
            <div className="numbermerge-overlay">
              <h3>{hasWon ? '🏆 YOU WIN!' : 'GAME OVER'}</h3>
              <p>Score: {score}</p>
              <button
                type="button"
                className="numbermerge-retry-btn"
                onClick={startNewGame}
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Direction D-Pad */}
      <footer className="numbermerge-controls">
        <div className="numbermerge-dpad">
          <button
            type="button"
            className="nm-dpad-btn up"
            onClick={() => move('UP')}
            aria-label="Slide Up"
          >
            ▲
          </button>
          <div className="nm-dpad-mid">
            <button
              type="button"
              className="nm-dpad-btn left"
              onClick={() => move('LEFT')}
              aria-label="Slide Left"
            >
              ◀
            </button>
            <div className="nm-dpad-center" />
            <button
              type="button"
              className="nm-dpad-btn right"
              onClick={() => move('RIGHT')}
              aria-label="Slide Right"
            >
              ▶
            </button>
          </div>
          <button
            type="button"
            className="nm-dpad-btn down"
            onClick={() => move('DOWN')}
            aria-label="Slide Down"
          >
            ▼
          </button>
        </div>
      </footer>
    </div>
  )
}
