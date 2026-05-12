import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  DEFAULT_FACTORIAL_N,
  MAX_FACTORIAL_N,
  MIN_FACTORIAL_N,
  buildFactorialSteps,
  normalizeFactorialInput,
} from "./factorialSteps"

const SPEED_OPTIONS = [
  { label: "Very Slow", value: 1900 },
  { label: "Slow", value: 1400 },
  { label: "Normal", value: 900 },
  { label: "Fast", value: 520 },
  { label: "Very Fast", value: 240 },
]

const CODE_LINES = [
  { id: "start", text: "function factorial(n) {" },
  { id: "base", text: "  if (n <= 1) return 1" },
  { id: "recursive", text: "  return n * factorial(n - 1)" },
  { id: "done", text: "}" },
]

function FactorialVisualizer({ onBack }) {
  const [inputValue, setInputValue] = useState(String(DEFAULT_FACTORIAL_N))
  const [factorialN, setFactorialN] = useState(DEFAULT_FACTORIAL_N)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(SPEED_OPTIONS[2].value)

  const steps = useMemo(() => buildFactorialSteps(factorialN), [factorialN])
  const activeStep = steps[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === steps.length - 1

  useEffect(() => {
    if (!isPlaying || isLastStep) return undefined

    const timer = window.setTimeout(() => {
      const nextStep = Math.min(stepIndex + 1, steps.length - 1)

      setStepIndex(nextStep)

      if (nextStep === steps.length - 1) {
        setIsPlaying(false)
      }
    }, speed)

    return () => window.clearTimeout(timer)
  }, [isPlaying, isLastStep, speed, stepIndex, steps.length])

  const updateInputValue = (event) => {
    const nextValue = event.target.value

    if (!/^\d*$/.test(nextValue)) return

    setInputValue(nextValue)
    setStepIndex(0)
    setIsPlaying(false)

    if (nextValue !== "") {
      setFactorialN(normalizeFactorialInput(nextValue))
    }
  }

  const commitInputValue = () => {
    const normalizedValue = normalizeFactorialInput(inputValue)

    setInputValue(String(normalizedValue))
    setFactorialN(normalizedValue)
  }

  const goToPreviousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0))
    setIsPlaying(false)
  }

  const goToNextStep = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  const reset = () => {
    setStepIndex(0)
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (isLastStep) {
      setStepIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying((current) => !current)
  }

  return (
    <main className="factorial-page">
      <div className="factorial-shell">
        <header className="factorial-header">
          <button className="factorial-back" type="button" onClick={onBack}>
            Back
          </button>

          <div>
            <p className="section-label">Recursion</p>
            <h1>Factorial Stack Visualizer</h1>
            <p>
              Watch each recursive call enter the stack, hit the base case, and
              unwind into the final answer.
            </p>
          </div>
        </header>

        <section className="factorial-controls" aria-label="Factorial controls">
          <label className="factorial-field">
            <span>n</span>
            <input
              type="number"
              min={MIN_FACTORIAL_N}
              max={MAX_FACTORIAL_N}
              value={inputValue}
              onChange={updateInputValue}
              onBlur={commitInputValue}
            />
          </label>

          <button type="button" onClick={goToPreviousStep} disabled={isFirstStep}>
            Previous
          </button>
          <button type="button" className="factorial-primary" onClick={togglePlayback}>
            {isPlaying ? "Pause" : isLastStep ? "Replay" : "Play"}
          </button>
          <button type="button" onClick={goToNextStep} disabled={isLastStep}>
            Next
          </button>
          <button type="button" onClick={reset} disabled={isFirstStep && !isPlaying}>
            Reset
          </button>

          <label className="factorial-field factorial-speed">
            <span>Speed</span>
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              {SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="factorial-stage">
          <div className="factorial-panel stack-panel">
            <div className="factorial-panel-head">
              <span>Call Stack</span>
              <strong>
                Step {stepIndex + 1}/{steps.length}
              </strong>
            </div>

            <div className="stack-track">
              <AnimatePresence initial={false}>
                {activeStep.stack.map((frame) => (
                  <motion.div
                    layout
                    key={frame.id}
                    className={`stack-frame ${frame.status}`}
                    initial={{ opacity: 0, y: -18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 28, scale: 0.94 }}
                    transition={{ duration: 0.22 }}
                  >
                    <span>factorial({frame.value})</span>
                    <em>{frame.result === null ? "waiting" : `returns ${frame.result}`}</em>
                  </motion.div>
                ))}
              </AnimatePresence>

              {activeStep.stack.length === 0 && (
                <motion.div
                  className="stack-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Stack cleared
                </motion.div>
              )}
            </div>
          </div>

          <div className="factorial-side">
            <div className="factorial-panel">
              <div className="factorial-panel-head">
                <span>Code Trace</span>
                <strong>{activeStep.phase}</strong>
              </div>

              <pre className="code-trace">
                {CODE_LINES.map((line) => (
                  <code
                    key={line.id}
                    className={line.id === activeStep.codeLine ? "active" : ""}
                  >
                    {line.text}
                  </code>
                ))}
              </pre>
            </div>

            <div className="factorial-panel result-panel">
              <div className="factorial-panel-head">
                <span>Current Idea</span>
                <strong>{activeStep.result === null ? "thinking" : activeStep.result}</strong>
              </div>

              <p>{activeStep.message}</p>
              <div className="factorial-expression">{activeStep.expression}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default FactorialVisualizer
