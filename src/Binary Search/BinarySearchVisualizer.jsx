import { useEffect, useMemo, useState } from "react"
import "./BinarySearchVisualizer.css"

const VALUES = [4, 9, 15, 22, 31, 38, 46, 53, 67, 74, 88]

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
        message: `${target} is smaller than ${midValue}, so search the left half.`,
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
        message: `${target} is larger than ${midValue}, so search the right half.`,
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
    message: `Start with the whole sorted array and look for ${target}.`,
  })

  search(0, values.length - 1)

  return steps
}

function BinarySearchVisualizer({ algo, onBack }) {
  const [target, setTarget] = useState(46)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = useMemo(() => buildBinarySearchSteps(VALUES, target), [target])
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
    }, 780)

    return () => window.clearInterval(timer)
  }, [isPlaying, steps.length])

  const updateTarget = (nextTarget) => {
    setIsPlaying(false)
    setTarget(nextTarget)
    setStepIndex(0)
  }

  return (
    <main className="bs-page">
      <header className="bs-topbar">
        <button className="bs-ghost-btn" type="button" onClick={onBack}>
          ← Algorithms
        </button>
        <span className="bs-chip">{algo.tagLabel}</span>
      </header>

      <section className="bs-hero" style={{ "--accent": algo.accent }}>
        <div className="bs-copy">
          <p className="section-label">Recursive walkthrough</p>
          <h1>{algo.title}</h1>
          <p>{algo.desc}</p>
          <div className="bs-stats">
            <span>Target {target}</span>
            <span>Depth {currentStep.depth}</span>
            <span>Time {algo.complexity}</span>
          </div>
        </div>

        <div className="bs-stage" aria-label="Binary search visualization">
          <div className="bs-array">
            {VALUES.map((value, index) => {
              const isActive =
                index >= currentStep.low && index <= currentStep.high
              const isMiddle = index === currentStep.mid
              const isFound = currentStep.found && isMiddle

              return (
                <div
                  className={`bs-cell ${isActive ? "active" : "discarded"} ${
                    isMiddle ? "middle" : ""
                  } ${isFound ? "found" : ""}`}
                  key={value}
                >
                  <span className="bs-index">{index}</span>
                  <strong>{value}</strong>
                </div>
              )
            })}
          </div>

          <div className="bs-window">
            <span>Low {currentStep.low}</span>
            <span>
              Mid {currentStep.mid === null ? "-" : currentStep.mid}
            </span>
            <span>High {currentStep.high}</span>
          </div>

          <div className="bs-step-panel">
            <span className="bs-step-count">
              Step {stepIndex + 1} / {steps.length}
            </span>
            <p>{currentStep.message}</p>
            <div className="bs-progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="bs-controls">
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="bs-primary-btn"
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
        <button type="button" onClick={() => updateTarget(target)}>
          Reset
        </button>
        <label className="bs-target-control">
          Target
          <select
            value={target}
            onChange={(event) => updateTarget(Number(event.target.value))}
          >
            {[...VALUES, 50].sort((a, b) => a - b).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </section>
    </main>
  )
}

export default BinarySearchVisualizer
