export const SORT_INPUT_LIMITS = {
  minCount: 2,
  maxCount: 12,
  minValue: 1,
  maxValue: 100,
}

export const formatValues = (items) => items.join(", ")

export const makeRandomValues = ({
  length = 8,
  minValue = 12,
  maxValue = 76,
} = {}) =>
  Array.from(
    { length },
    () => Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue,
  )

export const parseManualValues = (input, limits = {}) => {
  const {
    minCount,
    maxCount,
    minValue,
    maxValue,
  } = { ...SORT_INPUT_LIMITS, ...limits }

  const values = input
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (values.length < minCount || values.length > maxCount) {
    return {
      error: `Enter ${minCount}-${maxCount} numbers.`,
      values: [],
    }
  }

  const parsed = values.map(Number)
  const hasInvalidValue = parsed.some(
    (value) =>
      !Number.isInteger(value) ||
      value < minValue ||
      value > maxValue,
  )

  if (hasInvalidValue) {
    return {
      error: `Use whole numbers from ${minValue} to ${maxValue}.`,
      values: [],
    }
  }

  return { error: "", values: parsed }
}
