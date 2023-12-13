import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Row {
  record: string
  damaged: number[]
}

const parseRow = (line: string): Row => {
  const split = line.split(" ")
  return {
    record: split[0],
    damaged: split[1].split(",").map((val) => parseInt(val, 10)),
  }
}

const isStillPossible = (index: number, row: Row, currentGroup: number): boolean => {
  const remainingRequiredValues = row.damaged
    .slice(currentGroup)
    .reduce((previousValue, currentValue) => previousValue + currentValue + 1, -1)
  return row.record.length - index >= remainingRequiredValues
}

const canPlaceGroup = (row: Row, currentIndex: number, currentGroup: number): boolean => {
  if (currentGroup >= row.damaged.length) {
    return false
  }

  let placeable = true
  for (let i = currentIndex; i < currentIndex + row.damaged[currentGroup] && placeable; i++) {
    if (row.record.length - 1 < i || row.record[i] === ".") {
      placeable = false
    }
  }
  return (
    placeable &&
    (row.record.length === currentGroup + row.damaged[currentIndex] ||
      row.record[currentIndex + row.damaged[currentGroup]] !== "#")
  )
}

const getPossibleArrangements = (
  row: Row,
  cache: Map<string, number>,
  currentIndex: number,
  currentGroup: number
): number => {
  if (currentIndex > row.record.length - 1) {
    return currentGroup === row.damaged.length ? 1 : 0
  } else if (!cache.has(`${currentIndex};${currentGroup}`)) {
    let possibleArrangements = 0
    if (isStillPossible(currentIndex, row, currentGroup)) {
      if (canPlaceGroup(row, currentIndex, currentGroup)) {
        possibleArrangements += getPossibleArrangements(
          row,
          cache,
          currentIndex + row.damaged[currentGroup] + 1,
          currentGroup + 1
        )
      }
      if (row.record[currentIndex] !== "#") {
        possibleArrangements += getPossibleArrangements(row, cache, currentIndex + 1, currentGroup)
      }
    }
    cache.set(`${currentIndex};${currentGroup}`, possibleArrangements)
  }
  return cache.get(`${currentIndex};${currentGroup}`)
}

const enlargeRow = (row: Row): Row => ({
  record: [row.record, row.record, row.record, row.record, row.record].join("?"),
  damaged: [...row.damaged, ...row.damaged, ...row.damaged, ...row.damaged, ...row.damaged],
})

const goA = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map(parseRow)
    .map((row) => getPossibleArrangements(row, new Map<string, number>(), 0, 0))
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map(parseRow)
    .map(enlargeRow)
    .map((row) => getPossibleArrangements(row, new Map<string, number>(), 0, 0))
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

/* Tests */

test(goA(readTestFile()), 21)
test(goB(readTestFile()), 525152)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
