import { useMemo, useState, useEffect, useCallback } from "react"
import "./QuickSortVisualizer.css"
import { buildQuickSortSteps, QS_SAMPLE6, QS_SAMPLE8 } from "./quickSteps"

// ─── phase metadata ───────────────────────────────────────────────────────────
const PHASE_META = {
  idle:          { icon: "◎", label: "Ready",        color: "#94a3b8" },
  "choose-pivot":{ icon: "◈", label: "Pivot",        color: "#fb923c" },
  scan:          { icon: "⇒", label: "Scanning",     color: "#facc15" },
  swap:          { icon: "⇄", label: "Swap",         color: "#f472b6" },
  "place-pivot": { icon: "⊛", label: "Pivot Placed", color: "#4ade80" },
  recurse:       { icon: "↳", label: "Recurse",      color: "#c084fc" },
  done:          { icon: "✓", label: "Done!",        color: "#4ade80" },
}

// ─── per-element state classifier ─────────────────────────────────────────────
function getElementState(idx, step) {
  if (step.sortedIdxs?.includes(idx)) return "sorted"
  if (step.swapA === idx || step.swapB === idx) return "swap"
  if (step.pivotIdx === idx)  return "pivot"
  if (step.rightPtr === idx)  return "scan-j"
  if (step.leftPtr  === idx && step.leftPtr >= 0) return "scan-i"
  if (step.activeRange) {
    const { lo, hi } = step.activeRange
    if (idx >= lo && idx <= hi) return "active"
  }
  return "idle"
}

// ─── single bar element ───────────────────────────────────────────────────────
function ArrayBar({ value, index, state, maxVal }) {
  const heightPct = 18 + Math.round((value / maxVal) * 72)  // 18%–90%
  return (
    <div className="qsv-bar-slot">
      <div
        className={`qsv-bar qsv-bar--${state}`}
        style={{ "--bar-h": `${heightPct}%` }}
      >
        <span className="qsv-bar__val">{value}</span>
      </div>
      <span className="qsv-bar__idx">{index}</span>
    </div>
  )
}

// ─── call stack frame ─────────────────────────────────────────────────────────
function StackFrame({ frame, isTop }) {
  return (
    <div className={`qsv-frame ${isTop ? "qsv-frame--top" : ""}`}>
      <span className="qsv-frame__fn">quickSort</span>
      <span className="qsv-frame__args">({frame.lo}, {frame.hi})</span>
      <span className="qsv-frame__depth">depth {frame.depth}</span>
    </div>
  )
}

