import { useEffect, useMemo, useState } from "react"
import "./MergeSortVisualizer.css"
import SortingVisualizerShell from "../components/SortingVisualizerShell"
import {
  formatValues,
  makeRandomValues,
  parseManualValues,
} from "../utils/sortingInputs"

const codeLines = [
  "width = 1",
  "while width < n",
  "  for start = 0 to n - 1 step 2 * width",
  "    split into left and right runs",
  "    compare front values",
  "    write the smaller value",
  "    copy remaining values",
  "  width = width * 2",
  "array is sorted",
]

const initialArray = [58, 23, 76, 11, 64, 37, 90, 44]

function createStep(config) {
  return {
    array: [...config.array],
    activeLine: config.activeLine,
    lo: config.lo ?? null,
    mid: config.mid ?? null,
    hi: config.hi ?? null,
    width: config.width ?? 1,
    leftIndex: config.leftIndex ?? null,
    rightIndex: config.rightIndex ?? null,
    writeIndex: config.writeIndex ?? null,
    leftBuffer: config.leftBuffer ? [...config.leftBuffer] : [],
    rightBuffer: config.rightBuffer ? [...config.rightBuffer] : [],
    compareCount: config.compareCount ?? 0,
    writeCount: config.writeCount ?? 0,
    label: config.label,
    title: config.title,
    text: config.text,
  }
}

function buildSteps(source) {
  const arr = [...source]
  const n = arr.length
  const output = []
  let compareCount = 0
  let writeCount = 0

  output.push(createStep({
    array: arr,
    activeLine: 1,
    width: 1,
    label: "Ready",
    title: "Start with tiny sorted runs",
    text: "Every single value is already a sorted run of length 1.",
  }))

  const mergeRange = (lo, mid, hi, width) => {
    const left = arr.slice(lo, mid + 1)
    const right = arr.slice(mid + 1, hi + 1)
    let l = 0
    let r = 0
    let w = lo

    output.push(createStep({
      array: arr,
      activeLine: 4,
      lo,
      mid,
      hi,
      width,
      leftBuffer: left,
      rightBuffer: right,
      compareCount,
      writeCount,
      label: `Merge ${lo}-${hi}`,
      title: `Merge two sorted runs`,
      text: `Left run [${left.join(", ")}] and right run [${right.join(", ")}] will be zipped together.`,
    }))

    while (l < left.length && r < right.length) {
      compareCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 5,
        lo,
        mid,
        hi,
        width,
        leftIndex: lo + l,
        rightIndex: mid + 1 + r,
        writeIndex: w,
        leftBuffer: left,
        rightBuffer: right,
        compareCount,
        writeCount,
        label: `Compare ${compareCount}`,
        title: `${left[l]} vs ${right[r]}`,
        text: left[l] <= right[r]
          ? `${left[l]} is smaller or equal, so it goes into index ${w}.`
          : `${right[r]} is smaller, so it goes into index ${w}.`,
      }))

      if (left[l] <= right[r]) {
        arr[w] = left[l]
        l += 1
      } else {
        arr[w] = right[r]
        r += 1
      }

      writeCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 6,
        lo,
        mid,
        hi,
        width,
        writeIndex: w,
        leftBuffer: left,
        rightBuffer: right,
        compareCount,
        writeCount,
        label: `Write ${writeCount}`,
        title: `Place ${arr[w]} at index ${w}`,
        text: "The merged run grows one slot from left to right.",
      }))

      w += 1
    }

    while (l < left.length) {
      arr[w] = left[l]
      l += 1
      writeCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 7,
        lo,
        mid,
        hi,
        width,
        writeIndex: w,
        leftBuffer: left,
        rightBuffer: right,
        compareCount,
        writeCount,
        label: `Copy left`,
        title: `Copy remaining ${arr[w]}`,
        text: "The right run is empty, so the rest of the left run can slide in.",
      }))
      w += 1
    }

    while (r < right.length) {
      arr[w] = right[r]
      r += 1
      writeCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 7,
        lo,
        mid,
        hi,
        width,
        writeIndex: w,
        leftBuffer: left,
        rightBuffer: right,
        compareCount,
        writeCount,
        label: `Copy right`,
        title: `Copy remaining ${arr[w]}`,
        text: "The left run is empty, so the rest of the right run can slide in.",
      }))
      w += 1
    }

    output.push(createStep({
      array: arr,
      activeLine: 6,
      lo,
      mid,
      hi,
      width,
      leftBuffer: left,
      rightBuffer: right,
      compareCount,
      writeCount,
      label: `Sorted ${lo}-${hi}`,
      title: `Run ${lo}-${hi} is sorted`,
      text: "Two smaller sorted runs have become one larger sorted run.",
    }))
  }

  let width = 1
  while (width < n) {
    output.push(createStep({
      array: arr,
      activeLine: 2,
      width,
      compareCount,
      writeCount,
      label: `Width ${width}`,
      title: `Merge runs of width ${width}`,
      text: `Pairs of sorted runs with length ${width} are merged into runs of length ${width * 2}.`,
    }))

    for (let i = 0; i < n; i += 2 * width) {
      const lo = i
      const mid = Math.min(i + width - 1, n - 1)
      const hi = Math.min(i + 2 * width - 1, n - 1)

      if (mid < hi) {
        mergeRange(lo, mid, hi, width)
      }
    }

    width *= 2
  }

  output.push(createStep({
    array: arr,
    activeLine: 9,
    width,
    compareCount,
    writeCount,
    label: "Complete",
    title: "Array sorted",
    text: "Every run has merged back into one sorted array.",
  }))

  return output
}

function MergeSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(initialArray)
  const [manualInput, setManualInput] = useState(formatValues(initialArray))
  const [inputError, setInputError] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = useMemo(() => buildSteps(values), [values])
  const step = steps[stepIndex]

  useEffect(() => {
    if (!isPlaying) return undefined

    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= steps.length - 1) {
          setIsPlaying(false)
          return current
        }

        return current + 1
      })
    }, 650)

    return () => window.clearInterval(timer)
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

  const activeRange = step.lo != null && step.hi != null
  const leftActive =
    activeRange && step.leftIndex != null ? step.leftIndex - step.lo : null
  const rightActive =
    activeRange && step.rightIndex != null ? step.rightIndex - step.mid - 1 : null

  return (
    <SortingVisualizerShell
      algo={algo}
      onBack={onBack}
      stats={[
        `Time ${algo?.complexity || "O(n log n)"}`,
        `Run width ${step.width}`,
        `${steps.length} steps`,
      ]}
      stageLabel="Merge sort visualization"
      visualClassName="merge-sort-visual"
      visual={
        <>
          <div className="merge-run-card">
            <div>
              <span>Current run</span>
              <strong>
                {activeRange ? `${step.lo} - ${step.hi}` : "waiting"}
              </strong>
            </div>
            <div>
              <span>Comparisons</span>
              <strong>{step.compareCount}</strong>
            </div>
            <div>
              <span>Writes</span>
              <strong>{step.writeCount}</strong>
            </div>
          </div>

          <div
            className="merge-main-array"
            style={{ "--item-count": step.array.length }}
          >
            {step.array.map((value, index) => {
              const inRange =
                activeRange && index >= step.lo && index <= step.hi
              const isLeft = activeRange && index >= step.lo && index <= step.mid
              const isRight = activeRange && index > step.mid && index <= step.hi
              const isWrite = index === step.writeIndex
              const isDone = step.label === "Complete"

              return (
                <div
                  className={[
                    "merge-tile",
                    inRange ? "merge-tile--range" : "",
                    isLeft ? "merge-tile--left" : "",
                    isRight ? "merge-tile--right" : "",
                    isWrite ? "merge-tile--write" : "",
                    isDone ? "merge-tile--done" : "",
                  ].filter(Boolean).join(" ")}
                  key={`${value}-${index}`}
                >
                  <span className="merge-tile__index">{index}</span>
                  <strong>{value}</strong>
                </div>
              )
            })}
          </div>

          <div className="merge-buffer-grid">
            <div className="merge-buffer">
              <span className="merge-buffer__title">Left run</span>
              <div className="merge-buffer__items">
                {step.leftBuffer.length ? (
                  step.leftBuffer.map((value, index) => (
                    <span
                      className={index === leftActive ? "active" : ""}
                      key={`${value}-${index}`}
                    >
                      {value}
                    </span>
                  ))
                ) : (
                  <em>waiting</em>
                )}
              </div>
            </div>
            <div className="merge-buffer">
              <span className="merge-buffer__title">Right run</span>
              <div className="merge-buffer__items">
                {step.rightBuffer.length ? (
                  step.rightBuffer.map((value, index) => (
                    <span
                      className={index === rightActive ? "active" : ""}
                      key={`${value}-${index}`}
                    >
                      {value}
                    </span>
                  ))
                ) : (
                  <em>waiting</em>
                )}
              </div>
            </div>
          </div>
        </>
      }
      pseudocodeLines={codeLines}
      activePseudocodeLine={step.activeLine - 1}
      stepIndex={stepIndex}
      stepsLength={steps.length}
      isPlaying={isPlaying}
      message={`${step.title}. ${step.text}`}
      manualInput={manualInput}
      inputError={inputError}
      manualInputId="merge-manual-array"
      placeholder="58, 23, 76, 11"
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
        resetRun(makeRandomValues({ length: 8, minValue: 10, maxValue: 90 }))
      }
    />
  )
}

export default MergeSortVisualizer
