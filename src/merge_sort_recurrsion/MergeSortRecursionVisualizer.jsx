import { useMemo, useState, useEffect, useCallback } from "react"
import "./MergeSortRecursionVisualizer.css"
import { buildMergeRecSteps, SAMPLE, SAMPLE8 } from "./mergeSteps"

// ─── colour per depth level ──────────────────────────────────────────────────
const LEVEL_COLORS = [
  { bg: "rgba(20,184,166,0.18)",  border: "rgba(20,184,166,0.65)",  text: "#5eead4" },
  { bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.60)",  text: "#7dd3fc" },
  { bg: "rgba(168,85,247,0.14)",  border: "rgba(168,85,247,0.55)",  text: "#c4b5fd" },
  { bg: "rgba(244,114,182,0.14)", border: "rgba(244,114,182,0.55)", text: "#f9a8d4" },
  { bg: "rgba(251,191,36,0.13)",  border: "rgba(251,191,36,0.50)",  text: "#fde68a" },
]
const levelColor = (l) => LEVEL_COLORS[Math.min(l, LEVEL_COLORS.length - 1)]

// ─── build the visual tree from treeNodes ────────────────────────────────────
function buildLevels(treeNodes) {
  const nodes   = Object.values(treeNodes)
  if (!nodes.length) return []
  const root    = nodes.find((n) => n.parentId === null)
  if (!root) return []
  const levels  = []
  let queue     = [root]
  while (queue.length) {
    levels.push(queue)
    const next = []
    for (const n of queue) {
      if (n.leftChildId  != null && treeNodes[n.leftChildId])  next.push(treeNodes[n.leftChildId])
      if (n.rightChildId != null && treeNodes[n.rightChildId]) next.push(treeNodes[n.rightChildId])
    }
    queue = next
  }
  return levels
}

// ─── single tree node card ────────────────────────────────────────────────────
function TreeNode({ node, isActive, isLeft, isRight, compareIdx, writeIdx, totalLen }) {
  const col   = levelColor(node.level)
  const state = node.state  // pending | active | splitting | merging | sorted

  const stateLabel = {
    pending:   null,
    active:    "▶ active",
    splitting: "✂ splitting",
    merging:   "⇌ merging",
    sorted:    "✓ sorted",
  }[state]

  const isInvolved = isActive || isLeft || isRight

  return (
    <div
      className={[
        "msrv-node",
        `msrv-node--${state}`,
        isActive  ? "msrv-node--current" : "",
        isLeft    ? "msrv-node--left"    : "",
        isRight   ? "msrv-node--right"   : "",
      ].filter(Boolean).join(" ")}
      style={{
        "--node-bg":     col.bg,
        "--node-border": col.border,
        "--node-text":   col.text,
      }}
    >
      {/* range label */}
      <span className="msrv-node__range">
        idx {node.lo}{node.lo !== node.hi ? `–${node.hi}` : ""}
      </span>

      {/* value pills */}
      <div className="msrv-node__values">
        {node.values.map((v, i) => {
          const globalIdx = node.lo + i
          const isCompareL = compareIdx?.left  === globalIdx
          const isCompareR = compareIdx?.right === globalIdx
          const isWrite    = writeIdx === globalIdx

          return (
            <span
              key={i}
              className={[
                "msrv-pill",
                isCompareL ? "msrv-pill--cmp-l" : "",
                isCompareR ? "msrv-pill--cmp-r" : "",
                isWrite    ? "msrv-pill--write"  : "",
              ].filter(Boolean).join(" ")}
            >
              {v}
            </span>
          )
        })}
      </div>

      {/* state badge */}
      {stateLabel && (
        <span className={`msrv-node__badge msrv-node__badge--${state}`}>
          {stateLabel}
        </span>
      )}

      {/* left / right role indicator */}
      {(isLeft || isRight) && !isActive && (
        <span className="msrv-node__role">{isLeft ? "LEFT" : "RIGHT"}</span>
      )}
    </div>
  )
}

