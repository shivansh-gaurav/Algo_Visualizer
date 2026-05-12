import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "./MergeSortVisualizer.css"

const codeLines = [
  "mergeSort(array, lo, hi)",
  "  if lo >= hi: return",
  "  mid = (lo + hi) // 2",
  "  mergeSort(array, lo, mid)",
  "  mergeSort(array, mid + 1, hi)",
  "  merge(array, lo, mid, hi)",
  "merge(array, lo, mid, hi)",
  "  create left and right buffers",
  "  while left and right: compare and write smaller",
  "  copy remaining items",
]

const initialArray = [58, 23, 76, 11, 64, 37, 90, 44]

function createStep(config) {
  return {
    array: [...config.array],
    activeLine: config.activeLine,
    lo: config.lo ?? null,
    mid: config.mid ?? null,
    hi: config.hi ?? null,
    leftIndex: config.leftIndex ?? null,
    rightIndex: config.rightIndex ?? null,
    writeIndex: config.writeIndex ?? null,
    compareCount: config.compareCount ?? 0,
    writeCount: config.writeCount ?? 0,
    label: config.label,
    title: config.title,
    text: config.text,
  }
}

function buildSteps(source) {
  const arr = [...source]
  const output = []
  let compareCount = 0
  let writeCount = 0

  output.push(createStep({
    array: arr,
    activeLine: 1,
    label: "Ready",
    title: "Begin merge sort",
    text: "Divide the array and merge sorted halves back together.",
  }))

  function mergeRange(lo, mid, hi) {
    const left = arr.slice(lo, mid + 1)
    const right = arr.slice(mid + 1, hi + 1)
    let l = 0
    let r = 0
    let w = lo

    output.push(createStep({
      array: arr,
      activeLine: 7,
      lo,
      mid,
      hi,
      label: `Merge [${lo}-${hi}]`,
      title: `Merging ranges ${lo}-${mid} and ${mid + 1}-${hi}`,
      text: `Create left and right buffers to prepare for merging.`,
    }))

    while (l < left.length && r < right.length) {
      compareCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 9,
        lo,
        mid,
        hi,
        leftIndex: lo + l,
        rightIndex: mid + 1 + r,
        writeIndex: w,
        compareCount,
        writeCount,
        label: `Compare ${compareCount}`,
        title: `${left[l]} ? ${right[r]}`,
        text: left[l] <= right[r]
          ? `Left ${left[l]} is smaller or equal; it will be written into index ${w}.`
          : `Right ${right[r]} is smaller; it will be written into index ${w}.`,
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
        activeLine: 9,
        lo,
        mid,
        hi,
        writeIndex: w,
        compareCount,
        writeCount,
        label: `Write ${writeCount}`,
        title: `Wrote value at index ${w}`,
        text: `One item written into the merged range at index ${w}.`,
      }))

      w += 1
    }

    while (l < left.length) {
      arr[w] = left[l]
      l += 1
      writeCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 10,
        lo,
        mid,
        hi,
        writeIndex: w,
        compareCount,
        writeCount,
        label: `Write ${writeCount}`,
        title: `Copy remaining left to ${w}`,
        text: `Left buffer item moved into place.`,
      }))
      w += 1
    }

    while (r < right.length) {
      arr[w] = right[r]
      r += 1
      writeCount += 1
      output.push(createStep({
        array: arr,
        activeLine: 10,
        lo,
        mid,
        hi,
        writeIndex: w,
        compareCount,
        writeCount,
        label: `Write ${writeCount}`,
        title: `Copy remaining right to ${w}`,
        text: `Right buffer item moved into place.`,
      }))
      w += 1
    }

    // mark this range as sorted
    output.push(createStep({
      array: arr,
      activeLine: 6,
      lo,
      mid,
      hi,
      label: `Sorted ${lo}-${hi}`,
      title: `Range ${lo} to ${hi} is now sorted`,
      text: `Merged subranges are now in order.`,
    }))
  }

  function recurse(lo, hi) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    output.push(createStep({
      array: arr,
      activeLine: 2,
      lo,
      mid,
      hi,
      label: `Split ${lo}-${hi}`,
      title: `Divide ${lo}-${hi}`,
      text: `Split into ${lo}-${mid} and ${mid + 1}-${hi}`,
    }))
    recurse(lo, mid)
    recurse(mid + 1, hi)
    mergeRange(lo, mid, hi)
  }

  recurse(0, arr.length - 1)

  output.push(createStep({
    array: arr,
    activeLine: 6,
    label: "Complete",
    title: "Array sorted",
    text: "The entire array is now sorted by merge sort.",
  }))

  return output
}

