import { useEffect, useMemo, useState } from "react"
import "./InsertionSortVisualizer.css"
import SortingVisualizerShell from "../components/SortingVisualizerShell"
import {
  formatValues,
  makeRandomValues,
  parseManualValues,
} from "../utils/sortingInputs"

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

function InsertionSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(initialArray)
  const [manualInput, setManualInput] = useState(formatValues(initialArray))
  const [inputError, setInputError] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const steps = useMemo(() => buildSteps(values), [values])
  const step = steps[stepIndex]
  const passTotal = values.length - 1
  const pass = Math.min(passTotal, Math.max(0, step.i ?? step.sortedUntil))

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

  const resetWith = (nextValues = values) => {
    setIsPlaying(false)
    setValues([...nextValues])
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

    resetWith(result.values)
  }

  return (
    <SortingVisualizerShell
      algo={algo}
      onBack={onBack}
      stats={[
        `Time ${algo?.complexity || "O(n²)"}`,
        `Pass ${pass} / ${passTotal}`,
        `${steps.length} steps`,
      ]}
      stageLabel="Insertion sort visualization"
      visualClassName="insertion-sort-visual"
      visual={
        <>
          <div className="insertion-key-card">
            <div>
              <span>Key in hand</span>
              <strong>{step.keyValue ?? "-"}</strong>
            </div>
            <div>
              <span>Sorted hand</span>
              <strong>0 - {step.sortedUntil}</strong>
            </div>
            <div>
              <span>Shifts</span>
              <strong>{step.shiftCount}</strong>
            </div>
          </div>

          <div
            className="insertion-hand-row"
            style={{ "--item-count": step.array.length }}
          >
            {step.array.map((value, index) => {
              const isKey = index === step.keyIndex
              const isCompare = index === step.j
              const isShift =
                step.shift.includes(index) || index === step.insertIndex
              const isSorted = index <= step.sortedUntil

              return (
                <div
                  className={[
                    "insertion-card",
                    isSorted ? "insertion-card--sorted" : "",
                    isKey ? "insertion-card--key" : "",
                    isCompare ? "insertion-card--compare" : "",
                    isShift ? "insertion-card--shift" : "",
                  ].filter(Boolean).join(" ")}
                  key={`${value}-${index}`}
                >
                  <span>idx {index}</span>
                  <strong>{value}</strong>
                  <em>
                    {isKey
                      ? "key"
                      : isCompare
                        ? "compare"
                        : isShift
                          ? "move"
                          : isSorted
                            ? "sorted"
                            : "waiting"}
                  </em>
                </div>
              )
            })}
          </div>
        </>
      }
      pseudocodeLines={codeLines}
      activePseudocodeLine={step.activeLine - 1}
      stepIndex={stepIndex}
      stepsLength={steps.length}
      isPlaying={isPlaying}
      message={`${step.title}. ${step.text}`}
      manualInput={manualInput}
      inputError={inputError}
      manualInputId="insertion-manual-array"
      placeholder="54, 28, 76, 19"
      onManualInputChange={(value) => {
        setManualInput(value)
        setInputError("")
      }}
      onApplyManualValues={applyManualValues}
      onPrevious={() => setStepIndex((current) => Math.max(0, current - 1))}
      onTogglePlay={() => setIsPlaying((playing) => !playing)}
      onNext={() =>
        setStepIndex((current) => Math.min(steps.length - 1, current + 1))
      }
      onReset={() => resetWith()}
      onShuffle={() => resetWith(makeRandomValues())}
    />
  )
}

export default InsertionSortVisualizer