// ─── main component ────────────────────────────────────────────────────────────
function QuickSortVisualizer({ onBack }) {
  const [sampleKey, setSampleKey] = useState("6")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed,     setSpeed]     = useState(480)

  const values = sampleKey === "6" ? QS_SAMPLE6 : QS_SAMPLE8
  const steps  = useMemo(() => buildQuickSortSteps(values), [values])
  const step   = steps[stepIndex] || { array: values, phase: "idle", message: "", hint: "" }

  useEffect(() => {
    if (!isPlaying) return undefined
    const t = setTimeout(() => {
      setStepIndex((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false)
          return s
        }

        const next = s + 1
        if (next >= steps.length - 1) setIsPlaying(false)
        return next
      })
    }, speed)
    return () => clearTimeout(t)
  }, [isPlaying, stepIndex, steps.length, speed])

  const changeSample = useCallback((nextSample) => {
    setSampleKey(nextSample)
    setStepIndex(0)
    setIsPlaying(false)
  }, [])

  const prev   = useCallback(() => { setStepIndex((s) => Math.max(s - 1, 0)); setIsPlaying(false) }, [])
  const nextStep = useCallback(() => { setStepIndex((s) => Math.min(s + 1, steps.length - 1)); setIsPlaying(false) }, [steps.length])
  const reset  = useCallback(() => { setStepIndex(0); setIsPlaying(false) }, [])
  const toggle = useCallback(() => {
    if (stepIndex >= steps.length - 1) setStepIndex(0)
    setIsPlaying((p) => !p)
  }, [stepIndex, steps.length])

  const arr       = step.array || values
  const maxVal    = Math.max(...arr)
  const phaseMeta = PHASE_META[step.phase] || PHASE_META.idle
  const progress  = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0
  const stack     = step.callStack || []

  return (
    <main className="qsv-page">
      <div className="qsv-shell">

        {/* ── Header ── */}
        <header className="qsv-header">
          <button className="qsv-back" onClick={onBack}>← Back</button>
          <div className="qsv-header__title">
            <h1>Quick Sort</h1>
            <span className="qsv-header__sub">Pivot · Partition · Recurse</span>
          </div>
          <div className="qsv-header__chips">
            <span className="qsv-chip">O(n log n) avg</span>
            <span className="qsv-chip qsv-chip--warn">O(n²) worst</span>
            <span className="qsv-chip qsv-chip--info">In-place</span>
          </div>
        </header>

        {/* ── Phase banner ── */}
        <div className="qsv-phase-bar" style={{ "--phase-color": phaseMeta.color }}>
          <span className="qsv-phase-bar__icon">{phaseMeta.icon}</span>
          <span className="qsv-phase-bar__label">{phaseMeta.label}</span>
          <span className="qsv-phase-bar__msg">{step.message}</span>
        </div>

        {/* ── Workspace ── */}
        <div className="qsv-workspace">

          {/* ── Left: bar chart ── */}
          <div className="qsv-main-panel">

            {/* Active-range bracket above bars */}
            {step.activeRange && (
              <div
                className="qsv-range-bracket"
                style={{
                  "--range-lo":   step.activeRange.lo,
                  "--range-hi":   step.activeRange.hi,
                  "--total-cols": arr.length,
                }}
              >
                <span>active partition [{step.activeRange.lo}–{step.activeRange.hi}]</span>
              </div>
            )}

            {/* Bars */}
            <div
              className="qsv-bars"
              style={{ "--total-cols": arr.length }}
            >
              {arr.map((v, i) => (
                <ArrayBar
                  key={i}
                  value={v}
                  index={i}
                  state={getElementState(i, step)}
                  maxVal={maxVal}
                />
              ))}
            </div>

            {/* Legend strip */}
            <div className="qsv-legend">
              <div className="qsv-legend-item">
                <span className="qsv-legend-dot qsv-legend-dot--pivot" />
                <span>Pivot (orange)</span>
              </div>
              <div className="qsv-legend-item">
                <span className="qsv-legend-dot qsv-legend-dot--scan-j" />
                <span>Scanner j — reads elements</span>
              </div>
              <div className="qsv-legend-item">
                <span className="qsv-legend-dot qsv-legend-dot--scan-i" />
                <span>Boundary i — end of "small" zone</span>
              </div>
              <div className="qsv-legend-item">
                <span className="qsv-legend-dot qsv-legend-dot--swap" />
                <span>Swapping</span>
              </div>
              <div className="qsv-legend-item">
                <span className="qsv-legend-dot qsv-legend-dot--sorted" />
                <span>Final position ✓</span>
              </div>
              <div className="qsv-legend-item">
                <span className="qsv-legend-dot qsv-legend-dot--active" />
                <span>Current sub-array</span>
              </div>
            </div>

            {/* Pivot info strip */}
            {step.pivotVal != null && (
              <div className="qsv-pivot-strip">
                <span className="qsv-pivot-strip__label">Current pivot</span>
                <span className="qsv-pivot-strip__val">{step.pivotVal}</span>
                <span className="qsv-pivot-strip__label">at index</span>
                <span className="qsv-pivot-strip__val">{step.pivotIdx}</span>
                {step.activeRange && (
                  <>
                    <span className="qsv-pivot-strip__label">partition range</span>
                    <span className="qsv-pivot-strip__range">
                      [{step.activeRange.lo} – {step.activeRange.hi}]
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="qsv-sidebar">

            {/* Hint */}
            <div className="qsv-card qsv-hint-card">
              <span className="qsv-card__label">What's happening?</span>
              <p className="qsv-hint-text">{step.hint || "—"}</p>
            </div>

            {/* Progress */}
            <div className="qsv-card">
              <span className="qsv-card__label">Progress</span>
              <div className="qsv-step-count">
                <strong>{stepIndex + 1}</strong>
                <span>/ {steps.length}</span>
              </div>
              <div className="qsv-progress-track">
                <div className="qsv-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="qsv-sorted-count">
                {step.sortedIdxs?.length || 0} / {arr.length} elements placed ✓
              </div>
            </div>

            {/* Call stack */}
            <div className="qsv-card">
              <span className="qsv-card__label">Call Stack ({stack.length})</span>
              {stack.length === 0
                ? <span className="qsv-empty-stack">— stack empty —</span>
                : (
                  <div className="qsv-stack">
                    {[...stack].reverse().map((frame, i) => (
                      <StackFrame key={i} frame={frame} isTop={i === 0} />
                    ))}
                  </div>
                )
              }
            </div>

          </aside>
        </div>

        {/* ── Controls ── */}
        <div className="qsv-controls">
          <select
            className="qsv-select"
            value={sampleKey}
            onChange={(e) => changeSample(e.target.value)}
          >
            <option value="6">Sample A (6 elements)</option>
            <option value="8">Sample B (8 elements)</option>
          </select>

          <button className="qsv-btn" onClick={prev}     disabled={stepIndex === 0}>◀ Prev</button>
          <button className="qsv-btn qsv-btn--primary" onClick={toggle}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button className="qsv-btn" onClick={nextStep} disabled={stepIndex >= steps.length - 1}>Next ▶</button>
          <button className="qsv-btn" onClick={reset}>↺ Reset</button>

          <label className="qsv-speed">
            Speed
            <input
              type="range" min={80} max={900} step={40}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>
        </div>

      </div>
    </main>
  )
}

export default QuickSortVisualizer