function randomArray() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 75) + 10)
}

function MergeSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(initialArray)
  const [stepIndex, setStepIndex] = useState(0)
  const [speed, setSpeed] = useState(700)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)
  const steps = useMemo(() => buildSteps(values), [values])
  const step = steps[stepIndex]
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
    <main className="merge-page">
      <header className="merge-topbar">
        <div className="merge-title">
          <h1>{algo?.title || "Merge Sort"} Visualizer</h1>
          <p>
            Divide the array into halves, sort each half, and merge them back together.
          </p>
        </div>
        <button className="merge-back-link" type="button" onClick={onBack}>Back</button>
      </header>

      <section className="merge-layout" aria-label="Merge sort visualizer">
        <div className="merge-panel merge-visual-panel">
          <div className="merge-stats">
            <div className="merge-stat"><span>Comparisons</span><strong>{step.compareCount}</strong></div>
            <div className="merge-stat"><span>Writes</span><strong>{step.writeCount}</strong></div>
            <div className="merge-stat"><span>Range</span><strong>{step.lo ?? "-"} - {step.hi ?? "-"}</strong></div>
            <div className="merge-stat"><span>Step</span><strong>{step.label}</strong></div>
          </div>

          <div className="merge-stage" aria-live="polite">
            {step.array.map((value, index) => {
              const classes = [
                "merge-bar-wrap",
                index >= (step.lo ?? -1) && index <= (step.hi ?? -2) ? "in-range" : "",
                index === step.leftIndex ? "left" : "",
                index === step.rightIndex ? "right" : "",
                index === step.writeIndex ? "write" : "",
              ].filter(Boolean).join(" ")

              return (
                <div className={classes} aria-label={`Value ${value}`} key={`${index}-${value}`}>
                  <div className="merge-bar" style={{ height: `${Math.max(18, (value / maxValue) * 300)}px` }} />
                  <div className="merge-bar-label">{value}</div>
                </div>
              )
            })}
          </div>

          <div className="merge-legend" aria-label="Color key">
            <span><span style={{ background: "#60a5fa" }} />active</span>
            <span><span style={{ background: "#22d3ee" }} />left</span>
            <span><span style={{ background: "#fbbf24" }} />right</span>
            <span><span style={{ background: "#fb7185" }} />write</span>
          </div>

          <div className="merge-controls">
            <div className="merge-control-buttons">
              <button className="merge-btn primary" type="button" onClick={() => {
                if (isPlaying) {
                  stopPlaying()
                } else {
                  if (stepIndex >= steps.length - 1) setStepIndex(0)
                  setIsPlaying(true)
                }
              }}>{isPlaying ? "Pause" : "Play"}</button>
              <button className="merge-btn" type="button" disabled={stepIndex >= steps.length - 1} onClick={() => {
                stopPlaying()
                goNext()
              }}>Next Step</button>
              <button className="merge-btn" type="button" onClick={() => resetWith(values)}>Reset</button>
              <button className="merge-btn" type="button" onClick={() => resetWith(randomArray())}>New Array</button>
            </div>
            <label className="merge-speed">
              Speed
              <input type="range" min="120" max="1400" step="40" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
            </label>
          </div>
        </div>

        <aside className="merge-panel merge-side-panel">
          <div className="merge-step-card">
            <span>{step.label}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </div>

          <div className="merge-code" aria-label="Merge sort code">
            {codeLines.map((line, index) => {
              const lineNumber = index + 1
              const classes = [
                "merge-code-line",
                lineNumber === step.activeLine ? "active" : "",
                lineNumber < step.activeLine ? "done" : "",
              ].filter(Boolean).join(" ")

              return (
                <div className={classes} key={line}>
                  <span className="merge-line-no">{lineNumber}</span>
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

export default MergeSortVisualizer
