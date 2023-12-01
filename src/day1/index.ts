import { readInput, test } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const numberMap = new Map([
  ["one", "1"],
  ["two", "2"],
  ["three", "3"],
  ["four", "4"],
  ["five", "5"],
  ["six", "6"],
  ["seven", "7"],
  ["eight", "8"],
  ["nine", "9"],
])

const getPositionsForStrings = (
  line: string,
  searched: string[]
): { value: string; firstIndex: number; lastIndex: number }[] => {
  const result = []

  searched.forEach((value) => {
    const firstIndex = line.indexOf(value)
    const lastIndex = line.lastIndexOf(value)

    result.push({
      value,
      firstIndex,
      lastIndex,
    })
  })
  return result
}

const findCalibrationValue = (line: string, includeWrittenOutNumbers: boolean): number => {
  const numberPositions = getPositionsForStrings(line, Array.from(numberMap.values()))
  const writtenOutNumberPositions = getPositionsForStrings(line, Array.from(numberMap.keys()))

  const smallestWrittenOutNumber = writtenOutNumberPositions
    .filter((val) => val.firstIndex !== -1)
    .sort((a, b) => a.firstIndex - b.firstIndex)[0]
  const largestWrittenOutNumber = writtenOutNumberPositions
    .filter((val) => val.lastIndex !== -1)
    .sort((a, b) => b.lastIndex - a.lastIndex)[0]
  const smallestNumber = numberPositions
    .filter((val) => val.firstIndex !== -1)
    .sort((a, b) => a.firstIndex - b.firstIndex)[0]
  const largestNumber = numberPositions
    .filter((val) => val.lastIndex !== -1)
    .sort((a, b) => b.lastIndex - a.lastIndex)[0]

  let calibrationValue = ""

  if (
    !includeWrittenOutNumbers ||
    smallestWrittenOutNumber === undefined ||
    (smallestNumber !== undefined &&
      smallestNumber.firstIndex < smallestWrittenOutNumber.firstIndex)
  ) {
    calibrationValue = smallestNumber.value
  } else {
    calibrationValue = numberMap.get(smallestWrittenOutNumber.value)
  }

  if (
    !includeWrittenOutNumbers ||
    largestWrittenOutNumber === undefined ||
    (largestNumber !== undefined && largestNumber.lastIndex > largestWrittenOutNumber.lastIndex)
  ) {
    calibrationValue += largestNumber.value
  } else {
    calibrationValue += numberMap.get(largestWrittenOutNumber.value)
  }

  return parseInt(calibrationValue, 10)
}

const goA = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map((line) => findCalibrationValue(line, false))
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map((line) => findCalibrationValue(line, true))
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

/* Tests */

test(goA(readTestFile()), 142)
test(goB(readInputFromSpecialFile("testInput2.txt")), 281)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
