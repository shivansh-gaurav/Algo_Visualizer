import { useEffect, useMemo, useRef, useState } from "react"
import "./FibonacciVisualizer.css"

const MIN_N = 0
const MAX_N = 8
const STEP_DELAY = 520

function clampN(value) {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) return MIN_N

  return Math.min(Math.max(Math.round(parsed), MIN_N), MAX_N)
}

function buildFibTree(n, id = "root") {
  if (n <= 1) {
    return {
      id,
      n,
      value: n,
      children: [],
    }
  }

  const left = buildFibTree(n - 1, `${id}-l`)
  const right = buildFibTree(n - 2, `${id}-r`)

  return {
    id,
    n,
    value: left.value + right.value,
    children: [left, right],
  }
}

function flattenPreorder(node, steps = []) {
  steps.push({
    id: node.id,
    n: node.n,
    value: node.value,
    isBase: node.n <= 1,
  })

  node.children.forEach((child) => flattenPreorder(child, steps))

  return steps
}

function FibNode({ node, activeId, visitedIds }) {
  const isActive = activeId === node.id
  const isVisited = visitedIds.includes(node.id)
  const isBase = node.n <= 1

  return (
    <li className="fib-tree-item">
      <div
        className={[
          "fib-node",
          isActive ? "active" : "",
          isVisited ? "visited" : "",
          isBase ? "base" : "",
        ].join(" ")}
      >
        <span className="fib-node-label">fib({node.n})</span>
        <span className="fib-node-value">{isVisited ? node.value : "..."}</span>
      </div>

      {node.children.length > 0 && (
        <ul className="fib-tree-children">
          {node.children.map((child) => (
            <FibNode
              key={child.id}
              node={child}
              activeId={activeId}
              visitedIds={visitedIds}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function FibonacciVisualizer({ algo, onBack }) {
  const [n, setN] = useState(5)
  const [activeId, setActiveId] = useState(null)
  const [visitedIds, setVisitedIds] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [finalResult, setFinalResult] = useState(null)
  const timeoutRef = useRef(null)

  const tree = useMemo(() => buildFibTree(n), [n])
  const steps = useMemo(() => flattenPreorder(tree), [tree])
  const activeStep = steps.find((step) => step.id === activeId)
  const progress = steps.length > 0 ? Math.round((visitedIds.length / steps.length) * 100) : 0

  const clearAnimationTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const resetAnimation = () => {
    clearAnimationTimer()
    setActiveId(null)
    setVisitedIds([])
    setStepIndex(0)
    setIsPlaying(false)
    setFinalResult(null)
  }

  const startVisualization = () => {
    clearAnimationTimer()
    setActiveId(null)
    setVisitedIds([])
    setStepIndex(0)
    setFinalResult(null)
    setIsPlaying(true)
  }

  const updateN = (value) => {
    setN(clampN(value))
    resetAnimation()
  }

  useEffect(() => {
    if (!isPlaying) return undefined

    timeoutRef.current = window.setTimeout(() => {
      const current = steps[stepIndex]
      const isLastStep = stepIndex >= steps.length - 1

      setActiveId(current.id)
      setVisitedIds((ids) => (
        ids.includes(current.id) ? ids : [...ids, current.id]
      ))

      if (isLastStep) {
        setIsPlaying(false)
        setFinalResult(tree.value)
      } else {
        setStepIndex((index) => index + 1)
      }
    }, STEP_DELAY)

    return clearAnimationTimer
  }, [isPlaying, stepIndex, steps, tree.value])

  useEffect(() => clearAnimationTimer, [])

  return (
    <div className="fib-page">
      <header className="fib-header">
        <button className="fib-back" type="button" onClick={onBack}>
          Back to algorithms
        </button>

        <div>
          <p className="section-label">Recursion Visualizer</p>
          <h1>{algo?.title || "Fibonacci Sequence"}</h1>
          <p>
            Watch fib(n) split into smaller calls until the base cases return
            and the final value emerges.
          </p>
        </div>
      </header>

      <main className="fib-shell">
        <section className="fib-controls" aria-label="Fibonacci controls">
          <div className="fib-control-top">
            <div>
              <span className="fib-eyebrow">Current expression</span>
              <strong>fib({n})</strong>
            </div>
            <div className="fib-result">
              <span>Result</span>
              <strong>{finalResult ?? "-"}</strong>
            </div>
          </div>

          <label className="fib-slider">
            <span>n = {n}</span>
            <input
              type="range"
              min={MIN_N}
              max={MAX_N}
              value={n}
              onChange={(event) => updateN(event.target.value)}
            />
          </label>

          <div className="fib-actions">
            <button type="button" onClick={startVisualization}>
              {isPlaying ? "Restart" : "Visualize"}
            </button>
            <button type="button" className="secondary" onClick={resetAnimation}>
              Reset
            </button>
          </div>

          <div className="fib-status">
            <div>
              <span>Active call</span>
              <strong>{activeStep ? `fib(${activeStep.n})` : "Waiting"}</strong>
            </div>
            <div>
              <span>Visited</span>
              <strong>{visitedIds.length}/{steps.length}</strong>
            </div>
          </div>

          <div className="fib-progress" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="fib-visual" aria-label="Fibonacci recursive call tree">
          <div className="fib-tree-wrap">
            <ul className="fib-tree">
              <FibNode
                node={tree}
                activeId={activeId}
                visitedIds={visitedIds}
              />
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default FibonacciVisualizer
