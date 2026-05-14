// ─── quickSteps.js ────────────────────────────────────────────────────────────
// Builds a rich step array for the QuickSort visualiser.
//
// Each step carries:
//   array        – current working array (full)
//   phase        – "idle"|"choose-pivot"|"scan"|"swap"|"place-pivot"|"recurse"|"done"
//   pivotIdx     – global index of the current pivot element
//   pivotVal     – value of the current pivot
//   leftPtr      – global index of the left scanner (i)
//   rightPtr     – global index of the right scanner (j)
//   swapA/swapB  – pair of indices just swapped
//   sortedIdxs   – set (as array) of indices whose final position is confirmed
//   activeRange  – { lo, hi } — the sub-array currently being partitioned
//   callStack    – array of { lo, hi, depth } — live recursion stack
//   message      – human-readable description
//   hint         – beginner-friendly "why"

export function buildQuickSortSteps(source) {
  const arr        = [...source]
  const steps      = []
  const sortedSet  = new Set()
  const callStack  = []   // mutable; cloned per step

  const push = (extra) =>
    steps.push({
      array:       [...arr],
      phase:       "idle",
      pivotIdx:    null,
      pivotVal:    null,
      leftPtr:     null,
      rightPtr:    null,
      swapA:       null,
      swapB:       null,
      sortedIdxs:  [...sortedSet],
      activeRange: null,
      callStack:   callStack.map((f) => ({ ...f })),
      message:     "",
      hint:        "",
      ...extra,
    })

  // ── Lomuto-style partition (clearer for teaching) ─────────────────────────
  function partition(lo, hi) {
    const pivot    = arr[hi]   // last element is pivot
    const pivotIdx = hi

    push({
      phase:       "choose-pivot",
      pivotIdx,
      pivotVal:    pivot,
      activeRange: { lo, hi },
      message:     `Choose pivot = ${pivot} (last element at index ${hi})`,
      hint:        "We pick one element as the pivot. Everything smaller will go left of it, everything larger to the right.",
    })

    let i = lo - 1   // boundary: everything ≤ i is < pivot

    for (let j = lo; j < hi; j++) {
      push({
        phase:       "scan",
        pivotIdx,
        pivotVal:    pivot,
        leftPtr:     i,
        rightPtr:    j,
        activeRange: { lo, hi },
        message:     `Scan j=${j}: value ${arr[j]} vs pivot ${pivot}`,
        hint:        `The right pointer (j) walks through the sub-array. If arr[j] < pivot, we grow the "smaller" zone and swap.`,
      })

      if (arr[j] <= pivot) {
        i++
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          push({
            phase:       "swap",
            pivotIdx,
            pivotVal:    pivot,
            leftPtr:     i,
            rightPtr:    j,
            swapA:       i,
            swapB:       j,
            activeRange: { lo, hi },
            message:     `${arr[j]} ≤ ${pivot} → swap index ${i} ↔ ${j} (${arr[j]} ↔ ${arr[i]})`,
            hint:        "Swapping moves the smaller element into the 'left of pivot' zone, expanding it by one.",
          })
        } else {
          push({
            phase:       "scan",
            pivotIdx,
            pivotVal:    pivot,
            leftPtr:     i,
            rightPtr:    j,
            activeRange: { lo, hi },
            message:     `${arr[j]} ≤ ${pivot} — already in place (i = j = ${j}), no swap needed`,
            hint:        "Element is already in the correct zone, so no physical swap is needed.",
          })
        }
      }
    }

    // place pivot at i+1
    const pivotFinal = i + 1
    ;[arr[pivotFinal], arr[hi]] = [arr[hi], arr[pivotFinal]]
    sortedSet.add(pivotFinal)

    push({
      phase:       "place-pivot",
      pivotIdx:    pivotFinal,
      pivotVal:    pivot,
      leftPtr:     pivotFinal,
      rightPtr:    hi,
      swapA:       pivotFinal,
      swapB:       hi,
      sortedIdxs:  [...sortedSet],
      activeRange: { lo, hi },
      message:     `Place pivot ${pivot} at its final position — index ${pivotFinal} ✓`,
      hint:        "The pivot is now exactly where it belongs in the sorted array. It will never move again.",
    })

    return pivotFinal
  }

  function recurse(lo, hi, depth) {
    if (lo >= hi) {
      if (lo === hi) sortedSet.add(lo)
      if (lo <= hi) {
        push({
          phase:       "recurse",
          activeRange: { lo, hi },
          sortedIdxs:  [...sortedSet],
          message:     lo === hi
            ? `Base case: single element [${arr[lo]}] at index ${lo} — already sorted`
            : `Base case: empty sub-array (lo ${lo} > hi ${hi}) — nothing to do`,
          hint: "A sub-array of 0 or 1 element is always sorted — this branch is complete.",
        })
      }
      return
    }

    callStack.push({ lo, hi, depth })
    push({
      phase:       "recurse",
      activeRange: { lo, hi },
      message:     `quickSort(${lo}, ${hi}) — partitioning ${hi - lo + 1} elements: [${arr.slice(lo, hi + 1).join(", ")}]`,
      hint:        "We recursively apply quicksort to smaller and smaller sub-arrays until everything is sorted.",
    })

    const p = partition(lo, hi)

    callStack.pop()

    recurse(lo,     p - 1, depth + 1)
    recurse(p + 1,  hi,    depth + 1)
  }

  push({
    phase:   "idle",
    message: "Ready — watch the pivot partition the array step by step.",
    hint:    "QuickSort picks a pivot, moves smaller elements left and larger elements right, then recurses on each side.",
  })
  recurse(0, arr.length - 1, 0)
  push({
    phase:      "done",
    sortedIdxs: [...Array(arr.length).keys()],
    message:    "🎉 Sort complete — every element is in its final position!",
    hint:       "Each pivot placed itself permanently. Once every element has been a pivot, the whole array is sorted.",
  })

  return steps
}

export const QS_SAMPLE6 = [38, 12, 57, 7, 44, 25]
export const QS_SAMPLE8 = [64, 34, 25, 12, 22, 11, 90, 47]