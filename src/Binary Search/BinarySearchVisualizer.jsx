import { useEffect, useMemo, useState } from "react"
import "./BinarySearchVisualizer.css"
import SortingVisualizerShell from "../components/SortingVisualizerShell"
import {
  formatValues,
  parseManualValues,
} from "../utils/sortingInputs"

const VALUES = [4, 9, 15, 22, 31, 38, 46, 53, 67, 74, 88]

const PSEUDOCODE_LINES = [
  "low = 0, high = n - 1",
  "while low <= high",
  "  mid = floor((low + high) / 2)",
  "  if array[mid] == target, return mid",
  "  if target < array[mid]",
  "    high = mid - 1",
  "  else",
  "    low = mid + 1",
  "target is not present",
]

const buildBinarySearchSteps = (values, target) => {
  const steps = []

  const search = (low, high, depth = 0) => {
    if (low > high) {
      steps.push({
        low,
        high,
        mid: null,
        depth,
        found: false,
        done: true,
        activeLine: 9,
        message: `${target} is not in the array. The search window is empty.`,
      })
      return
    }

    const mid = Math.floor((low + high) / 2)
    const midValue = values[mid]

    steps.push({
      low,
      high,
      mid,
      depth,
      found: midValue === target,
      done: midValue === target,
      activeLine: midValue === target ? 4 : 3,
      message: `Check middle index ${mid}: ${midValue}.`,
    })

    if (midValue === target) return

    if (target < midValue) {
      steps.push({
        low,
        high: mid - 1,
        mid,
        depth,
        found: false,
        done: false,
        activeLine: 5,
        message: `${target} is smaller than ${midValue}, so discard the right half.`,
      })
      search(low, mid - 1, depth + 1)
    } else {
      steps.push({
        low: mid + 1,
        high,
        mid,
        depth,
        found: false,
        done: false,
        activeLine: 7,
        message: `${target} is larger than ${midValue}, so discard the left half.`,
      })
      search(mid + 1, high, depth + 1)
    }
  }

  steps.push({
    low: 0,
    high: values.length - 1,
    mid: null,
    depth: 0,
    found: false,
    done: false,
    activeLine: 1,
    message: `Start with the whole sorted array and look for ${target}.`,
  })

  search(0, values.length - 1)

  return steps
}

const isSortedAscending = (items) =>
  items.every((value, index) => index === 0 || items[index - 1] <= value)

const getMissingTarget = (items) => {
  const seen = new Set(items)
  let candidate = Math.floor((items[0] + items[items.length - 1]) / 2)

  while (seen.has(candidate)) {
    candidate += 1
  }

  return candidate
}

function BinarySearchVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(VALUES)
  const [target, setTarget] = useState(46)
  const [manualInput, setManualInput] = useState(formatValues(VALUES))
  const [inputError, setInputError] = useState("")
  const [sortNotice, setSortNotice] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = useMemo(() => buildBinarySearchSteps(values, target), [values, target])
  const currentStep = steps[stepIndex]

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

  const updateTarget = (nextTarget) => {
    setIsPlaying(false)
    setTarget(nextTarget)
    setStepIndex(0)
  }

  const resetRun = () => {
    setIsPlaying(false)
    setStepIndex(0)
  }

  const applyManualValues = (event) => {
    event.preventDefault()

    const result = parseManualValues(manualInput, {
      maxCount: 14,
      minValue: 1,
      maxValue: 999,
    })

    if (result.error) {
      setInputError(result.error)
      return
    }

    const wasSorted = isSortedAscending(result.values)
    const sortedValues = [...result.values].sort((a, b) => a - b)

    setIsPlaying(false)
    setValues(sortedValues)
    setTarget(sortedValues[Math.floor(sortedValues.length / 2)])
    setManualInput(formatValues(sortedValues))
    setInputError("")
    setSortNotice(
      wasSorted
        ? ""
        : "Binary search needs a sorted array, so your custom array was sorted first.",
    )
    setStepIndex(0)
  }

  const windowSize =
    currentStep.low <= currentStep.high
      ? currentStep.high - currentStep.low + 1
      : 0
  const midValue =
    currentStep.mid === null ? "-" : values[currentStep.mid]
  const targetOptions = useMemo(() => {
    const options = [...new Set(values)]
    const missing = getMissingTarget(values)
    return options.includes(target) ? [...options, missing] : [...options, target]
  }, [target, values])

  return (
    <SortingVisualizerShell
      algo={algo}
      onBack={onBack}
      eyebrow="Recursive walkthrough"
      stats={[
        `Target ${target}`,
        `Window ${windowSize} items`,
        `Time ${algo?.complexity || "O(log n)"}`,
      ]}
      stageLabel="Binary search visualization"
      visualClassName="binary-search-visual"
      visual={
        <>
          {sortNotice && (
            <div className="binary-sort-notice">
              {sortNotice}
            </div>
          )}

          <div className="binary-status-card">
            <div>
              <span>Search window</span>
              <strong>
                {windowSize > 0
                  ? `${currentStep.low} - ${currentStep.high}`
                  : "empty"}
              </strong>
            </div>
            <div>
              <span>Middle value</span>
              <strong>{midValue}</strong>
            </div>
            <div>
              <span>Depth</span>
              <strong>{currentStep.depth}</strong>
            </div>
          </div>

          <div
            className="binary-board"
            style={{ "--item-count": values.length }}
          >
            {values.map((value, index) => {
              const isActive =
                index >= currentStep.low && index <= currentStep.high
              const isMiddle = index === currentStep.mid
              const isFound = currentStep.found && isMiddle

              return (
                <div
                  className={[
                    "binary-cell",
                    isActive ? "binary-cell--active" : "binary-cell--discarded",
                    isMiddle ? "binary-cell--middle" : "",
                    isFound ? "binary-cell--found" : "",
                  ].filter(Boolean).join(" ")}
                  key={`${value}-${index}`}
                >
                  <span className="binary-cell__index">idx {index}</span>
                  <strong>{value}</strong>
                  <span className="binary-cell__role">
                    {isFound
                      ? "found"
                      : isMiddle
                        ? "mid"
                        : isActive
                          ? "keep"
                          : "discard"}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="binary-pointer-row">
            <span>low {currentStep.low}</span>
            <span>mid {currentStep.mid === null ? "-" : currentStep.mid}</span>
            <span>high {currentStep.high}</span>
          </div>
        </>
      }
      pseudocodeLines={PSEUDOCODE_LINES}
      activePseudocodeLine={currentStep.activeLine - 1}
      stepIndex={stepIndex}
      stepsLength={steps.length}
      isPlaying={isPlaying}
      message={currentStep.message}
      manualInput={manualInput}
      inputError={inputError}
      manualInputId="binary-manual-array"
      placeholder="22, 4, 38, 9"
      onManualInputChange={(value) => {
        setManualInput(value)
        setInputError("")
        setSortNotice("")
      }}
      onApplyManualValues={applyManualValues}
      onPrevious={() => setStepIndex((current) => Math.max(0, current - 1))}
      onTogglePlay={() => setIsPlaying((playing) => !playing)}
      onNext={() =>
        setStepIndex((current) => Math.min(steps.length - 1, current + 1))
      }
      onReset={resetRun}
      extraControls={
        <label className="binary-target-control">
          Target
          <select
            value={target}
            onChange={(event) => updateTarget(Number(event.target.value))}
          >
            {targetOptions.sort((a, b) => a - b).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      }
    />
  )
}

export default BinarySearchVisualizer
