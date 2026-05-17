import { useEffect, useMemo, useState } from "react"
import "./SelectionSortVisualizer.css"
import SortingVisualizerShell from "../components/SortingVisualizerShell"
import {
  formatValues,
  makeRandomValues,
  parseManualValues,
} from "../utils/sortingInputs"

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

function SelectionSortVisualizer({ algo, onBack }) {
  const [values, setValues] = useState(initialArray)
  const [manualInput, setManualInput] = useState(formatValues(initialArray))
  const [inputError, setInputError] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const steps = useMemo(() => buildSteps(values), [values])
  const step = steps[stepIndex]
  const passTotal = values.length - 1
  const pass = step.sortedUntil >= passTotal ? passTotal : Math.max(0, (step.i ?? 0) + 1)
  const minValue = step.min == null ? "-" : step.array[step.min]
  const scanValue = step.j == null ? "-" : step.array[step.j]

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
      stageLabel="Selection sort visualization"
      visualClassName="selection-sort-visual"
      visual={
        <>
          <div className="selection-hunt-card">
            <div>
              <span>Position to fill</span>
              <strong>{step.i ?? pass}</strong>
            </div>
            <div>
              <span>Smallest found</span>
              <strong>{minValue}</strong>
            </div>
            <div>
              <span>Scanner value</span>
              <strong>{scanValue}</strong>
            </div>
          </div>

          <div
            className="selection-candidate-row"
            style={{ "--item-count": step.array.length }}
          >
            {step.array.map((value, index) => {
              const isCurrent = index === step.i
              const isScanner = index === step.j
              const isMinimum = index === step.min
              const isSwapping = step.swap.includes(index)
              const isSorted = index <= step.sortedUntil

              return (
                <div
                  className={[
                    "selection-candidate",
                    isCurrent ? "selection-candidate--current" : "",
                    isScanner ? "selection-candidate--scanner" : "",
                    isMinimum ? "selection-candidate--minimum" : "",
                    isSwapping ? "selection-candidate--swap" : "",
                    isSorted ? "selection-candidate--sorted" : "",
                  ].filter(Boolean).join(" ")}
                  key={`${value}-${index}`}
                >
                  <span>idx {index}</span>
                  <strong>{value}</strong>
                  <em>
                    {isSorted
                      ? "locked"
                      : isMinimum
                        ? "smallest"
                        : isScanner
                          ? "checking"
                          : isCurrent
                            ? "slot"
                            : "unsorted"}
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
      manualInputId="selection-manual-array"
      placeholder="52, 26, 74, 18"
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

export default SelectionSortVisualizer
