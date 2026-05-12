import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "./SelectionSortVisualizer.css"

const codeLines = [
  "for i = 0 to n - 2",
  "  minIndex = i",
  "  for j = i + 1 to n - 1",
  "    if array[j] < array[minIndex]",
  "      minIndex = j",
  "  if minIndex != i",
  "    swap array[i] and array[minIndex]",
  "  mark array[i] as sorted",
]

const initialArray = [52, 26, 74, 18, 61, 39, 84, 47]

function createStep(config) {
  return {
    array: [...config.array],
    activeLine: config.activeLine,
    i: config.i ?? null,
    j: config.j ?? null,
    min: config.min ?? null,
    sortedUntil: config.sortedUntil ?? -1,
    compareCount: config.compareCount ?? 0,
    swapCount: config.swapCount ?? 0,
    swap: config.swap ?? [],
    label: config.label,
    title: config.title,
    text: config.text,
  }
}

function buildSteps(source) {
  const arr = [...source]
  const output = []
  let compareCount = 0
  let swapCount = 0

  output.push(createStep({
    array: arr,
    activeLine: 1,
    label: "Ready",
    title: "Begin selection sort",
    text: "The algorithm scans the unsorted part and selects the smallest value for each position.",
  }))

  for (let i = 0; i < arr.length - 1; i += 1) {
    output.push(createStep({
      array: arr,
      activeLine: 1,
      i,
      sortedUntil: i - 1,
      compareCount,
      swapCount,
      label: `Pass ${i + 1}`,
      title: `Fill position ${i}`,
      text: `Everything before index ${i} is sorted. Now find the smallest value from index ${i} onward.`,
    }))

    let minIndex = i
    output.push(createStep({
      array: arr,
      activeLine: 2,
      i,
      min: minIndex,
      sortedUntil: i - 1,
      compareCount,
      swapCount,
      label: `Pass ${i + 1}`,
      title: `Set minIndex to ${i}`,
      text: `Start by assuming ${arr[i]} at index ${i} is the smallest remaining value.`,
    }))

    for (let j = i + 1; j < arr.length; j += 1) {
      output.push(createStep({
        array: arr,
        activeLine: 3,
        i,
        j,
        min: minIndex,
        sortedUntil: i - 1,
        compareCount,
        swapCount,
        label: `Pass ${i + 1}`,
        title: `Move j to index ${j}`,
        text: `Compare the current candidate ${arr[minIndex]} with ${arr[j]}.`,
      }))

      compareCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 4,
        i,
        j,
        min: minIndex,
        sortedUntil: i - 1,
        compareCount,
        swapCount,
        label: `Comparison ${compareCount}`,
        title: `${arr[j]} < ${arr[minIndex]}?`,
        text: arr[j] < arr[minIndex]
          ? "Yes. This value becomes the new smallest candidate."
          : "No. Keep the current minIndex and continue scanning.",
      }))

      if (arr[j] < arr[minIndex]) {
        minIndex = j
        output.push(createStep({
          array: arr,
          activeLine: 5,
          i,
          j,
          min: minIndex,
          sortedUntil: i - 1,
          compareCount,
          swapCount,
          label: "New minimum",
          title: `minIndex is now ${j}`,
          text: `${arr[j]} is the smallest value seen in this pass so far.`,
        }))
      }
    }

    output.push(createStep({
      array: arr,
      activeLine: 6,
      i,
      min: minIndex,
      sortedUntil: i - 1,
      compareCount,
      swapCount,
      label: `Pass ${i + 1}`,
      title: minIndex === i ? "No swap needed" : "Smallest value found",
      text: minIndex === i
        ? `${arr[i]} is already in the correct position.`
        : `${arr[minIndex]} at index ${minIndex} belongs at index ${i}.`,
    }))

    if (minIndex !== i) {
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
      swapCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 7,
        i,
        min: minIndex,
        sortedUntil: i - 1,
        compareCount,
        swapCount,
        swap: [i, minIndex],
        label: `Swap ${swapCount}`,
        title: `Swap indexes ${i} and ${minIndex}`,
        text: "The smallest remaining value is moved into its final place for this pass.",
      }))
    }

    output.push(createStep({
      array: arr,
      activeLine: 8,
      i,
      min: minIndex,
      sortedUntil: i,
      compareCount,
      swapCount,
      label: `Sorted index ${i}`,
      title: `${arr[i]} is locked in`,
      text: "Selection sort never needs to move this position again.",
    }))
  }

  output.push(createStep({
    array: arr,
    activeLine: 8,
    sortedUntil: arr.length - 1,
    compareCount,
    swapCount,
    label: "Complete",
    title: "Array sorted",
    text: "Every pass placed one smallest remaining value into its final position.",
  }))

  return output
}

