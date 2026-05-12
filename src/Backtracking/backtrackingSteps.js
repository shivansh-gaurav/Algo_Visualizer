// Simple backtracking step generator for a standard 9x9 Sudoku (3x3 blocks)
// Grid uses 0 for empty cells. The builder returns an array of step objects
// describing placements and backtracks so the visualizer can animate them.

const cloneGrid = (g) => g.map((r) => r.slice())

const isValid = (grid, row, col, val) => {
  // row & col check
  for (let i = 0; i < 9; i += 1) {
    if (grid[row][i] === val) return false
    if (grid[i][col] === val) return false
  }

  // block check (3x3)
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r += 1) {
    for (let c = bc; c < bc + 3; c += 1) {
      if (grid[r][c] === val) return false
    }
  }

  return true
}

export function buildBacktrackingSteps(initialGrid) {
  const grid = cloneGrid(initialGrid)
  const steps = []

  const pushStep = (type, r, c, val, message) => {
    steps.push({
      grid: cloneGrid(grid),
      type,
      row: r,
      col: c,
      value: val,
      message,
    })
  }

  const findEmpty = () => {
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (grid[r][c] === 0) return [r, c]
      }
    }
    return null
  }

  const solver = () => {
    const cell = findEmpty()
    if (!cell) {
      pushStep("done", -1, -1, null, "Solved — no empty cells remain.")
      return true
    }

    const [r, c] = cell

    // try numbers 1..9
    for (let v = 1; v <= 9; v += 1) {
      pushStep("probe", r, c, v, `Try ${v} at (${r + 1},${c + 1}).`)

      if (!isValid(grid, r, c, v)) {
        pushStep("invalid", r, c, v, `${v} conflicts with row/col/block.`)
        continue
      }

      grid[r][c] = v
      pushStep("place", r, c, v, `Place ${v} at (${r + 1},${c + 1}).`)

      if (solver()) return true

      // backtrack
      grid[r][c] = 0
      pushStep("backtrack", r, c, v, `Backtrack on (${r + 1},${c + 1}), remove ${v}.`)
    }

    return false
  }

  // initial snapshot
  pushStep("start", -1, -1, null, "Start solving the supplied puzzle.")
  solver()

  return steps
}

export const PRESETS = {
  // a gentle puzzle with a unique solution
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
}
