import { useEffect, useMemo, useState } from "react"
import "./HeapSortVisualizer.css"

const START_VALUES = [35, 12, 68, 24, 51, 9, 44, 72, 18]
const MIN_INPUT_COUNT = 2
const MAX_INPUT_COUNT = 12
const MIN_INPUT_VALUE = 1
const MAX_INPUT_VALUE = 100

const makeRandomValues = () =>
  Array.from({ length: 9 }, () => Math.floor(Math.random() * 70) + 8)

const PSEUDOCODE_LINES = [
  "buildMaxHeap(array)",
  "for i = lastParent down to 0",
  "  heapify(array, heapSize, i)",
  "for end = n - 1 down to 1",
  "  swap array[0] with array[end]",
  "  mark array[end] as sorted",
  "  heapify(array, end, 0)",
  "heapify:",
  "  compare parent with children",
  "  swap with larger child if needed",
  "  repeat until max-heap rule holds",
]

const formatValues = (items) => items.join(", ")

const parseManualValues = (input) => {
  const values = input
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (values.length < MIN_INPUT_COUNT || values.length > MAX_INPUT_COUNT) {
    return {
      error: `Enter ${MIN_INPUT_COUNT}-${MAX_INPUT_COUNT} numbers.`,
      values: [],
    }
  }

  const parsed = values.map(Number)
  const hasInvalidValue = parsed.some(
    (value) =>
      !Number.isInteger(value) ||
      value < MIN_INPUT_VALUE ||
      value > MAX_INPUT_VALUE,
  )

  if (hasInvalidValue) {
    return {
      error: `Use whole numbers from ${MIN_INPUT_VALUE} to ${MAX_INPUT_VALUE}.`,
      values: [],
    }
  }

  return { error: "", values: parsed }
}

const getHeapNodeStyle = (index) => {
  const level = Math.floor(Math.log2(index + 1))
  const levelStart = 2 ** level - 1
  const position = index - levelStart
  const nodesInLevel = 2 ** level
  const centerColumn = Math.round(((position + 0.5) * 16) / nodesInLevel)

  return {
    gridColumn: `${Math.max(1, Math.min(15, centerColumn))} / span 2`,
    gridRow: level + 1,
  }
}

const swap = (arr, first, second) => {
  const temp = arr[first]
  arr[first] = arr[second]
  arr[second] = temp
}

const pushStep = (steps, arr, details) => {
  steps.push({
    values: [...arr],
    active: [],
    sortedFrom: arr.length,
    heapSize: arr.length,
    ...details,
  })
}

const heapify = (arr, heapSize, root, steps, phase) => {
  let largest = root
  const left = root * 2 + 1
  const right = root * 2 + 2

  pushStep(steps, arr, {
    active: [root, left, right].filter((index) => index < heapSize),
    heapSize,
    pseudocodeLine: 8,
    phase,
    message: `Heapify index ${root}. Compare it with its children.`,
  })

  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left
  }

  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right
  }

  if (largest !== root) {
    pushStep(steps, arr, {
      active: [root, largest],
      heapSize,
      pseudocodeLine: 9,
      phase,
      message: `${arr[largest]} is larger than ${arr[root]}, so swap them.`,
    })
    swap(arr, root, largest)
    pushStep(steps, arr, {
      active: [root, largest],
      heapSize,
      pseudocodeLine: 10,
      phase,
      message: "Swap complete. Continue heapifying below.",
    })
    heapify(arr, heapSize, largest, steps, phase)
  } else {
    pushStep(steps, arr, {
      active: [root],
      heapSize,
      pseudocodeLine: 10,
      phase,
      message: `${arr[root]} already satisfies the max-heap rule here.`,
    })
  }
}

const buildHeapSortSteps = (values) => {
  const arr = [...values]
  const steps = []

  pushStep(steps, arr, {
    phase: "Build max heap",
    pseudocodeLine: 0,
    message: "Start with the unsorted array.",
  })

  for (let index = Math.floor(arr.length / 2) - 1; index >= 0; index -= 1) {
    pushStep(steps, arr, {
      active: [index],
      phase: "Build max heap",
      pseudocodeLine: 1,
      message: `Build heap from index ${index}.`,
    })
    heapify(arr, arr.length, index, steps, "Build max heap")
  }

  pushStep(steps, arr, {
    active: [0],
    phase: "Extract max",
    pseudocodeLine: 3,
    message: "The max heap is ready. The largest value is at the root.",
  })

  for (let end = arr.length - 1; end > 0; end -= 1) {
    pushStep(steps, arr, {
      active: [0, end],
      heapSize: end + 1,
      sortedFrom: end + 1,
      phase: "Extract max",
      pseudocodeLine: 4,
      message: `Move ${arr[0]} to sorted position ${end}.`,
    })
    swap(arr, 0, end)
    pushStep(steps, arr, {
      active: [0, end],
      heapSize: end,
      sortedFrom: end,
      phase: "Extract max",
      pseudocodeLine: 5,
      message: `${arr[end]} is locked. Restore the heap with the remaining values.`,
    })
    pushStep(steps, arr, {
      active: [0],
      heapSize: end,
      sortedFrom: end,
      phase: "Restore heap",
      pseudocodeLine: 6,
      message: "Heapify the root of the remaining heap.",
    })
    heapify(arr, end, 0, steps, "Restore heap")
  }

  pushStep(steps, arr, {
    active: [],
    heapSize: 0,
    sortedFrom: 0,
    phase: "Done",
    pseudocodeLine: 5,
    message: "Done. The array is sorted in ascending order.",
  })

  return steps
}

function HeapSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(START_VALUES)
  const [manualInput, setManualInput] = useState(formatValues(START_VALUES))
  const [inputError, setInputError] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = useMemo(() => buildHeapSortSteps(values), [values])
  const currentStep = steps[stepIndex]
  const progress = Math.round((stepIndex / (steps.length - 1)) * 100)

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
    }, 700)

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

  return (
    <main className="heap-page">
      <header className="heap-topbar">
        <button className="heap-ghost-btn" type="button" onClick={onBack}>
          ← Algorithms
        </button>
        <span className="heap-chip">{algo.tagLabel}</span>
      </header>

      <section className="heap-hero" style={{ "--accent": algo.accent }}>
        <div className="heap-copy">
          <p className="section-label">Sorting walkthrough</p>
          <h1>{algo.title}</h1>
          <p>{algo.desc}</p>
          <div className="heap-stats">
            <span>{currentStep.phase}</span>
            <span>Heap size {currentStep.heapSize}</span>
            <span>Time {algo.complexity}</span>
          </div>
        </div>

        <div className="heap-stage" aria-label="Heap sort visualization">
          <div className="heap-workspace">
            <div className="heap-visuals">
              <div className="heap-tree">
                {currentStep.values.map((value, index) => {
                  const isActive = currentStep.active.includes(index)
                  const isSorted = index >= currentStep.sortedFrom
                  const isOutsideHeap = index >= currentStep.heapSize && !isSorted

                  return (
                    <div
                      className={`heap-node ${isActive ? "active" : ""} ${
                        isSorted ? "sorted" : ""
                      } ${isOutsideHeap ? "outside" : ""}`}
                      key={`${value}-${index}`}
                      style={getHeapNodeStyle(index)}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>

              <div
                className="heap-bars"
                style={{ "--item-count": currentStep.values.length }}
              >
                {currentStep.values.map((value, index) => {
                  const isActive = currentStep.active.includes(index)
                  const isSorted = index >= currentStep.sortedFrom

                  return (
                    <div className="heap-bar-slot" key={`${value}-${index}`}>
                      <div
                        className={`heap-bar ${isActive ? "active" : ""} ${
                          isSorted ? "sorted" : ""
                        }`}
                        style={{ height: `${value}%` }}
                      >
                        <span>{value}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <aside className="heap-pseudocode-panel" aria-label="Heap sort pseudocode">
              <span className="heap-pseudocode-title">Pseudocode</span>
              <ol>
                {PSEUDOCODE_LINES.map((line, index) => (
                  <li
                    className={
                      currentStep.pseudocodeLine === index ? "active" : ""
                    }
                    key={line}
                  >
                    <code>{line}</code>
                  </li>
                ))}
              </ol>
            </aside>
          </div>

          <div className="heap-step-panel">
            <span className="heap-step-count">
              Step {stepIndex + 1} / {steps.length}
            </span>
            <p>{currentStep.message}</p>
            <div className="heap-progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="heap-controls">
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="heap-primary-btn"
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() =>
            setStepIndex((current) => Math.min(steps.length - 1, current + 1))
          }
          disabled={stepIndex === steps.length - 1}
        >
          Next
        </button>
        <button type="button" onClick={() => resetRun()}>
          Reset
        </button>
        <button type="button" onClick={() => resetRun(makeRandomValues())}>
          Shuffle
        </button>
        <form className="heap-manual-array-form" onSubmit={applyManualValues}>
          <label htmlFor="heap-manual-array">Custom array</label>
          <input
            id="heap-manual-array"
            type="text"
            value={manualInput}
            onChange={(event) => {
              setManualInput(event.target.value)
              setInputError("")
            }}
            placeholder="35, 12, 68, 24"
            aria-describedby={
              inputError ? "heap-manual-array-error" : undefined
            }
          />
          <button type="submit">Apply</button>
          {inputError && (
            <span id="heap-manual-array-error" className="heap-manual-array-error">
              {inputError}
            </span>
          )}
        </form>
      </section>
    </main>
  )
}

export default HeapSortVisualizer
