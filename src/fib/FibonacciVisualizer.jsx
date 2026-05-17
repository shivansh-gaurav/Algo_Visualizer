import { useEffect, useMemo, useState } from "react"
import "./FibonacciVisualizer.css"

const MIN_N = 0
const MAX_N = 7

const PSEUDOCODE_LINES = [
  "fib(n)",
  "  if n <= 1, return n",
  "  left = fib(n - 1)",
  "  right = fib(n - 2)",
  "  return left + right",
]

const clampN = (value) => {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) return MIN_N

  return Math.min(Math.max(Math.round(parsed), MIN_N), MAX_N)
}

function buildFibTree(n, id = "root", depth = 0) {
  if (n <= 1) {
    return {
      id,
      n,
      depth,
      value: n,
      children: [],
    }
  }

  const left = buildFibTree(n - 1, `${id}-l`, depth + 1)
  const right = buildFibTree(n - 2, `${id}-r`, depth + 1)

  return {
    id,
    n,
    depth,
    value: left.value + right.value,
    children: [left, right],
  }
}

function buildFibSteps(tree) {
  const steps = []
  const resolved = new Set()

  const push = (details) => {
    steps.push({
      activeId: null,
      pathIds: [],
      focusIds: [],
      resolvedIds: [...resolved],
      activeLine: 1,
      phase: "call",
      message: "",
      stack: [],
      result: null,
      formula: "",
      ...details,
    })
  }

  const visit = (node, path) => {
    const nextPath = [...path, node]

    push({
      activeId: node.id,
      pathIds: nextPath.map((item) => item.id),
      activeLine: 1,
      phase: "call",
      message: `Call fib(${node.n}).`,
      stack: nextPath.map((item) => `fib(${item.n})`),
      formula: `fib(${node.n})`,
    })

    if (node.n <= 1) {
      push({
        activeId: node.id,
        pathIds: nextPath.map((item) => item.id),
        activeLine: 2,
        phase: "base",
        message: `Base case: fib(${node.n}) returns ${node.value}.`,
        stack: nextPath.map((item) => `fib(${item.n})`),
        formula: `fib(${node.n}) = ${node.value}`,
      })
      resolved.add(node.id)
      push({
        activeId: node.id,
        pathIds: nextPath.map((item) => item.id),
        resolvedIds: [...resolved],
        activeLine: 2,
        phase: "return",
        message: `Return ${node.value} to the parent call.`,
        stack: path.map((item) => `fib(${item.n})`),
        result: node.value,
        formula: `return ${node.value}`,
      })
      return
    }

    push({
      activeId: node.id,
      pathIds: nextPath.map((item) => item.id),
      focusIds: node.children.map((child) => child.id),
      activeLine: 3,
      phase: "split",
      message: `fib(${node.n}) splits into fib(${node.n - 1}) and fib(${node.n - 2}).`,
      stack: nextPath.map((item) => `fib(${item.n})`),
      formula: `fib(${node.n - 1}) + fib(${node.n - 2})`,
    })

    visit(node.children[0], nextPath)
    visit(node.children[1], nextPath)

    push({
      activeId: node.id,
      pathIds: nextPath.map((item) => item.id),
      focusIds: node.children.map((child) => child.id),
      activeLine: 5,
      phase: "combine",
      message: `Combine ${node.children[0].value} and ${node.children[1].value}.`,
      stack: nextPath.map((item) => `fib(${item.n})`),
      formula: `${node.children[0].value} + ${node.children[1].value} = ${node.value}`,
    })
    resolved.add(node.id)
    push({
      activeId: node.id,
      pathIds: nextPath.map((item) => item.id),
      resolvedIds: [...resolved],
      activeLine: 5,
      phase: "return",
      message: `Return fib(${node.n}) = ${node.value}.`,
      stack: path.map((item) => `fib(${item.n})`),
      result: node.value,
      formula: `fib(${node.n}) = ${node.value}`,
    })
  }

  visit(tree, [])

  push({
    activeId: tree.id,
    pathIds: [tree.id],
    resolvedIds: [...resolved],
    activeLine: 5,
    phase: "done",
    message: `Done. fib(${tree.n}) is ${tree.value}.`,
    stack: [],
    result: tree.value,
    formula: `answer = ${tree.value}`,
  })

  return steps
}

