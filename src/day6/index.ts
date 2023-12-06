import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Race {
  duration: number
  distance: number
}

const splitLine = (line: string): number[] => {
  const headerSplit = line.split(": ")
  return headerSplit[1]
    .split(" ")
    .filter((val) => val.length > 0)
    .map((val) => parseInt(val, 10))
}

const parseRaces = (lines: string[]): Race[] => {
  const durationParts = splitLine(lines[0])
  const distanceParts = splitLine(lines[1])

  if (durationParts.length !== distanceParts.length) {
    throw new Error("duration and distance parts not equal")
  }

  return durationParts.map((val, index) => ({
      duration: val,
      distance: distanceParts[index],
    }))
}

const parseRaceForPartTwo = (lines: string[]): Race => {
  const duration = parseInt(
    splitLine(lines[0])
      .map((val) => `${val  }`)
      .join(""),
    10
  )
  const distance = parseInt(
    splitLine(lines[1])
      .map((val) => `${val  }`)
      .join(""),
    10
  )

  return {
    duration,
    distance,
  }
}

const calculateWaysToBeatRecord = (race: Race): number => {
  const distanceRequired = race.distance + 1
  let waysToWin = 0

  for (let i = 1; i < race.duration; i++) {
    const travelDistance = (race.duration - i) * i

    if (travelDistance >= distanceRequired) {
      waysToWin++
    }
  }

  return waysToWin
}

const findFirstWayToBeatRecord = (race: Race): number => {
  const distanceRequired = race.distance + 1

  for (let i = 1; i < race.duration; i++) {
    const travelDistance = (race.duration - i) * i

    if (travelDistance >= distanceRequired) {
      return i
    }
  }

  throw new Error("no way found to beat record")
}

const findLastWayToBeatRecord = (race: Race): number => {
  const distanceRequired = race.distance + 1

  for (let i = race.duration; i >= 0; i--) {
    const travelDistance = (race.duration - i) * i

    if (travelDistance >= distanceRequired) {
      return i
    }
  }

  throw new Error("no way found to beat record")
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const races = parseRaces(lines)

  return races
    .map(calculateWaysToBeatRecord)
    .reduce((previousValue, currentValue) => previousValue * currentValue, 1)
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const race = parseRaceForPartTwo(lines)

  const firstWayToWin = findFirstWayToBeatRecord(race)
  const lastWayToWin = findLastWayToBeatRecord(race)

  return lastWayToWin - firstWayToWin + 1
}

/* Tests */

test(goA(readTestFile()), 288)
test(goB(readTestFile()), 71503)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
