export const MIN_FACTORIAL_N = 1
export const MAX_FACTORIAL_N = 1000
export const DEFAULT_FACTORIAL_N = 5

const clampNumber = (value, min, max) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) return min

  return Math.min(Math.max(Math.trunc(numericValue), min), max)
}

const buildFactorialLookup = (n) => {
  const values = ["1", "1"]
  let result = 1n

  for (let i = 2; i <= n; i += 1) {
    result *= BigInt(i)
    values[i] = formatFactorialValue(result)
  }

  return values
}

const formatFactorialValue = (value) => {
  const result = value.toString()

  if (result.length <= 24) return result

  return `${result.slice(0, 12)}...${result.slice(-6)} (${result.length} digits)`
}

const createFrame = (value, status = "waiting", result = null) => ({
  id: `factorial-${value}`,
  value,
  status,
  result,
})

export function normalizeFactorialInput(value) {
  return clampNumber(value, MIN_FACTORIAL_N, MAX_FACTORIAL_N)
}

export function buildFactorialSteps(inputValue) {
  const n = normalizeFactorialInput(inputValue)
  const factorialValues = buildFactorialLookup(n)
  const steps = []

  for (let current = n; current >= MIN_FACTORIAL_N; current -= 1) {
    const stack = []

    for (let value = n; value >= current; value -= 1) {
      stack.push(
        createFrame(
          value,
          value === current ? "active" : "waiting",
        ),
      )
    }

    steps.push({
      phase: "call",
      codeLine: current === MIN_FACTORIAL_N ? "base" : "recursive",
      stack,
      expression:
        current === MIN_FACTORIAL_N
          ? "factorial(1) returns 1"
          : `factorial(${current}) waits for ${current} * factorial(${current - 1})`,
      result: null,
      message:
        current === MIN_FACTORIAL_N
          ? "The recursion has reached the base case."
          : `Push factorial(${current}) onto the call stack and call factorial(${current - 1}).`,
    })
  }

  steps.push({
    phase: "base",
    codeLine: "base",
    stack: Array.from({ length: n }, (_, index) => {
      const value = n - index
      return createFrame(value, value === MIN_FACTORIAL_N ? "active" : "waiting", value === MIN_FACTORIAL_N ? "1" : null)
    }),
    expression: "factorial(1) = 1",
    result: "1",
    message: "The base case gives the first known value, so the stack can start unwinding.",
  })

  for (let current = MIN_FACTORIAL_N + 1; current <= n; current += 1) {
    const currentResult = factorialValues[current]
    const previousResult = factorialValues[current - 1]

    steps.push({
      phase: "return",
      codeLine: "recursive",
      stack: Array.from({ length: n - current + 1 }, (_, index) => {
        const value = n - index

        return createFrame(
          value,
          value === current ? "active" : "waiting",
          value === current ? currentResult : null,
        )
      }),
      expression: `${current} * ${previousResult} = ${currentResult}`,
      result: currentResult,
      message: `Resolve factorial(${current}) using the value returned by factorial(${current - 1}).`,
    })
  }

  steps.push({
    phase: "done",
    codeLine: "done",
    stack: [],
    expression: `${n}! = ${factorialValues[n]}`,
    result: factorialValues[n],
    message: "Every recursive call has returned, leaving the final factorial value.",
  })

  return steps
}
