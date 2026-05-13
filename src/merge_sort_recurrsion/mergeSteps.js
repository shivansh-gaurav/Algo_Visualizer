// ─── mergeSteps.js ───────────────────────────────────────────────────────────
// Builds a rich step array for the recursive merge-sort tree visualiser.
// Each step carries:
//   array          – current state of the full working array
//   treeNodes      – snapshot of every tree node (id, level, lo, hi, values, state)
//   activeId       – which node is currently "active"
//   phase          – "split" | "merge" | "compare" | "write" | "done"
//   leftId/rightId – ids of nodes being merged (merge phase)
//   compareIdx     – {left, right} indices in the node being merged
//   writeIdx       – global index being written
//   message        – human-readable description
//   hint           – one-line "why this matters" for beginners

let nodeCounter = 0

function makeNode(lo, hi, arr, level) {
  return {
    id: nodeCounter++,
    lo,
    hi,
    level,
    values: arr.slice(lo, hi + 1),
    state: "pending",   // pending | active | splitting | merging | sorted
    leftChildId: null,
    rightChildId: null,
    parentId: null,
  }
}

export function buildMergeRecSteps(source) {
  nodeCounter = 0
  const arr = [...source]
  const steps = []
  const allNodes = {}          // id → node (shared mutable object, cloned per step)

  // ── helpers ────────────────────────────────────────────────────────────────
  const cloneNodes = () =>
    Object.fromEntries(
      Object.entries(allNodes).map(([k, v]) => [k, { ...v, values: [...v.values] }])
    )

  const push = (extra) =>
    steps.push({
      array: [...arr],
      treeNodes: cloneNodes(),
      phase: "idle",
      activeId: null,
      leftId: null,
      rightId: null,
      compareIdx: null,
      writeIdx: null,
      message: "",
      hint: "",
      ...extra,
    })

  // ── recursive builder ──────────────────────────────────────────────────────
  function recurse(lo, hi, level, parentId) {
    const node = makeNode(lo, hi, arr, level)
    node.parentId = parentId
    allNodes[node.id] = node

    if (parentId !== null) {
      const parent = allNodes[parentId]
      if (parent.leftChildId === null) parent.leftChildId = node.id
      else parent.rightChildId = node.id
    }

    // ── "call" step ──────────────────────────────────────────────────────────
    node.state = "active"
    push({
      phase: "split",
      activeId: node.id,
      message: lo === hi
        ? `Base case: subarray [${arr[lo]}] — single element, already sorted`
        : `Split [${arr.slice(lo, hi + 1).join(", ")}] → left half & right half`,
      hint: lo === hi
        ? "A single element can't be out of order — this branch is done."
        : "Divide and conquer: keep halving until each piece is just one element.",
    })

    if (lo >= hi) {
      node.state = "sorted"
      push({
        phase: "split",
        activeId: node.id,
        message: `[${arr[lo]}] is a base case — returning immediately`,
        hint: "Nothing to sort here — pass this back up to the parent.",
      })
      return node.id
    }

    const mid = Math.floor((lo + hi) / 2)
    node.state = "splitting"
    push({
      phase: "split",
      activeId: node.id,
      message: `Mid = ${mid}. Left subarray indices ${lo}–${mid}, Right ${mid + 1}–${hi}`,
      hint: `We pick the middle index to split the array into two roughly equal halves.`,
    })

    const leftId  = recurse(lo,      mid, level + 1, node.id)
    const rightId = recurse(mid + 1, hi,  level + 1, node.id)

    // ── merge ────────────────────────────────────────────────────────────────
    const left  = arr.slice(lo, mid + 1)
    const right = arr.slice(mid + 1, hi + 1)

    node.leftChildId  = leftId
    node.rightChildId = rightId
    node.state = "merging"

    push({
      phase: "merge",
      activeId: node.id,
      leftId,
      rightId,
      message: `Merge [${left.join(", ")}] + [${right.join(", ")}] back into one sorted array`,
      hint: "Both halves are already sorted — we just zip them together in order.",
    })

    let l = 0, r = 0, w = lo

    while (l < left.length && r < right.length) {
      push({
        phase: "compare",
        activeId: node.id,
        leftId,
        rightId,
        compareIdx: { left: lo + l, right: mid + 1 + r },
        message: `Compare ${left[l]} (left) vs ${right[r]} (right) — pick the smaller`,
        hint: "We always take the smaller of the two front elements to build a sorted result.",
      })

      if (left[l] <= right[r]) {
        arr[w] = left[l++]
      } else {
        arr[w] = right[r++]
      }

      node.values = arr.slice(lo, hi + 1)
      allNodes[node.id] = { ...node, values: [...node.values] }

      push({
        phase: "write",
        activeId: node.id,
        leftId,
        rightId,
        writeIdx: w,
        message: `Write ${arr[w]} into position ${w}`,
        hint: "The smaller value wins this round and gets placed next in the merged result.",
      })
      w++
    }

    while (l < left.length) {
      arr[w] = left[l++]
      node.values = arr.slice(lo, hi + 1)
      push({
        phase: "write",
        activeId: node.id,
        leftId, rightId,
        writeIdx: w,
        message: `Copy remaining left value ${arr[w]} to position ${w}`,
        hint: "Left side has leftovers — append them all since they're already sorted.",
      })
      w++
    }

    while (r < right.length) {
      arr[w] = right[r++]
      node.values = arr.slice(lo, hi + 1)
      push({
        phase: "write",
        activeId: node.id,
        leftId, rightId,
        writeIdx: w,
        message: `Copy remaining right value ${arr[w]} to position ${w}`,
        hint: "Right side has leftovers — append them all since they're already sorted.",
      })
      w++
    }

    node.state = "sorted"
    node.values = arr.slice(lo, hi + 1)
    allNodes[node.id] = { ...node, values: [...node.values] }

    push({
      phase: "merge",
      activeId: node.id,
      leftId, rightId,
      message: `✓ Merged: [${arr.slice(lo, hi + 1).join(", ")}] — this segment is sorted`,
      hint: "Two sorted halves become one sorted segment. This bubbles up the tree.",
    })

    return node.id
  }

  push({ phase: "idle", message: "Ready to sort — watch the array split and merge!", hint: "Merge sort splits the array down to individual elements, then merges them back sorted." })
  recurse(0, arr.length - 1, 0, null)
  push({ phase: "done", message: "🎉 Sort complete — the entire array is now sorted!", hint: "Every split was undone by a merge, each time in sorted order. That's merge sort." })

  return steps
}

export const SAMPLE   = [58, 23, 76, 11, 64, 37]
export const SAMPLE8  = [42, 15, 88, 4, 67, 31, 55, 20]
