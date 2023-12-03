import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const isNumber = (character: string): boolean => character.match(/\d/) !== null

const isSymbol = (character: string): boolean => character.match(/[^\\.\w]/) !== null

const getPartNumberIfNextToSymbol = (
  map: string[],
  lineIndex: number,
  numberStartPosition: number
): number => {
  let currentPosition = numberStartPosition
  let partNumber = ""
  let hasSymbolNextToIt = false

  // Check before number start
  hasSymbolNextToIt =
    hasSymbolNextToIt ||
    (lineIndex !== 0 &&
      currentPosition !== 0 &&
      isSymbol(map[lineIndex - 1].charAt(currentPosition - 1)))
  hasSymbolNextToIt =
    hasSymbolNextToIt ||
    (currentPosition !== 0 && isSymbol(map[lineIndex].charAt(currentPosition - 1)))
  hasSymbolNextToIt =
    hasSymbolNextToIt ||
    (lineIndex + 1 < map.length && isSymbol(map[lineIndex + 1].charAt(currentPosition - 1)))

  // Check above and below number
  while (
    map[lineIndex].length > currentPosition &&
    isNumber(map[lineIndex].charAt(currentPosition))
  ) {
    partNumber += map[lineIndex].charAt(currentPosition)

    hasSymbolNextToIt =
      hasSymbolNextToIt || (lineIndex !== 0 && isSymbol(map[lineIndex - 1].charAt(currentPosition)))
    hasSymbolNextToIt =
      hasSymbolNextToIt ||
      (lineIndex + 1 < map.length && isSymbol(map[lineIndex + 1].charAt(currentPosition)))

    currentPosition++
  }

  if (currentPosition < map[lineIndex].length) {
    hasSymbolNextToIt =
      hasSymbolNextToIt || (lineIndex !== 0 && isSymbol(map[lineIndex - 1].charAt(currentPosition)))
    hasSymbolNextToIt = hasSymbolNextToIt || isSymbol(map[lineIndex].charAt(currentPosition))
    hasSymbolNextToIt =
      hasSymbolNextToIt ||
      (lineIndex + 1 < map.length && isSymbol(map[lineIndex + 1].charAt(currentPosition)))
  }

  if (hasSymbolNextToIt) {
    return parseInt(partNumber, 10)
  }

  return 0
}

const resolveNumberFromPosition = (line: string, startPosition: number): number => {
  let currentPosition = startPosition
  let numberString = line.charAt(currentPosition)

  while (currentPosition > 0 && isNumber(line.charAt(currentPosition - 1))) {
    numberString = line.charAt(currentPosition - 1) + numberString
    currentPosition--
  }

  currentPosition = startPosition

  while (currentPosition + 1 < line.length && isNumber(line.charAt(currentPosition + 1))) {
    numberString += line.charAt(currentPosition + 1)
    currentPosition++
  }

  return parseInt(numberString, 10)
}

