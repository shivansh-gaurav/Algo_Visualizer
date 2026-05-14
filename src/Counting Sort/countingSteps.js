// ─── countingSteps.js ─────────────────────────────────────────────────────────
// Builds a rich step array for the Counting Sort visualiser.
//
// The algorithm has 3 visually distinct phases:
//   Phase 1 — COUNT:   tally occurrences of each value into count[]
//   Phase 2 — PREFIX:  turn count[] into cumulative prefix sums (start positions)
//   Phase 3 — PLACE:   read input right-to-left, use count[] to place into output[]
//
// Each step carries:
//   input        – original input array (never mutated)
//   count        – count[] at this moment
//   prefix       – prefix[] at this moment (null until phase 2)
//   output       – output[] at this moment (null until phase 3)
//   phase        – "idle"|"count"|"prefix"|"place"|"done"
//   activeInput  – index in input currently being read
//   activeCount  – index in count currently being written/read
//   activePrefix – index in prefix currently being computed
//   activeOutput – index in output currently being written
//   activeFrom   – index in count being decremented (place phase)
//   message      – human-readable description
//   hint         – beginner-friendly "why"

export function buildCountingSortSteps(source) {
  const input  = [...source]
  const maxVal = Math.max(...input)
  const steps  = []

  // working state
  const count  = new Array(maxVal + 1).fill(0)
  const prefix = new Array(maxVal + 1).fill(0)
  const output = new Array(input.length).fill(null)

  const push = (extra) =>
    steps.push({
      input:        [...input],
      count:        [...count],
      prefix:       prefix.some((v) => v > 0) ? [...prefix] : null,
      output:       output.some((v) => v !== null) ? [...output] : null,
      phase:        "idle",
      activeInput:  null,
      activeCount:  null,
      activePrefix: null,
      activeOutput: null,
      activeFrom:   null,
      maxVal,
      message:      "",
      hint:         "",
      ...extra,
    })

  // ── initial ───────────────────────────────────────────────────────────────
  push({
    phase:   "idle",
    message: `Input: [${input.join(", ")}] — values range from 0 to ${maxVal}`,
    hint:    "Counting Sort doesn't compare elements at all. It counts how many times each value appears, then uses those counts to place values directly.",
  })

  // ── Phase 1: COUNT ────────────────────────────────────────────────────────
  push({
    phase:   "count",
    message: "Phase 1 — COUNT: scan through the input and tally each value",
    hint:    "We walk through the input once and increment a bucket for each value we see. No comparisons needed!",
  })

  for (let i = 0; i < input.length; i++) {
    const val = input[i]
    push({
      phase:       "count",
      activeInput: i,
      activeCount: val,
      message:     `Read input[${i}] = ${val} → increment count[${val}] from ${count[val]} to ${count[val] + 1}`,
      hint:        `Every time we see value ${val}, we add 1 to its bucket. This tells us how many ${val}s exist.`,
    })
    count[val]++
    push({
      phase:       "count",
      activeInput: i,
      activeCount: val,
      message:     `count[${val}] is now ${count[val]}`,
      hint:        `count[] now shows: ${count.map((c, k) => `${k}→${c}`).slice(0, 6).join(", ")}…`,
    })
  }

  push({
    phase:   "count",
    message: `Count complete! count[] = [${count.join(", ")}]`,
    hint:    "Each bucket now tells us exactly how many times that value appears in the input.",
  })

  // ── Phase 2: PREFIX SUM ───────────────────────────────────────────────────
  push({
    phase:   "prefix",
    message: "Phase 2 — PREFIX SUM: convert counts into start positions in the output",
    hint:    "We add each count to the running total. This transforms 'how many' into 'where to start placing' each value in the output array.",
  })

  // copy count → prefix, then compute prefix sums
  for (let k = 0; k <= maxVal; k++) prefix[k] = count[k]

  prefix[0] = count[0]
  push({
    phase:        "prefix",
    activePrefix: 0,
    message:      `prefix[0] = count[0] = ${prefix[0]}`,
    hint:         "The first value starts at position 0 and occupies prefix[0] slots.",
  })

  for (let k = 1; k <= maxVal; k++) {
    const prev = prefix[k - 1]
    prefix[k]  = count[k] + prev
    push({
      phase:        "prefix",
      activePrefix: k,
      message:      `prefix[${k}] = count[${k}] + prefix[${k - 1}] = ${count[k]} + ${prev} = ${prefix[k]}`,
      hint:         `prefix[${k}] = ${prefix[k]} means the last occurrence of value ${k} will go into output position ${prefix[k] - 1}.`,
    })
  }

  push({
    phase:   "prefix",
    message: `Prefix sums done! prefix[] = [${prefix.join(", ")}]`,
    hint:    "Each prefix[v] is now the exclusive upper bound for value v in the output — we'll count down from it.",
  })

  // ── Phase 3: PLACE ────────────────────────────────────────────────────────
  push({
    phase:   "place",
    message: "Phase 3 — PLACE: walk input right-to-left and slot each element into output",
    hint:    "Going right-to-left keeps the sort stable (equal elements keep their original relative order).",
  })

  for (let i = input.length - 1; i >= 0; i--) {
    const val    = input[i]
    const outPos = prefix[val] - 1

    push({
      phase:        "place",
      activeInput:  i,
      activeFrom:   val,
      activeOutput: outPos,
      message:      `Read input[${i}] = ${val} → prefix[${val}] = ${prefix[val]}, place at output[${outPos}]`,
      hint:         `prefix[${val}] tells us the next available slot for value ${val} is index ${outPos}. We decrement after placing.`,
    })

    output[outPos] = val
    prefix[val]--

    push({
      phase:        "place",
      activeInput:  i,
      activeFrom:   val,
      activeOutput: outPos,
      message:      `✓ output[${outPos}] = ${val}. Decrement prefix[${val}] to ${prefix[val]}`,
      hint:         "Decrementing ensures the next duplicate value goes one position to the left.",
    })
  }

  push({
    phase:   "done",
    message: "🎉 Sort complete — output = [" + output.join(", ") + "]",
    hint:    "Every value was placed directly into its correct position — zero comparisons made. That's what makes Counting Sort O(n + k).",
  })

  return steps
}

export const CS_SAMPLE6 = [4, 2, 7, 1, 4, 3]
export const CS_SAMPLE8 = [6, 2, 8, 3, 1, 6, 4, 3]
export const CS_SAMPLE_TIES = [3, 3, 1, 2, 1, 3]
