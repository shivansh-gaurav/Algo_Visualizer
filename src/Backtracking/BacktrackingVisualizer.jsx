import { useEffect, useMemo, useState } from "react"
import "./BacktrackingVisualizer.css"
import { buildBacktrackingSteps, PRESETS } from "./backtrackingSteps"

function BacktrackingVisualizer({ onBack }) {
  const [preset, setPreset]       = useState("easy")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed]         = useState(220) // ms per step

  const initialGrid = useMemo(() => PRESETS[preset], [preset])
  const steps       = useMemo(() => buildBacktrackingSteps(initialGrid), [initialGrid])
  const current     = steps[stepIndex] || { grid: initialGrid, type: "start", message: "" }

  // auto-play ticker
  useEffect(() => {
    if (!isPlaying) return undefined
    const t = setTimeout(() => {
      setStepIndex((s) => {
        if (s >= steps.length - 1) { setIsPlaying(false); return s }
        return s + 1
      })
    }, speed)
    return () => clearTimeout(t)
  }, [isPlaying, stepIndex, steps.length, speed])

  // reset when preset changes
  useEffect(() => { setStepIndex(0); setIsPlaying(false) }, [preset])

  const togglePlay = () => {
    if (stepIndex >= steps.length - 1) setStepIndex(0)
    setIsPlaying((p) => !p)
  }

  const prev  = () => { setStepIndex((s) => Math.max(s - 1, 0));                setIsPlaying(false) }
  const next  = () => { setStepIndex((s) => Math.min(s + 1, steps.length - 1)); setIsPlaying(false) }
  const reset = () => { setStepIndex(0); setIsPlaying(false) }

  const progress = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0

  return (
    <main className="backtrack-page">
      <div className="backtrack-shell">

        {/* ── Header ── */}
        <header className="backtrack-header">
          <button className="ghost-btn" onClick={onBack}>← Back</button>
          <h1>Sudoku Solver · 9 × 9</h1>
        </header>

        {/* ── Controls ── */}
        <div className="controls">
          <select value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="easy">Easy preset</option>
          </select>
          <button onClick={prev}  disabled={stepIndex === 0}>◀ Prev</button>
          <button onClick={togglePlay}>{isPlaying ? "⏸ Pause" : "▶ Play"}</button>
          <button onClick={next}  disabled={stepIndex >= steps.length - 1}>Next ▶</button>
          <button onClick={reset}>↺ Reset</button>

          {/* speed control */}
          <label style={{ display:"flex", alignItems:"center", gap:"0.5rem",
                          fontSize:"12px", color:"rgba(255,255,255,0.45)", marginLeft:"0.25rem" }}>
            Speed
            <input
              type="range" min={40} max={600} step={20}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ accentColor:"#a855f7", width:"80px" }}
            />
          </label>
        </div>

        {/* ── Workspace: grid + sidebar ── */}
        <div className="backtrack-workspace">

          {/* grid */}
          <div className="backtrack-grid-wrap">
            <div className="backtrack-grid">
              {current.grid.flat().map((v, i) => {
                const r = Math.floor(i / 9)
                const c = i % 9
                const isInitial = initialGrid[r][c] !== 0

                const cls = ["cell"]
                if (isInitial)                                                          cls.push("given")
                else if (v === 0)                                                       cls.push("empty")

                if (current.row === r && current.col === c) {
                  if      (current.type === "probe")     cls.push("probe")
                  else if (current.type === "place")     cls.push("place")
                  else if (current.type === "invalid")   cls.push("invalid")
                  else if (current.type === "backtrack") cls.push("backtrack-hi")
                }

                if (current.type === "done" && v !== 0)  cls.push("done")

                return (
                  <div key={`${r}-${c}`} className={cls.join(" ")}>
                    {v === 0 ? "" : v}
                  </div>
                )
              })}
            </div>
          </div>

          {/* sidebar */}
          <aside className="backtrack-sidebar">

            {/* step info */}
            <div className="backtrack-step-panel">
              <span className="panel-label">Progress</span>
              <div className="step-counter">
                <strong>{stepIndex + 1}</strong>
                <span>of {steps.length} steps</span>
              </div>
              <div className="step-progress-track">
                <div className="step-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="step-message">{current.message}</p>
            </div>

            {/* legend */}
            <div className="backtrack-legend">
              <span className="panel-label">Legend</span>

              <div className="legend-row">
                <span className="legend-dot probe">?</span>
                <span>Probing a candidate digit</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot place">✓</span>
                <span>Digit placed successfully</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot invalid">✕</span>
                <span>Conflict — row / col / box</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot backtrack">↩</span>
                <span>Backtracking, digit removed</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot done">★</span>
                <span>Puzzle solved!</span>
              </div>
            </div>

          </aside>
        </div>

      </div>
    </main>
  )
}

export default BacktrackingVisualizer
