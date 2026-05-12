import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "./InsertionSortVisualizer.css"

const codeLines = [
  "for i = 1 to n - 1",
  "  key = array[i]",
  "  j = i - 1",
  "  while j >= 0 and array[j] > key",
  "    array[j + 1] = array[j]",
  "    j = j - 1",
  "  array[j + 1] = key",
  "  mark array[0..i] as sorted",
]

const initialArray = [54, 28, 76, 19, 63, 41, 85, 36]

function createStep(config) {
  return {
    array: [...config.array],
    activeLine: config.activeLine,
    i: config.i ?? null,
    j: config.j ?? null,
    keyIndex: config.keyIndex ?? null,
    keyValue: config.keyValue ?? null,
    sortedUntil: config.sortedUntil ?? 0,
    compareCount: config.compareCount ?? 0,
    shiftCount: config.shiftCount ?? 0,
    shift: config.shift ?? [],
    insertIndex: config.insertIndex ?? null,
    label: config.label,
    title: config.title,
    text: config.text,
  }
}

function buildSteps(source) {
  const arr = [...source]
  const output = []
  let compareCount = 0
  let shiftCount = 0

  output.push(createStep({
    array: arr,
    activeLine: 1,
    sortedUntil: 0,
    label: "Ready",
    title: "Begin insertion sort",
    text: "Index 0 is already a sorted one-item section. Each next value will be inserted into that section.",
  }))

  for (let i = 1; i < arr.length; i += 1) {
    output.push(createStep({
      array: arr,
      activeLine: 1,
      i,
      sortedUntil: i - 1,
      compareCount,
      shiftCount,
      label: `Pass ${i}`,
      title: `Insert index ${i}`,
      text: `Take ${arr[i]} and place it into the sorted section on the left.`,
    }))

    const key = arr[i]
    output.push(createStep({
      array: arr,
      activeLine: 2,
      i,
      keyIndex: i,
      keyValue: key,
      sortedUntil: i - 1,
      compareCount,
      shiftCount,
      label: `Pass ${i}`,
      title: `Key is ${key}`,
      text: `Store ${key} so larger values can shift right without losing it.`,
    }))

    let j = i - 1
    output.push(createStep({
      array: arr,
      activeLine: 3,
      i,
      j,
      keyIndex: i,
      keyValue: key,
      sortedUntil: i - 1,
      compareCount,
      shiftCount,
      label: `Pass ${i}`,
      title: `Start checking at index ${j}`,
      text: "Compare the key with values in the sorted section, moving from right to left.",
    }))

    while (j >= 0) {
      compareCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 4,
        i,
        j,
        keyIndex: i,
        keyValue: key,
        sortedUntil: i - 1,
        compareCount,
        shiftCount,
        label: `Comparison ${compareCount}`,
        title: `${arr[j]} > ${key}?`,
        text: arr[j] > key
          ? "Yes. Shift this larger value one position to the right."
          : "No. The correct insertion point is just after this value.",
      }))

      if (arr[j] <= key) break

      arr[j + 1] = arr[j]
      shiftCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 5,
        i,
        j,
        keyValue: key,
        sortedUntil: i - 1,
        compareCount,
        shiftCount,
        shift: [j, j + 1],
        label: `Shift ${shiftCount}`,
        title: `Move ${arr[j]} right`,
        text: `Index ${j + 1} now holds ${arr[j]}, making room for the key.`,
      }))

      j -= 1
      output.push(createStep({
        array: arr,
        activeLine: 6,
        i,
        j,
        keyValue: key,
        sortedUntil: i - 1,
        compareCount,
        shiftCount,
        label: `Pass ${i}`,
        title: `Move j to ${j}`,
        text: j >= 0
          ? `Keep scanning left from index ${j}.`
          : "j moved before the array, so the key belongs at index 0.",
      }))
    }

    arr[j + 1] = key
    output.push(createStep({
      array: arr,
      activeLine: 7,
      i,
      j,
      keyValue: key,
      sortedUntil: i - 1,
      compareCount,
      shiftCount,
      insertIndex: j + 1,
      label: "Insert",
      title: `Place ${key} at index ${j + 1}`,
      text: "The key is inserted after all larger values have shifted right.",
    }))

    output.push(createStep({
      array: arr,
      activeLine: 8,
      i,
      keyValue: key,
      sortedUntil: i,
      compareCount,
      shiftCount,
      label: `Sorted through ${i}`,
      title: `Indexes 0 through ${i} are sorted`,
      text: "The sorted section grew by one value.",
    }))
  }

  output.push(createStep({
    array: arr,
    activeLine: 8,
    sortedUntil: arr.length - 1,
    compareCount,
    shiftCount,
    label: "Complete",
    title: "Array sorted",
    text: "Every value has been inserted into its correct position.",
  }))

  return output
}

