import { useMemo, useState, useEffect } from "react"
import "./Countingsortvisualizer.css"
import SortingVisualizerShell from "../components/SortingVisualizerShell"
import {
  formatValues,
  makeRandomValues,
  parseManualValues,
} from "../utils/sortingInputs"
import { buildCountingSortSteps, CS_SAMPLE8 } from "./countingSteps"

// ─── phase metadata ───────────────────────────────────────────────────────────
const PHASE_META = {
  idle:   { icon: "◎", label: "Ready",       color: "#94a3b8", step: 0 },
  count:  { icon: "⊞", label: "Counting",    color: "#38bdf8", step: 1 },
  prefix: { icon: "∑", label: "Prefix Sum",  color: "#a78bfa", step: 2 },
  place:  { icon: "↓", label: "Placing",     color: "#34d399", step: 3 },
  done:   { icon: "✓", label: "Done!",       color: "#4ade80", step: 4 },
}

const PSEUDOCODE_LINES = [
  "create count array",
  "for each value v in input",
  "  count[v] += 1",
  "prefix[0] = count[0]",
  "for v = 1 to max",
  "  prefix[v] = prefix[v - 1] + count[v]",
  "for i = n - 1 down to 0",
  "  output[prefix[input[i]] - 1] = input[i]",
  "  prefix[input[i]] -= 1",
]

const PHASE_LINE = {
  idle: 0,
  count: 1,
  prefix: 4,
  place: 6,
  done: 8,
}

function PhasePipeline({ currentPhase }) {
  const phases = [
    { key: "count", label: "1 Count", desc: "tally values" },
    { key: "prefix", label: "2 Prefix", desc: "compute slots" },
    { key: "place", label: "3 Place", desc: "fill output" },
  ]
  const order = ["idle", "count", "prefix", "place", "done"]
  const current = order.indexOf(currentPhase)

  return (
    <div className="csv-pipeline csv-pipeline--compact">
      {phases.map(({ key, label, desc }) => {
        const phaseOrder = order.indexOf(key)
        const state =
          phaseOrder < current
            ? "done"
            : phaseOrder === current
              ? "active"
              : "pending"

        return (
          <div
            className={`csv-pipeline-step csv-pipeline-step--${state}`}
            key={key}
          >
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
function CountingSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(CS_SAMPLE8)
  const [manualInput, setManualInput] = useState(formatValues(CS_SAMPLE8))
  const [inputError, setInputError] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps  = useMemo(() => buildCountingSortSteps(values), [values])
  const step   = steps[stepIndex] || { input: values, count: [], prefix: null, output: null, phase: "idle", message: "", hint: "" }

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

    const result = parseManualValues(manualInput, {
      minValue: 0,
      maxValue: 12,
    })

    if (result.error) {
      setInputError(result.error)
      return
    }

    resetRun(result.values)
  }

  const phaseMeta = PHASE_META[step.phase] || PHASE_META.idle
  const maxCount  = Math.max(...(step.count || [1]), 1)
  const maxVal    = step.maxVal || 0
  const focusValue =
    step.activeInput != null
      ? step.input[step.activeInput]
      : step.activeFrom ?? step.activeCount ?? step.activePrefix
  const focusText = {
    idle: "The input waits on the left. Counting Sort will count values before it writes the final output.",
    count: `Read value ${focusValue ?? "-"} and update its matching bucket.`,
    prefix: `Turn bucket ${step.activePrefix ?? "-"} into a position marker.`,
    place: `Use prefix[${step.activeFrom ?? "-"}] to choose the next output slot.`,
    done: "The output row now contains the sorted array.",
  }[step.phase] || step.message

  return (
    <SortingVisualizerShell
      algo={algo}
      onBack={onBack}
      stats={[
        `Time ${algo?.complexity || "O(n+k)"}`,
        `Phase ${phaseMeta.label}`,
        `${steps.length} steps`,
      ]}
      stageLabel="Counting sort visualization"
      visualClassName="counting-sort-visual"
      visual={
        <>
          <PhasePipeline currentPhase={step.phase} />

          <div
            className="csv-focus-card"
            style={{ "--phase-color": phaseMeta.color }}
          >
            <span className="csv-focus-card__icon">{phaseMeta.icon}</span>
            <div>
              <span className="csv-focus-card__label">{phaseMeta.label}</span>
              <p>{focusText}</p>
            </div>
          </div>

          <ArrayRow
            label="input[]"
            sublabel="original"
            highlight={step.phase === "count" || step.phase === "place"}
          >
            {step.input.map((value, index) => (
              <Cell
                key={index}
                value={value}
                index={index}
                isActive={step.activeInput === index}
                isSorted={step.phase === "done"}
              />
            ))}
          </ArrayRow>

          <div className="csv-buckets-section">
            <div className="csv-buckets-header">
              <span className="csv-buckets-header__title">
                {step.phase === "prefix" ||
                step.phase === "place" ||
                step.phase === "done"
                  ? "count[] to prefix[]"
                  : "count[]"}
              </span>
              <span className="csv-buckets-header__sub">values 0 - {maxVal}</span>
            </div>
            <div className="csv-buckets">
              {(step.count || []).map((count, value) => (
                <BucketBar
                  key={value}
                  value={value}
                  count={count}
                  prefix={step.prefix ? step.prefix[value] : null}
                  isActiveCount={step.activeCount === value}
                  isActivePrefix={
                    step.activePrefix === value || step.activeFrom === value
                  }
                  maxCount={maxCount}
                  phase={step.phase}
                />
              ))}
            </div>
          </div>

          <ArrayRow
            label="output[]"
            sublabel="sorted result"
            highlight={step.phase === "place" || step.phase === "done"}
          >
            {Array.from({ length: step.input.length }, (_, index) => {
              const value = step.output ? step.output[index] : null

              return (
                <Cell
                  key={index}
                  value={value ?? "·"}
                  index={index}
                  isActive={step.activeOutput === index}
                  isSorted={step.phase === "done" && value !== null}
                  isNull={value === null}
                />
              )
            })}
          </ArrayRow>
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
      manualInputId="counting-manual-array"
      placeholder="6, 2, 8, 3"
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
        resetRun(makeRandomValues({ length: 8, minValue: 0, maxValue: 9 }))
      }
    />
  )
}

export default CountingSortVisualizer