const getPartNumbersAdjacentToSymbol = (
  map: string[],
  lineIndex: number,
  symbolPosition: number
): number[] => {
  const partNumbers = []
  let foundDiagonalLeft = false
  let foundMiddle = false

  // Number diagonal left above
  if (
    lineIndex !== 0 &&
    symbolPosition !== 0 &&
    isNumber(map[lineIndex - 1].charAt(symbolPosition - 1))
  ) {
    partNumbers.push(resolveNumberFromPosition(map[lineIndex - 1], symbolPosition - 1))
    foundDiagonalLeft = true
  }

  // Number directly above
  if (lineIndex !== 0 && isNumber(map[lineIndex - 1].charAt(symbolPosition))) {
    if (!foundDiagonalLeft) {
      partNumbers.push(resolveNumberFromPosition(map[lineIndex - 1], symbolPosition))
    }
    foundMiddle = true
  }

  // Number diagonal right above
  if (lineIndex !== 0 && isNumber(map[lineIndex - 1].charAt(symbolPosition + 1))) {
    if (!foundMiddle) {
      partNumbers.push(resolveNumberFromPosition(map[lineIndex - 1], symbolPosition + 1))
    }
  }

  // Number left
  if (symbolPosition !== 0 && isNumber(map[lineIndex].charAt(symbolPosition - 1))) {
    partNumbers.push(resolveNumberFromPosition(map[lineIndex], symbolPosition - 1))
  }

  // Number right
  if (symbolPosition !== 0 && isNumber(map[lineIndex].charAt(symbolPosition + 1))) {
    partNumbers.push(resolveNumberFromPosition(map[lineIndex], symbolPosition + 1))
  }

  // Reset for below line check
  foundDiagonalLeft = false
  foundMiddle = false

  // Number diagonal left below
  if (
    lineIndex + 1 < map.length &&
    symbolPosition !== 0 &&
    isNumber(map[lineIndex + 1].charAt(symbolPosition - 1))
  ) {
    partNumbers.push(resolveNumberFromPosition(map[lineIndex + 1], symbolPosition - 1))
    foundDiagonalLeft = true
  }

  // Number directly below
  if (lineIndex + 1 < map.length && isNumber(map[lineIndex + 1].charAt(symbolPosition))) {
    if (!foundDiagonalLeft) {
      partNumbers.push(resolveNumberFromPosition(map[lineIndex + 1], symbolPosition))
    }
    foundMiddle = true
  }

  // Number diagonal right below
  if (lineIndex + 1 < map.length && isNumber(map[lineIndex + 1].charAt(symbolPosition + 1))) {
    if (!foundMiddle) {
      partNumbers.push(resolveNumberFromPosition(map[lineIndex + 1], symbolPosition + 1))
    }
  }

  if (partNumbers.length === 2) {
    return partNumbers
  }

  return []
}

const getGearRatiosForGearsOnLine = (map: string[], lineIndex: number): number[] => {
  const gearRatios = []

  for (let i = 0; i < map[lineIndex].length; i++) {
    if (map[lineIndex].charAt(i) === "*") {
      const partNumbers = getPartNumbersAdjacentToSymbol(map, lineIndex, i)
      if (partNumbers.length === 2) {
        gearRatios.push(partNumbers[0] * partNumbers[1])
      }
    }
  }

  return gearRatios
}

const getPartNumbersForLine = (map: string[], lineIndex: number): number[] => {
  const partNumbers = []
  let allReadyCheckedNumber = false

  for (let i = 0; i < map[lineIndex].length; i++) {
    if (isNumber(map[lineIndex].charAt(i)) && !allReadyCheckedNumber) {
      partNumbers.push(getPartNumberIfNextToSymbol(map, lineIndex, i))
      allReadyCheckedNumber = true
    }

    if (!isNumber(map[lineIndex].charAt(i))) {
      allReadyCheckedNumber = false
    }
  }

  return partNumbers.filter((value) => value !== 0)
}

const findPartNumbers = (map: string[]): number[] => {
  const partNumbers = []

  map.forEach((_, index) => {
    getPartNumbersForLine(map, index).forEach((resultPart) => partNumbers.push(resultPart))
  })

  return partNumbers
}

const findGearRatios = (map: string[]): number[] => {
  const gearRatios = []

  map.forEach((_, index) => {
    getGearRatiosForGearsOnLine(map, index).forEach((resultPart) => gearRatios.push(resultPart))
  })

  return gearRatios
}

const goA = (input: string) => {
  const lines = splitToLines(input)

  return findPartNumbers(lines).reduce(
    (previousValue, currentValue) => previousValue + currentValue
  )
}

const goB = (input: string) => {
  const lines = splitToLines(input)

  return findGearRatios(lines).reduce((previousValue, currentValue) => previousValue + currentValue)
}

/* Tests */

test(isNumber("1"), true)
test(isNumber("A"), false)
test(isSymbol("@"), true)
test(isSymbol("&"), true)
test(isSymbol("*"), true)
test(isSymbol("A"), false)
test(isSymbol("."), false)
test(isSymbol("1"), false)
test(goA(readTestFile()), 4361)
test(goB(readTestFile()), 467835)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