function randomArray() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 75) + 15)
}

function InsertionSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(initialArray)
  const [stepIndex, setStepIndex] = useState(0)
  const [speed, setSpeed] = useState(700)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)
  const steps = useMemo(() => buildSteps(values), [values])
  const step = steps[stepIndex]
  const passTotal = values.length - 1
  const pass = Math.min(passTotal, Math.max(0, step.i ?? step.sortedUntil))
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
    <main className="insertion-page">
      <header className="insertion-topbar">
        <div className="insertion-title">
          <h1>{algo?.title || "Insertion Sort"} Visualizer</h1>
          <p>
            Watch the algorithm take one key value at a time, shift larger
            sorted values to the right, and insert the key into its correct spot.
          </p>
        </div>
        <button className="insertion-back-link" type="button" onClick={onBack}>Back</button>
      </header>

      <section className="insertion-layout" aria-label="Insertion sort visualizer">
        <div className="insertion-panel insertion-visual-panel">
          <div className="insertion-stats">
            <div className="insertion-stat"><span>Pass</span><strong>{pass} / {passTotal}</strong></div>
            <div className="insertion-stat"><span>Comparisons</span><strong>{step.compareCount}</strong></div>
            <div className="insertion-stat"><span>Shifts</span><strong>{step.shiftCount}</strong></div>
            <div className="insertion-stat"><span>Key</span><strong>{step.keyValue ?? "-"}</strong></div>
          </div>

          <div className="insertion-stage" aria-live="polite">
            {step.array.map((value, index) => {
              const classes = [
                "insertion-bar-wrap",
                index <= step.sortedUntil ? "sorted" : "",
                index === step.keyIndex ? "key" : "",
                index === step.j ? "compare" : "",
                step.shift.includes(index) ? "shift" : "",
                index === step.insertIndex ? "insert" : "",
              ].filter(Boolean).join(" ")

              return (
                <div className={classes} aria-label={`Value ${value}`} key={`${index}-${value}`}>
                  <div className="insertion-bar" style={{ height: `${Math.max(20, (value / maxValue) * 310)}px` }} />
                  <div className="insertion-bar-label">{value}</div>
                </div>
              )
            })}
          </div>

          <div className="insertion-legend" aria-label="Color key">
            <span><span style={{ background: "#4ade80" }} />sorted part</span>
            <span><span style={{ background: "#fbbf24" }} />key</span>
            <span><span style={{ background: "#f472b6" }} />comparing</span>
            <span><span style={{ background: "#fb7185" }} />shift right</span>
            <span><span style={{ background: "#22d3ee" }} />insert</span>
          </div>

          <div className="insertion-controls">
            <div className="insertion-control-buttons">
              <button className="insertion-btn primary" type="button" onClick={() => {
                if (isPlaying) {
                  stopPlaying()
                } else {
                  if (stepIndex >= steps.length - 1) setStepIndex(0)
                  setIsPlaying(true)
                }
              }}>{isPlaying ? "Pause" : "Play"}</button>
              <button className="insertion-btn" type="button" disabled={stepIndex >= steps.length - 1} onClick={() => {
                stopPlaying()
                goNext()
              }}>Next Step</button>
              <button className="insertion-btn" type="button" onClick={() => resetWith(values)}>Reset</button>
              <button className="insertion-btn" type="button" onClick={() => resetWith(randomArray())}>New Array</button>
            </div>
            <label className="insertion-speed">
              Speed
              <input type="range" min="180" max="1300" step="40" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
            </label>
          </div>
        </div>

        <aside className="insertion-panel insertion-side-panel">
          <div className="insertion-step-card">
            <span>{step.label}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </div>

          <div className="insertion-code" aria-label="Insertion sort code">
            {codeLines.map((line, index) => {
              const lineNumber = index + 1
              const classes = [
                "insertion-code-line",
                lineNumber === step.activeLine ? "active" : "",
                lineNumber < step.activeLine ? "done" : "",
              ].filter(Boolean).join(" ")

              return (
                <div className={classes} key={line}>
                  <span className="insertion-line-no">{lineNumber}</span>
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

export default InsertionSortVisualizer
