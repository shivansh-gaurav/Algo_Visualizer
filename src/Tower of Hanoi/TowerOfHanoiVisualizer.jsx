import { useEffect, useMemo, useState } from "react"
import "./TowerOfHanoiVisualizer.css"

const PEGS = ["A", "B", "C"]
const MIN_DISKS = 3
const MAX_DISKS = 6

const PSEUDOCODE_LINES = [
  "hanoi(n, source, target, helper)",
  "  if n == 0: return",
  "  hanoi(n - 1, source, helper, target)",
  "  move disk n from source to target",
  "  hanoi(n - 1, helper, target, source)",
]

const makeStartingPegs = (diskCount) => ({
  A: Array.from({ length: diskCount }, (_, index) => diskCount - index),
  B: [],
  C: [],
})

const buildMoves = (diskCount, from = "A", to = "C", helper = "B", depth = 0) => {
  if (diskCount === 0) {
    return [
      {
        disk: null,
        from,
        to,
        helper,
        depth,
        pseudocodeLine: 1,
        type: "base",
      },
    ]
  }

  return [
    {
      disk: diskCount,
      from,
      to,
      helper,
      depth,
      pseudocodeLine: 2,
      type: "recurse-left",
    },
    ...buildMoves(diskCount - 1, from, helper, to, depth + 1),
    {
      disk: diskCount,
      from,
      to,
      helper,
      depth,
      pseudocodeLine: 3,
      type: "move",
    },
    {
      disk: diskCount,
      from: helper,
      to,
      helper: from,
      depth,
      pseudocodeLine: 4,
      type: "recurse-right",
    },
    ...buildMoves(diskCount - 1, helper, to, from, depth + 1),
  ]
}

const applyMoves = (diskCount, moves, stepIndex) => {
  const pegs = makeStartingPegs(diskCount)

  for (let index = 0; index < stepIndex; index += 1) {
    const move = moves[index]
    if (move.type !== "move") continue

    const disk = pegs[move.from].pop()
    pegs[move.to].push(disk)
  }

  return pegs
}

function TowerOfHanoiVisualizer({ algo, onBack }) {
  const [diskCount, setDiskCount] = useState(4)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const moves = useMemo(() => buildMoves(diskCount), [diskCount])
  const pegs = useMemo(
    () => applyMoves(diskCount, moves, stepIndex),
    [diskCount, moves, stepIndex],
  )
  const currentMove = moves[stepIndex]
  const previousMove = [...moves]
    .slice(0, stepIndex)
    .reverse()
    .find((move) => move.type === "move")
  const progress = Math.round((stepIndex / moves.length) * 100)

  useEffect(() => {
    if (!isPlaying) return undefined

    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= moves.length) {
          setIsPlaying(false)
          return current
        }

        return current + 1
      })
    }, 720)

    return () => window.clearInterval(timer)
  }, [isPlaying, moves.length])

  const updateDiskCount = (nextCount) => {
    setIsPlaying(false)
    setDiskCount(nextCount)
    setStepIndex(0)
  }

  const statusText = currentMove?.type === "move"
    ? `Move disk ${currentMove.disk} from ${currentMove.from} to ${currentMove.to}.`
    : currentMove?.type === "base"
      ? "Base case reached: no disk to move, so return."
      : currentMove
        ? `Recursive call at depth ${currentMove.depth}: hanoi(${currentMove.disk - 1}, ${currentMove.from}, ${currentMove.type === "recurse-left" ? currentMove.helper : currentMove.to}, ${currentMove.type === "recurse-left" ? currentMove.to : currentMove.helper}).`
    : "Solved. Every disk is stacked on peg C."

  return (
    <main className="hanoi-page">
      <header className="hanoi-topbar">
        <button className="hanoi-ghost-btn" type="button" onClick={onBack}>
          ← Algorithms
        </button>
        <span className="hanoi-chip">{algo.tagLabel}</span>
      </header>

      <section className="hanoi-hero" style={{ "--accent": algo.accent }}>
        <div className="hanoi-copy">
          <p className="section-label">Recursive walkthrough</p>
          <h1>{algo.title}</h1>
          <p>{algo.desc}</p>
          <div className="hanoi-stats">
            <span>{diskCount} disks</span>
            <span>{moves.length} moves</span>
            <span>Time {algo.complexity}</span>
          </div>
        </div>

        <div className="hanoi-stage" aria-label="Tower of Hanoi visualization">
          <div className="hanoi-workspace">
            <div className="hanoi-board">
              {PEGS.map((peg) => (
                <div className="hanoi-peg" key={peg}>
                  <div className="hanoi-rod" />
                  <div className="hanoi-stack">
                    {pegs[peg].map((disk) => {
                      const isMoving = previousMove?.disk === disk
                      return (
                        <div
                          className={`hanoi-disk ${isMoving ? "just-moved" : ""}`}
                          key={disk}
                          style={{
                            "--disk-size": disk,
                            "--disk-total": diskCount,
                          }}
                        >
                          {disk}
                        </div>
                      )
                    })}
                  </div>
                  <div className="hanoi-base" />
                  <span className="hanoi-label">Peg {peg}</span>
                </div>
              ))}
            </div>

            <aside className="hanoi-pseudocode-panel" aria-label="Tower of Hanoi pseudocode">
              <span className="hanoi-pseudocode-title">Pseudocode</span>
              <ol>
                {PSEUDOCODE_LINES.map((line, index) => (
                  <li
                    className={
                      currentMove?.pseudocodeLine === index ? "active" : ""
                    }
                    key={line}
                  >
                    <code>{line}</code>
                  </li>
                ))}
              </ol>
            </aside>
          </div>

          <div className="hanoi-step-panel">
            <span className="hanoi-step-count">
              Step {stepIndex} / {moves.length}
            </span>
            <p>{statusText}</p>
            <div className="hanoi-progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="hanoi-controls">
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="hanoi-primary-btn"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() =>
            setStepIndex((current) => Math.min(moves.length, current + 1))
          }
          disabled={stepIndex === moves.length}
        >
          Next
        </button>
        <button type="button" onClick={() => updateDiskCount(diskCount)}>
          Reset
        </button>
        <label className="hanoi-disk-control">
          Disks
          <input
            type="range"
            min={MIN_DISKS}
            max={MAX_DISKS}
            value={diskCount}
            onChange={(event) => updateDiskCount(Number(event.target.value))}
          />
          <span>{diskCount}</span>
        </label>
      </section>
    </main>
  )
}

export default TowerOfHanoiVisualizer
