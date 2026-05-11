import { useEffect, useMemo, useState } from "react"
import "./BubbleSortVisualizer.css"

const START_VALUES = [42, 18, 68, 31, 55, 12, 76, 24]

const makeRandomValues = () =>
  Array.from({ length: 8 }, () => Math.floor(Math.random() * 65) + 12)

const PSEUDOCODE_LINES = [
  "for end = n - 1 down to 1",
  "  swapped = false",
  "  for i = 0 to end - 1",
  "    compare arr[i] and arr[i + 1]",
  "    if arr[i] > arr[i + 1]",
  "      swap arr[i], arr[i + 1]",
  "      swapped = true",
  "  mark arr[end] as sorted",
  "  if swapped is false, stop early",
]

const buildBubbleSortSteps = (values) => {
  const arr = [...values]
  const steps = [
    {
      values: [...arr],
      comparing: [],
      sortedFrom: arr.length,
      swapped: false,
      pseudocodeLine: 0,
      message: "Start with the unsorted array.",
    },
  ]

  for (let end = arr.length - 1; end > 0; end -= 1) {
    let swappedInPass = false

    steps.push({
      values: [...arr],
      comparing: [],
      sortedFrom: end + 1,
      swapped: false,
      pseudocodeLine: 1,
      message: `Begin a new pass. Everything from index ${end + 1} onward is already sorted.`,
    })

    for (let i = 0; i < end; i += 1) {
      steps.push({
        values: [...arr],
        comparing: [i, i + 1],
        sortedFrom: end + 1,
        swapped: false,
        pseudocodeLine: 3,
        message: `Compare ${arr[i]} and ${arr[i + 1]}.`,
      })

      if (arr[i] > arr[i + 1]) {
        steps.push({
          values: [...arr],
          comparing: [i, i + 1],
          sortedFrom: end + 1,
          swapped: false,
          pseudocodeLine: 4,
          message: `${arr[i]} is greater than ${arr[i + 1]}, so the if condition is true.`,
        })

        const leftValue = arr[i]
        arr[i] = arr[i + 1]
        arr[i + 1] = leftValue
        swappedInPass = true

        steps.push({
          values: [...arr],
          comparing: [i, i + 1],
          sortedFrom: end + 1,
          swapped: true,
          pseudocodeLine: 5,
          message: "Swap them because the left value is bigger.",
        })
      } else {
        steps.push({
          values: [...arr],
          comparing: [i, i + 1],
          sortedFrom: end + 1,
          swapped: false,
          pseudocodeLine: 4,
          message: `${arr[i]} is not greater than ${arr[i + 1]}, so no swap is needed.`,
        })
      }
    }

    steps.push({
      values: [...arr],
      comparing: [],
      sortedFrom: end,
      swapped: false,
      pseudocodeLine: 7,
      message: `${arr[end]} is now locked into its sorted position.`,
    })

    if (!swappedInPass) {
      steps.push({
        values: [...arr],
        comparing: [],
        sortedFrom: end,
        swapped: false,
        pseudocodeLine: 8,
        message: "No swaps happened in this pass, so the array is already sorted.",
      })
      break
    }
  }

  steps.push({
    values: [...arr],
    comparing: [],
    sortedFrom: 0,
    swapped: false,
    pseudocodeLine: 8,
    message: "Done. Every value is in ascending order.",
  })

  return steps
}

function BubbleSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(START_VALUES)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = useMemo(() => buildBubbleSortSteps(values), [values])
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
    }, 650)

    return () => window.clearInterval(timer)
  }, [isPlaying, steps.length])

  const resetRun = (nextValues = values) => {
    setIsPlaying(false)
    setValues(nextValues)
    setStepIndex(0)
  }

  return (
    <main className="visualizer-page">
      <header className="visualizer-topbar">
        <button className="ghost-btn" type="button" onClick={onBack}>
          ← Algorithms
        </button>
        <span className="visualizer-chip">{algo.tagLabel}</span>
      </header>

      <section className="visualizer-hero" style={{ "--accent": algo.accent }}>
        <div className="visualizer-copy">
          <p className="section-label">Interactive walkthrough</p>
          <h1>{algo.title}</h1>
          <p>{algo.desc}</p>
          <div className="visualizer-stats">
            <span>Time {algo.complexity}</span>
            <span>Beginner friendly</span>
            <span>{steps.length} steps</span>
          </div>
        </div>

        <div className="sort-stage" aria-label="Bubble sort visualization">
          <div className="sort-workspace">
            <div className="bars">
              {currentStep.values.map((value, index) => {
                const isComparing = currentStep.comparing.includes(index)
                const isSorted = index >= currentStep.sortedFrom

                return (
                  <div className="bar-slot" key={`${value}-${index}`}>
                    <div
                      className={`bar ${isComparing ? "comparing" : ""} ${
                        currentStep.swapped && isComparing ? "swapped" : ""
                      } ${isSorted ? "sorted" : ""}`}
                      style={{ height: `${value}%` }}
                    >
                      <span>{value}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <aside className="pseudocode-panel" aria-label="Bubble sort pseudocode">
              <span className="pseudocode-title">Pseudocode</span>
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

          <div className="step-panel">
            <div>
              <span className="step-count">
                Step {stepIndex + 1} / {steps.length}
              </span>
              <p>{currentStep.message}</p>
            </div>
            <div className="progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="control-strip">
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="primary-btn"
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
      </section>
    </main>
  )
}

export default BubbleSortVisualizer