function randomArray() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 75) + 15)
}

function SelectionSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(initialArray)
  const [stepIndex, setStepIndex] = useState(0)
  const [speed, setSpeed] = useState(700)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)
  const steps = useMemo(() => buildSteps(values), [values])
  const step = steps[stepIndex]
  const passTotal = values.length - 1
  const pass = step.sortedUntil >= passTotal ? passTotal : Math.max(0, (step.i ?? 0) + 1)
  const maxValue = Math.max(...step.array)

  const stopPlaying = useCallback(() => {
    setIsPlaying(false)
    window.clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const resetWith = (nextValues) => {
    stopPlaying()
    setValues([...nextValues])
    setStepIndex(0)
  }

  const goNext = useCallback(() => {
    setStepIndex((index) => {
      if (index < steps.length - 1) return index + 1

      stopPlaying()
      return index
    })
  }, [steps.length, stopPlaying])

  useEffect(() => {
    if (!isPlaying) return undefined

    timerRef.current = window.setInterval(goNext, speed)

    return () => window.clearInterval(timerRef.current)
  }, [goNext, isPlaying, speed])

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  return (
    <main className="selection-page">
      <header className="selection-topbar">
        <div className="selection-title">
          <h1>{algo?.title || "Selection Sort"} Visualizer</h1>
          <p>
            Watch each pass choose the smallest remaining value, swap it into
            place, and lock the sorted section from left to right.
          </p>
        </div>
        <button className="selection-back-link" type="button" onClick={onBack}>Back</button>
      </header>

      <section className="selection-layout" aria-label="Selection sort visualizer">
        <div className="selection-panel selection-visual-panel">
          <div className="selection-stats">
            <div className="selection-stat"><span>Pass</span><strong>{pass} / {passTotal}</strong></div>
            <div className="selection-stat"><span>Comparisons</span><strong>{step.compareCount}</strong></div>
            <div className="selection-stat"><span>Swaps</span><strong>{step.swapCount}</strong></div>
            <div className="selection-stat"><span>Min index</span><strong>{step.min ?? "-"}</strong></div>
          </div>

          <div className="selection-stage" aria-live="polite">
            {step.array.map((value, index) => {
              const classes = [
                "selection-bar-wrap",
                index <= step.sortedUntil ? "sorted" : "",
                index === step.i ? "current" : "",
                index === step.j ? "compare" : "",
                index === step.min ? "minimum" : "",
                step.swap.includes(index) ? "swap" : "",
              ].filter(Boolean).join(" ")

              return (
                <div className={classes} aria-label={`Value ${value}`} key={`${index}-${value}`}>
                  <div className="selection-bar" style={{ height: `${Math.max(20, (value / maxValue) * 310)}px` }} />
                  <div className="selection-bar-label">{value}</div>
                </div>
              )
            })}
          </div>

          <div className="selection-legend" aria-label="Color key">
            <span><span style={{ background: "#22d3ee" }} />current pass</span>
            <span><span style={{ background: "#f472b6" }} />comparing</span>
            <span><span style={{ background: "#fbbf24" }} />smallest</span>
            <span><span style={{ background: "#fb7185" }} />swap</span>
            <span><span style={{ background: "#4ade80" }} />sorted</span>
          </div>

          <div className="selection-controls">
            <div className="selection-control-buttons">
              <button className="selection-btn primary" type="button" onClick={() => {
                if (isPlaying) {
                  stopPlaying()
                } else {
                  if (stepIndex >= steps.length - 1) setStepIndex(0)
                  setIsPlaying(true)
                }
              }}>{isPlaying ? "Pause" : "Play"}</button>
              <button className="selection-btn" type="button" disabled={stepIndex >= steps.length - 1} onClick={() => {
                stopPlaying()
                goNext()
              }}>Next Step</button>
              <button className="selection-btn" type="button" onClick={() => resetWith(values)}>Reset</button>
              <button className="selection-btn" type="button" onClick={() => resetWith(randomArray())}>New Array</button>
            </div>
            <label className="selection-speed">
              Speed
              <input type="range" min="180" max="1300" step="40" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
            </label>
          </div>
        </div>

        <aside className="selection-panel selection-side-panel">
          <div className="selection-step-card">
            <span>{step.label}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </div>

          <div className="selection-code" aria-label="Selection sort code">
            {codeLines.map((line, index) => {
              const lineNumber = index + 1
              const classes = [
                "selection-code-line",
                lineNumber === step.activeLine ? "active" : "",
                lineNumber < step.activeLine ? "done" : "",
              ].filter(Boolean).join(" ")

              return (
                <div className={classes} key={line}>
                  <span className="selection-line-no">{lineNumber}</span>
                  <span>{line}</span>
                </div>
              )
            })}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default SelectionSortVisualizer
