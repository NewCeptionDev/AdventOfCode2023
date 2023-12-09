import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseHistory = (line: string): number[] => line.split(" ").map((val) => parseInt(val, 10))

const identifySequenceOfDifference = (list: number[]): number[] => {
  const differences = []
  for (let i = 1; i < list.length; i++) {
    differences.push(list[i] - list[i - 1])
  }

  if (list.length === 1) {
    return [0]
  }

  return differences
}

const extrapolateNextValue = (history: number[], forwards: boolean): number => {
  const listOfSequences = [history]
  let currentSequence = history

  while (currentSequence.some((val) => val !== 0)) {
    const differenceSequence = identifySequenceOfDifference(currentSequence)
    listOfSequences.push(differenceSequence)
    currentSequence = differenceSequence
  }

  let newlyGeneratedValue = 0

  while (listOfSequences.length > 0) {
    if (forwards) {
      const lastSequence = listOfSequences.pop()
      newlyGeneratedValue = lastSequence.pop() + newlyGeneratedValue
    } else {
      const lastSequence = listOfSequences.pop()
      newlyGeneratedValue = lastSequence[0] - newlyGeneratedValue
    }
  }

  return newlyGeneratedValue
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  return lines
    .map(parseHistory)
    .map((history) => extrapolateNextValue(history, true))
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  return lines
    .map(parseHistory)
    .map((history) => extrapolateNextValue(history, false))
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

/* Tests */

test(goA(readTestFile()), 114)
test(goB(readTestFile()), 2)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
