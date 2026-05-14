import { useMemo, useState, useEffect, useCallback } from "react"
import "./Countingsortvisualizer.css"
import { buildCountingSortSteps, CS_SAMPLE6, CS_SAMPLE8, CS_SAMPLE_TIES } from "./countingSteps"

// ─── phase metadata ───────────────────────────────────────────────────────────
const PHASE_META = {
  idle:   { icon: "◎", label: "Ready",       color: "#94a3b8", step: 0 },
  count:  { icon: "⊞", label: "Counting",    color: "#38bdf8", step: 1 },
  prefix: { icon: "∑", label: "Prefix Sum",  color: "#a78bfa", step: 2 },
  place:  { icon: "↓", label: "Placing",     color: "#34d399", step: 3 },
  done:   { icon: "✓", label: "Done!",       color: "#4ade80", step: 4 },
}

// ─── phase pipeline stepper ───────────────────────────────────────────────────
function PhasePipeline({ currentPhase }) {
  const phases = [
    { key: "count",  label: "① Count",       desc: "Tally each value" },
    { key: "prefix", label: "② Prefix Sum",  desc: "Compute positions" },
    { key: "place",  label: "③ Place",       desc: "Fill output array" },
  ]
  const order = ["idle","count","prefix","place","done"]
  const cur   = order.indexOf(currentPhase)

  return (
    <div className="csv-pipeline">
      {phases.map(({ key, label, desc }) => {
        const phaseOrder = order.indexOf(key)
        const state = phaseOrder < cur ? "done" : phaseOrder === cur ? "active" : "pending"
        return (
          <div key={key} className={`csv-pipeline-step csv-pipeline-step--${state}`}>
            <span className="csv-pipeline-step__label">{label}</span>
            <span className="csv-pipeline-step__desc">{desc}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── single cell (input / output) ─────────────────────────────────────────────
function Cell({ value, index, isActive, isSorted, isNull }) {
  return (
    <div className={[
      "csv-cell",
      isActive ? "csv-cell--active" : "",
      isSorted ? "csv-cell--sorted" : "",
      isNull   ? "csv-cell--null"   : "",
    ].filter(Boolean).join(" ")}>
      <span className="csv-cell__val">{isNull ? "·" : value}</span>
      <span className="csv-cell__idx">{index}</span>
    </div>
  )
}

// ─── count bucket bar ─────────────────────────────────────────────────────────
function BucketBar({ value, count, prefix, isActiveCount, isActivePrefix, maxCount, phase }) {
  const heightPct = maxCount > 0 ? Math.max(8, Math.round((count / maxCount) * 80)) : 8
  const showPrefix = phase === "prefix" || phase === "place" || phase === "done"

  return (
    <div className={[
      "csv-bucket",
      isActiveCount  ? "csv-bucket--count"  : "",
      isActivePrefix ? "csv-bucket--prefix" : "",
    ].filter(Boolean).join(" ")}>
      {/* bar */}
      <div className="csv-bucket__bar-wrap">
        <div
          className="csv-bucket__bar"
          style={{ "--bh": `${heightPct}%` }}
        >
          {count > 0 && <span className="csv-bucket__count">{count}</span>}
        </div>
      </div>
      {/* value label */}
      <span className="csv-bucket__val">{value}</span>
      {/* prefix annotation */}
      {showPrefix && prefix != null && (
        <span className={`csv-bucket__prefix ${isActivePrefix ? "csv-bucket__prefix--hi" : ""}`}>
          {prefix}
        </span>
      )}
    </div>
  )
}

// ─── array row with label ─────────────────────────────────────────────────────
function ArrayRow({ label, sublabel, children, highlight }) {
  return (
    <div className={`csv-array-row ${highlight ? "csv-array-row--highlight" : ""}`}>
      <div className="csv-array-row__meta">
        <span className="csv-array-row__label">{label}</span>
        {sublabel && <span className="csv-array-row__sub">{sublabel}</span>}
      </div>
      <div className="csv-array-row__cells">{children}</div>
    </div>
  )
}

// ─── main component ────────────────────────────────────────────────────────────
function CountingSortVisualizer({ onBack }) {
  const [sampleKey, setSampleKey] = useState("6")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed,     setSpeed]     = useState(520)

  const values = sampleKey === "6" ? CS_SAMPLE6 : sampleKey === "8" ? CS_SAMPLE8 : CS_SAMPLE_TIES
  const steps  = useMemo(() => buildCountingSortSteps(values), [values])
  const step   = steps[stepIndex] || { input: values, count: [], prefix: null, output: null, phase: "idle", message: "", hint: "" }

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

  const prev     = useCallback(() => { setStepIndex((s) => Math.max(s - 1, 0)); setIsPlaying(false) }, [])
  const nextStep = useCallback(() => { setStepIndex((s) => Math.min(s + 1, steps.length - 1)); setIsPlaying(false) }, [steps.length])
  const reset    = useCallback(() => { setStepIndex(0); setIsPlaying(false) }, [])
  const toggle   = useCallback(() => {
    if (stepIndex >= steps.length - 1) setStepIndex(0)
    setIsPlaying((p) => !p)
  }, [stepIndex, steps.length])

  const phaseMeta = PHASE_META[step.phase] || PHASE_META.idle
  const progress  = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0
  const maxCount  = Math.max(...(step.count || [1]), 1)
  const maxVal    = step.maxVal || 0

  return (
    <main className="csv-page">
      <div className="csv-shell">

        {/* ── Header ── */}
        <header className="csv-header">
          <button className="csv-back" onClick={onBack}>← Back</button>
          <div className="csv-header__title">
            <h1>Counting Sort</h1>
            <span className="csv-header__sub">Integer · Non-comparative · Stable</span>
          </div>
          <div className="csv-header__chips">
            <span className="csv-chip">O(n + k)</span>
            <span className="csv-chip csv-chip--alt">k = max value</span>
            <span className="csv-chip csv-chip--stable">Zero comparisons</span>
          </div>
        </header>

        {/* ── Phase pipeline ── */}
        <PhasePipeline currentPhase={step.phase} />

        {/* ── Phase banner ── */}
        <div className="csv-phase-bar" style={{ "--phase-color": phaseMeta.color }}>
          <span className="csv-phase-bar__icon">{phaseMeta.icon}</span>
          <span className="csv-phase-bar__label">{phaseMeta.label}</span>
          <span className="csv-phase-bar__msg">{step.message}</span>
        </div>

        {/* ── Workspace ── */}
        <div className="csv-workspace">

          {/* ── Main: three arrays + count buckets ── */}
          <div className="csv-main-panel">

            {/* INPUT row */}
            <ArrayRow
              label="input[]"
              sublabel="original — never changes"
              highlight={step.phase === "count" || step.phase === "place"}
            >
              {step.input.map((v, i) => (
                <Cell
                  key={i} value={v} index={i}
                  isActive={step.activeInput === i}
                  isSorted={step.phase === "done"}
                />
              ))}
            </ArrayRow>

            {/* COUNT / PREFIX BUCKETS */}
            <div className="csv-buckets-section">
              <div className="csv-buckets-header">
                <span className="csv-buckets-header__title">
                  {step.phase === "prefix" || step.phase === "place" || step.phase === "done"
                    ? "count[] → prefix[]"
                    : "count[]"}
                </span>
                <span className="csv-buckets-header__sub">one bucket per possible value (0 – {maxVal})</span>
              </div>
              <div className="csv-buckets">
                {(step.count || []).map((c, k) => (
                  <BucketBar
                    key={k}
                    value={k}
                    count={c}
                    prefix={step.prefix ? step.prefix[k] : null}
                    isActiveCount={step.activeCount === k}
                    isActivePrefix={step.activePrefix === k || step.activeFrom === k}
                    maxCount={maxCount}
                    phase={step.phase}
                  />
                ))}
              </div>
            </div>

            {/* OUTPUT row */}
            <ArrayRow
              label="output[]"
              sublabel="sorted result being built"
              highlight={step.phase === "place" || step.phase === "done"}
            >
              {Array.from({ length: step.input.length }, (_, i) => {
                const val = step.output ? step.output[i] : null
                return (
                  <Cell
                    key={i} value={val ?? "·"} index={i}
                    isActive={step.activeOutput === i}
                    isSorted={step.phase === "done" && val !== null}
                    isNull={val === null}
                  />
                )
              })}
            </ArrayRow>

          </div>

          {/* ── Sidebar ── */}
          <aside className="csv-sidebar">

            {/* Hint */}
            <div className="csv-card csv-hint-card">
              <span className="csv-card__label">What's happening?</span>
              <p className="csv-hint-text">{step.hint || "—"}</p>
            </div>

            {/* Progress */}
            <div className="csv-card">
              <span className="csv-card__label">Progress</span>
              <div className="csv-step-count">
                <strong>{stepIndex + 1}</strong>
                <span>/ {steps.length}</span>
              </div>
              <div className="csv-progress-track">
                <div className="csv-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Why no comparisons? */}
            <div className="csv-card">
              <span className="csv-card__label">Why O(n + k)?</span>
              <div className="csv-complexity">
                <div className="csv-complexity-row">
                  <span className="csv-complexity-phase">Phase 1</span>
                  <span className="csv-complexity-cost">O(n) — scan input once</span>
                </div>
                <div className="csv-complexity-row">
                  <span className="csv-complexity-phase">Phase 2</span>
                  <span className="csv-complexity-cost">O(k) — scan count[] once</span>
                </div>
                <div className="csv-complexity-row">
                  <span className="csv-complexity-phase">Phase 3</span>
                  <span className="csv-complexity-cost">O(n) — place each element</span>
                </div>
                <div className="csv-complexity-row csv-complexity-row--total">
                  <span className="csv-complexity-phase">Total</span>
                  <span className="csv-complexity-cost">O(n + k) 🎉</span>
                </div>
              </div>
            </div>

            {/* Legend removed to simplify sidebar and allow full-width content */}

          </aside>
        </div>

        {/* ── Controls ── */}
        <div className="csv-controls">
          <select
            className="csv-select"
            value={sampleKey}
            onChange={(e) => changeSample(e.target.value)}
          >
            <option value="6">Sample A (6 elements)</option>
            <option value="8">Sample B (8 elements)</option>
            <option value="ties">Sample C (with duplicates)</option>
          </select>

          <button className="csv-btn" onClick={prev}     disabled={stepIndex === 0}>◀ Prev</button>
          <button className="csv-btn csv-btn--primary" onClick={toggle}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button className="csv-btn" onClick={nextStep} disabled={stepIndex >= steps.length - 1}>Next ▶</button>
          <button className="csv-btn" onClick={reset}>↺ Reset</button>

          <label className="csv-speed">
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

export default CountingSortVisualizer
