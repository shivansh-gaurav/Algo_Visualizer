import { useEffect, useMemo, useState } from "react"
import "./Quicksortvisualizer.css"
import SortingVisualizerShell from "../components/SortingVisualizerShell"
import {
  formatValues,
  makeRandomValues,
  parseManualValues,
} from "../utils/sortingInputs"
import { buildQuickSortSteps, QS_SAMPLE8 } from "./quickSteps"

const PSEUDOCODE_LINES = [
  "quickSort(lo, hi)",
  "  if lo >= hi, return",
  "  pivot = array[hi]",
  "  i = lo - 1",
  "  for j = lo to hi - 1",
  "    if array[j] <= pivot",
  "      swap array[++i] and array[j]",
  "  swap array[i + 1] and pivot",
  "  quickSort(lo, pivot - 1)",
  "  quickSort(pivot + 1, hi)",
]

const PHASE_LINE = {
  idle: 0,
  recurse: 0,
  "choose-pivot": 2,
  scan: 4,
  swap: 6,
  "place-pivot": 7,
  done: 0,
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

const STATE_COPY = {
  active: "in partition",
  pivot: "pivot",
  "scan-i": "boundary",
  "scan-j": "scanner",
  swap: "swap",
  sorted: "placed",
  idle: "waiting",
}

// ─── main component ────────────────────────────────────────────────────────────
function QuickSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(QS_SAMPLE8)
  const [manualInput, setManualInput] = useState(formatValues(QS_SAMPLE8))
  const [inputError, setInputError] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps  = useMemo(() => buildQuickSortSteps(values), [values])
  const step   = steps[stepIndex] || { array: values, phase: "idle", message: "", hint: "" }

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = setInterval(() => {
      setStepIndex((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false)
          return s
        }

        const next = s + 1
        if (next >= steps.length - 1) setIsPlaying(false)
        return next
      })
    }, 650)
    return () => clearInterval(timer)
  }, [isPlaying, steps.length])

  const resetRun = (nextValues = values) => {
    setIsPlaying(false)
    setValues(nextValues)
    setManualInput(formatValues(nextValues))
    setInputError("")
    setStepIndex(0)
  }

  const applyManualValues = (event) => {
    event.preventDefault()

    const result = parseManualValues(manualInput)

    if (result.error) {
      setInputError(result.error)
      return
    }

    resetRun(result.values)
  }

  const arr       = step.array || values
  const phaseLabel = step.phase?.replace("-", " ") || "ready"
  const activeRange = step.activeRange
  const smallZone =
    activeRange && step.leftPtr != null && step.leftPtr >= activeRange.lo
      ? arr.slice(activeRange.lo, step.leftPtr + 1)
      : []
  const scanValue = step.rightPtr != null && step.rightPtr >= 0
    ? arr[step.rightPtr]
    : null
  const stack = step.callStack || []

  return (
    <SortingVisualizerShell
      algo={algo}
      onBack={onBack}
      stats={[
        `Time ${algo?.complexity || "O(n log n)"}`,
        `Phase ${phaseLabel}`,
        `${steps.length} steps`,
      ]}
      stageLabel="Quick sort visualization"
      visualClassName="quick-sort-visual"
      visual={
        <>
          <div className="quick-partition-banner">
            <div>
              <span>Active partition</span>
              <strong>
                {activeRange
                  ? `index ${activeRange.lo} to ${activeRange.hi}`
                  : "whole array"}
              </strong>
            </div>
            <div>
              <span>Pivot</span>
              <strong>{step.pivotVal ?? "-"}</strong>
            </div>
          </div>

          <div
            className="quick-array-track"
            style={{ "--item-count": arr.length }}
          >
            {arr.map((value, index) => {
              const state = getElementState(index, step)

              return (
                <div
                  className={`quick-card quick-card--${state}`}
                  key={`${value}-${index}`}
                >
                  <span className="quick-card__value">{value}</span>
                  <span className="quick-card__index">idx {index}</span>
                  <span className="quick-card__state">{STATE_COPY[state]}</span>
                </div>
              )
            })}
          </div>

          <div className="quick-zones">
            <div className="quick-zone quick-zone--small">
              <span>Left of pivot</span>
              <strong>
                {smallZone.length ? smallZone.join(", ") : "empty"}
              </strong>
            </div>
            <div className="quick-zone quick-zone--scan">
              <span>Scanner value</span>
              <strong>{scanValue ?? "-"}</strong>
            </div>
            <div className="quick-zone quick-zone--done">
              <span>Placed pivots</span>
              <strong>
                {step.sortedIdxs?.length || 0} / {arr.length}
              </strong>
            </div>
          </div>

          <div className="quick-stack">
            <span className="quick-stack__label">Call stack</span>
            <div className="quick-stack__frames">
              {stack.length ? (
                [...stack].reverse().map((frame, index) => (
                  <span
                    className={index === 0 ? "quick-frame active" : "quick-frame"}
                    key={`${frame.lo}-${frame.hi}-${frame.depth}`}
                  >
                    q({frame.lo}, {frame.hi})
                  </span>
                ))
              ) : (
                <span className="quick-frame">empty</span>
              )}
            </div>
          </div>
        </>
      }
      pseudocodeLines={PSEUDOCODE_LINES}
      activePseudocodeLine={PHASE_LINE[step.phase] ?? 0}
      stepIndex={stepIndex}
      stepsLength={steps.length}
      isPlaying={isPlaying}
      message={step.message}
      manualInput={manualInput}
      inputError={inputError}
      manualInputId="quick-manual-array"
      placeholder="64, 34, 25, 12"
      onManualInputChange={(value) => {
        setManualInput(value)
        setInputError("")
      }}
      onApplyManualValues={applyManualValues}
      onPrevious={() => setStepIndex((current) => Math.max(0, current - 1))}
      onTogglePlay={() => setIsPlaying((playing) => !playing)}
      onNext={() =>
        setStepIndex((current) => Math.min(steps.length - 1, current + 1))
      }
      onReset={() => resetRun()}
      onShuffle={() =>
        resetRun(makeRandomValues({ length: 8, minValue: 7, maxValue: 90 }))
      }
    />
  )
}

export default QuickSortVisualizer