function FibTreeNode({ node, step }) {
  const isActive = step.activeId === node.id
  const isResolved = step.resolvedIds.includes(node.id)
  const isPath = step.pathIds.includes(node.id)
  const isFocus = step.focusIds.includes(node.id)
  const isBase = node.n <= 1

  return (
    <li className="fib-tree-item">
      <div
        className={[
          "fib-tree-node",
          isActive ? "fib-tree-node--active" : "",
          isResolved ? "fib-tree-node--resolved" : "",
          isPath ? "fib-tree-node--path" : "",
          isFocus ? "fib-tree-node--focus" : "",
          isBase ? "fib-tree-node--base" : "",
        ].filter(Boolean).join(" ")}
      >
        <span className="fib-tree-node__call">fib({node.n})</span>
        <strong>{isResolved || isActive ? node.value : "?"}</strong>
        <span className="fib-tree-node__type">
          {isBase ? "base" : "call"}
        </span>
      </div>

      {node.children.length > 0 && (
        <ul className="fib-tree-children">
          {node.children.map((child) => (
            <FibTreeNode key={child.id} node={child} step={step} />
          ))}
        </ul>
      )}
    </li>
  )
}

function FibonacciVisualizer({ algo, onBack }) {
  const [n, setN] = useState(5)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const tree = useMemo(() => buildFibTree(n), [n])
  const steps = useMemo(() => buildFibSteps(tree), [tree])
  const step = steps[stepIndex]
  const progress = Math.round((stepIndex / Math.max(1, steps.length - 1)) * 100)
  const treeScale = n >= 7 ? 0.72 : n === 6 ? 0.84 : 1
  const treeWidth = `${Math.round((1 / treeScale) * 100)}%`

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
    }, 720)

    return () => window.clearInterval(timer)
  }, [isPlaying, steps.length])

  const updateN = (nextN) => {
    setIsPlaying(false)
    setN(clampN(nextN))
    setStepIndex(0)
  }

  return (
    <main
      className="fib-page"
      style={{ "--accent": algo?.accent || "#f87171" }}
    >
      <header className="fib-topbar">
        <button className="fib-back" type="button" onClick={onBack}>
          ← Algorithms
        </button>
        <span className="fib-chip">{algo?.tagLabel || "Recursion"}</span>
      </header>

      <section className="fib-hero">
        <div className="fib-copy">
          <p className="section-label">Recursive call tree</p>
          <h1>{algo?.title || "Fibonacci Sequence"}</h1>
          <p>{algo?.desc}</p>
          <div className="fib-stats">
            <span>n = {n}</span>
            <span>Result {step.result ?? "-"}</span>
            <span>{steps.length} steps</span>
          </div>
        </div>

        <div className="fib-stage" aria-label="Fibonacci recursion visualizer">
          <div className="fib-workspace">
            <div className="fib-tree-panel">
              <div className="fib-phase-card">
                <span>{step.phase}</span>
                <strong>{step.formula}</strong>
                <p>{step.message}</p>
              </div>

              <div
                className="fib-tree-scroll"
                style={{
                  "--tree-scale": treeScale,
                  "--tree-width": treeWidth,
                }}
              >
                <ul className="fib-tree-root">
                  <FibTreeNode node={tree} step={step} />
                </ul>
              </div>
            </div>

            <div className="fib-support-row">
              <div className="fib-stack-card">
                <span>Call stack</span>
                <div>
                  {step.stack.length ? (
                    step.stack.map((item, index) => (
                      <strong key={`${item}-${index}`}>{item}</strong>
                    ))
                  ) : (
                    <strong>empty</strong>
                  )}
                </div>
              </div>

              <aside className="fib-pseudocode-panel" aria-label="Fibonacci pseudocode">
                <span className="fib-pseudocode-title">Pseudocode</span>
                <ol>
                  {PSEUDOCODE_LINES.map((line, index) => (
                    <li
                      className={step.activeLine - 1 === index ? "active" : ""}
                      key={line}
                    >
                      <code>{line}</code>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          </div>

          <div className="fib-step-panel">
            <div>
              <span className="fib-step-count">
                Step {stepIndex + 1} / {steps.length}
              </span>
              <p>{step.message}</p>
            </div>
            <div className="fib-progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="fib-controls">
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="fib-primary-btn"
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
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false)
            setStepIndex(0)
          }}
        >
          Reset
        </button>
        <label className="fib-n-control">
          n
          <input
            type="range"
            min={MIN_N}
            max={MAX_N}
            value={n}
            onChange={(event) => updateN(event.target.value)}
          />
          <strong>{n}</strong>
        </label>
      </section>
    </main>
  )
}

export default FibonacciVisualizer