// ─── phase banner ─────────────────────────────────────────────────────────────
const PHASE_META = {
  idle:    { icon: "◎", label: "Ready",    color: "#94a3b8" },
  split:   { icon: "✂", label: "Splitting", color: "#38bdf8" },
  merge:   { icon: "⇌", label: "Merging",  color: "#14b8a6" },
  compare: { icon: "⚖", label: "Comparing", color: "#a855f7" },
  write:   { icon: "✎", label: "Writing",  color: "#f472b6" },
  done:    { icon: "✓", label: "Done!",    color: "#4ade80" },
}

// ─── main component ────────────────────────────────────────────────────────────
function MergeSortRecursionVisualizer({ algo, onBack }) {
  const [sampleKey,  setSampleKey]  = useState("6")
  const [stepIndex,  setStepIndex]  = useState(0)
  const [isPlaying,  setIsPlaying]  = useState(false)
  const [speed,      setSpeed]      = useState(500)

  const values = sampleKey === "6" ? SAMPLE : SAMPLE8
  const steps  = useMemo(() => buildMergeRecSteps(values), [values])
  const step   = steps[stepIndex] || { array: values, treeNodes: {}, phase: "idle", message: "", hint: "" }

  // auto-play
  useEffect(() => {
    if (!isPlaying) return undefined
    if (stepIndex >= steps.length - 1) { setIsPlaying(false); return undefined }
    const t = setTimeout(() => setStepIndex((s) => s + 1), speed)
    return () => clearTimeout(t)
  }, [isPlaying, stepIndex, steps.length, speed])

  useEffect(() => { setStepIndex(0); setIsPlaying(false) }, [sampleKey])

  const prev    = useCallback(() => { setStepIndex((s) => Math.max(s - 1, 0)); setIsPlaying(false) }, [])
  const nextBtn = useCallback(() => { setStepIndex((s) => Math.min(s + 1, steps.length - 1)); setIsPlaying(false) }, [steps.length])
  const reset   = useCallback(() => { setStepIndex(0); setIsPlaying(false) }, [])
  const toggle  = useCallback(() => {
    if (stepIndex >= steps.length - 1) setStepIndex(0)
    setIsPlaying((p) => !p)
  }, [stepIndex, steps.length])

  const levels      = buildLevels(step.treeNodes)
  const phaseMeta   = PHASE_META[step.phase] || PHASE_META.idle
  const progress    = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0

  // current array for bottom bar
  const arr         = step.array || values

  return (
    <main className="msrv-page">
      <div className="msrv-shell">

        {/* ── Top bar ── */}
        <header className="msrv-header">
          <button className="msrv-back" onClick={onBack}>← Back</button>
          <div className="msrv-header__title">
            <h1>Merge Sort</h1>
            <span className="msrv-header__sub">Recursive · Divide &amp; Conquer</span>
          </div>
          <div className="msrv-header__chips">
            <span className="msrv-chip">O(n log n)</span>
            <span className="msrv-chip msrv-chip--stable">Stable</span>
          </div>
        </header>

        {/* ── Phase banner ── */}
        <div className="msrv-phase-bar" style={{ "--phase-color": phaseMeta.color }}>
          <span className="msrv-phase-bar__icon">{phaseMeta.icon}</span>
          <span className="msrv-phase-bar__label">{phaseMeta.label}</span>
          <span className="msrv-phase-bar__msg">{step.message}</span>
        </div>

        {/* ── Main: tree + sidebar ── */}
        <div className="msrv-workspace">

          {/* Recursion Tree (rendered as a true tree) */}
          <div className="msrv-tree-panel">
            <div className="msrv-tree-body">
              {(() => {
                const nodes = step.treeNodes || {}
                const root = Object.values(nodes).find((n) => n && n.parentId === null)

                if (!root) return <div className="msrv-empty">Hit Play to watch the tree grow</div>

                const renderNode = (node) => {
                  if (!node) return null
                  const left  = node.leftChildId  != null ? nodes[node.leftChildId]  : null
                  const right = node.rightChildId != null ? nodes[node.rightChildId] : null

                  return (
                    <div key={node.id} className="msrv-tree-node-wrapper" style={{ ['--level']: node.level }}>
                      <TreeNode
                        node={node}
                        isActive={step.activeId    === node.id}
                        isLeft  ={step.leftId      === node.id}
                        isRight ={step.rightId     === node.id}
                        compareIdx={step.compareIdx}
                        writeIdx  ={step.writeIdx}
                        totalLen  ={values.length}
                      />

                      {(left || right) && (
                        <div className="msrv-children">
                          {left  && <div className="msrv-child-col">{renderNode(left)}</div>}
                          {right && <div className="msrv-child-col">{renderNode(right)}</div>}
                        </div>
                      )}
                    </div>
                  )
                }

                return <div className="msrv-tree-root">{renderNode(root)}</div>
              })()}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="msrv-sidebar">

            {/* Hint card */}
            <div className="msrv-card msrv-hint-card">
              <span className="msrv-card__label">What's happening?</span>
              <p className="msrv-hint-text">{step.hint || "—"}</p>
            </div>

            {/* Progress */}
            <div className="msrv-card">
              <span className="msrv-card__label">Progress</span>
              <div className="msrv-step-count">
                <strong>{stepIndex + 1}</strong>
                <span>/ {steps.length}</span>
              </div>
              <div className="msrv-progress-track">
                <div className="msrv-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Legend */}
            <div className="msrv-card">
              <span className="msrv-card__label">Legend</span>
              <div className="msrv-legend">
                <div className="msrv-legend-row">
                  <span className="msrv-pill msrv-pill--cmp-l">42</span>
                  <span>Left compare candidate</span>
                </div>
                <div className="msrv-legend-row">
                  <span className="msrv-pill msrv-pill--cmp-r">37</span>
                  <span>Right compare candidate</span>
                </div>
                <div className="msrv-legend-row">
                  <span className="msrv-pill msrv-pill--write">11</span>
                  <span>Being written to array</span>
                </div>
                <div className="msrv-legend-row">
                  <span className="msrv-node__badge msrv-node__badge--sorted" style={{position:"static",fontSize:"10px",padding:"3px 8px"}}>✓ sorted</span>
                  <span>Segment fully sorted</span>
                </div>
                <div className="msrv-legend-row">
                  <span className="msrv-node__badge msrv-node__badge--merging" style={{position:"static",fontSize:"10px",padding:"3px 8px"}}>⇌ merging</span>
                  <span>Two halves being zipped</span>
                </div>
              </div>
            </div>

            {/* Depth guide removed to keep controls in viewport */}

          </aside>
        </div>

        {/* ── Final array bar ── */}
        <div className="msrv-array-bar">
          <span className="msrv-array-bar__label">Full Array</span>
          <div className="msrv-array-bar__cells">
            {arr.map((v, i) => (
              <div
                key={i}
                className={[
                  "msrv-array-cell",
                  step.writeIdx   === i ? "msrv-array-cell--write"   : "",
                  step.compareIdx?.left  === i ? "msrv-array-cell--cmp-l" : "",
                  step.compareIdx?.right === i ? "msrv-array-cell--cmp-r" : "",
                  step.phase === "done" ? "msrv-array-cell--sorted" : "",
                ].filter(Boolean).join(" ")}
              >
                <span className="msrv-array-cell__val">{v}</span>
                <span className="msrv-array-cell__idx">{i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="msrv-controls">
          <select
            value={sampleKey}
            onChange={(e) => setSampleKey(e.target.value)}
            className="msrv-select"
          >
            <option value="6">Sample (6 elements)</option>
            <option value="8">Sample (8 elements)</option>
          </select>

          <button className="msrv-btn" onClick={prev}  disabled={stepIndex === 0}>◀ Prev</button>
          <button className="msrv-btn msrv-btn--primary" onClick={toggle}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button className="msrv-btn" onClick={nextBtn} disabled={stepIndex >= steps.length - 1}>Next ▶</button>
          <button className="msrv-btn" onClick={reset}>↺ Reset</button>

          <label className="msrv-speed">
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

export default MergeSortRecursionVisualizer
