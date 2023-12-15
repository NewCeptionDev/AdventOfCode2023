import { readInput, test } from "../utils/index"
import { readTestFile, splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const isHorizontalReflection = (
  pattern: string[],
  startIndex: number,
  fixSmudges: boolean
): boolean => {
  let isReflective = true
  let atLeastOneCheck = false
  let fixedSmudge = false

  for (
    let i = startIndex;
    i >= 0 && startIndex + (startIndex - i) + 1 < pattern.length && isReflective;
    i--
  ) {
    const equalCharacters = pattern[i]
      .split("")
      .map(
        (character, index) => character === pattern[startIndex + (startIndex - i) + 1].charAt(index)
      )
    if (fixSmudges && equalCharacters.filter((elem) => !elem).length === 1 && !fixedSmudge) {
      fixedSmudge = true
    } else if (equalCharacters.filter((elem) => !elem).length > 0) {
      isReflective = false
    }
    atLeastOneCheck = true
  }

  return isReflective && atLeastOneCheck && (!fixSmudges || fixedSmudge)
}

const findHorizontalReflection = (pattern: string[], fixSmudges: boolean): number => {
  for (let i = 0; i < pattern.length; i++) {
    if (isHorizontalReflection(pattern, i, fixSmudges)) {
      return i + 1
    }
  }

  return -1
}

const getColumn = (pattern: string[], columnIndex: number): string[] => {
  const column = []
  for (let y = 0; y < pattern.length; y++) {
    column.push(pattern[y].charAt(columnIndex))
  }

  return column
}

const isVerticalReflection = (
  pattern: string[],
  startIndex: number,
  fixSmudges: boolean
): boolean => {
  let isReflective = true
  let fixedSmudge = false

  for (
    let i = startIndex;
    i >= 0 && startIndex + (startIndex - i) + 1 < pattern[0].length && isReflective;
    i--
  ) {
    const firstColumn = getColumn(pattern, i)
    const secondColumn = getColumn(pattern, startIndex + (startIndex - i) + 1)
    const equalsElements = firstColumn.map((elem, index) => secondColumn[index] === elem)
    if (fixSmudges && equalsElements.filter((elem) => !elem).length === 1 && !fixedSmudge) {
      fixedSmudge = true
    } else if (equalsElements.filter((elem) => !elem).length > 0) {
      isReflective = false
    }
  }

  return isReflective && (!fixSmudges || fixedSmudge)
}

const findVerticalReflection = (pattern: string[], fixSmudges: boolean): number => {
  for (let i = 0; i < pattern[0].length; i++) {
    if (isVerticalReflection(pattern, i, fixSmudges)) {
      return i + 1
    }
  }

  return -1
}

const findReflectionPoint = (pattern: string[], fixSmudges: boolean): number => {
  const horizontalReflection = findHorizontalReflection(pattern, fixSmudges)

  if (horizontalReflection !== -1) {
    return horizontalReflection * 100
  }
  return findVerticalReflection(pattern, fixSmudges)
}

const goA = (input: string) => {
  const lines = splitToAllLines(input)

  let beforeReflection = 0

  let startPoint = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length === 0) {
      beforeReflection += findReflectionPoint(lines.slice(startPoint, i), false)
      startPoint = i + 1
    }
  }
  beforeReflection += findReflectionPoint(lines.slice(startPoint, lines.length), false)

  return beforeReflection
}

const goB = (input: string) => {
  const lines = splitToAllLines(input)

  let beforeReflection = 0

  let startPoint = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length === 0) {
      beforeReflection += findReflectionPoint(lines.slice(startPoint, i), true)
      startPoint = i + 1
    }
  }
  beforeReflection += findReflectionPoint(lines.slice(startPoint, lines.length), true)

  return beforeReflection
}

/* Tests */

test(goA(readTestFile()), 405)
test(goB(readTestFile()), 400)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
