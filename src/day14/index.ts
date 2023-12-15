import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number
  y: number
}

enum Direction {
  N,
  S,
  W,
  E,
}

type ResultCache = Map<string, { stones: Position[]; index: number }>

const rollNorth = (
  stopper: Position[],
  stones: Position[],
  cache: ResultCache,
  currentColumn: number
): Position[] => {
  const sorted = stones.sort((a, b) => a.y - b.y)
  const sortedStopper = stopper.sort((a, b) => a.y - b.y)

  const cacheString = `N;${currentColumn};${sorted.map((stone) => stone.y).join(",")}`

  if (cache.has(cacheString)) {
    return cache.get(cacheString).stones
  }

  const newStones = []

  let maxTop = 0
  let currentStopper = 0
  sorted.forEach((stone) => {
    while (sortedStopper.length > currentStopper && sortedStopper[currentStopper].y < stone.y) {
      maxTop = sortedStopper[currentStopper].y + 1
      currentStopper++
    }
    newStones.push({
      x: stone.x,
      y: maxTop,
    })
    maxTop++
  })

  cache.set(cacheString, { stones: newStones, index: 0 })

  return newStones
}

const rollSouth = (
  stopper: Position[],
  stones: Position[],
  columnHeight: number,
  cache: ResultCache,
  currentColumn: number
): Position[] => {
  const sorted = stones.sort((a, b) => b.y - a.y)
  const sortedStopper = stopper.sort((a, b) => b.y - a.y)

  const cacheString = `S;${currentColumn};${sorted.map((stone) => stone.y).join(",")}`

  if (cache.has(cacheString)) {
    return cache.get(cacheString).stones
  }

  const newStones = []

  let maxTop = columnHeight - 1
  let currentStopper = 0
  sorted.forEach((stone) => {
    while (sortedStopper.length > currentStopper && sortedStopper[currentStopper].y > stone.y) {
      maxTop = sortedStopper[currentStopper].y - 1
      currentStopper++
    }
    newStones.push({
      x: stone.x,
      y: maxTop,
    })
    maxTop--
  })

  cache.set(cacheString, { stones: newStones, index: 0 })

  return newStones
}

const rollWest = (
  stopper: Position[],
  stones: Position[],
  cache: ResultCache,
  currentRow: number
): Position[] => {
  const sorted = stones.sort((a, b) => a.x - b.x)
  const sortedStopper = stopper.sort((a, b) => a.x - b.x)

  const cacheString = `W;${currentRow};${sorted.map((stone) => stone.x).join(",")}`

  if (cache.has(cacheString)) {
    return cache.get(cacheString).stones
  }

  const newStones = []

  let maxLeft = 0
  let currentStopper = 0
  sorted.forEach((stone) => {
    while (sortedStopper.length > currentStopper && sortedStopper[currentStopper].x < stone.x) {
      maxLeft = sortedStopper[currentStopper].x + 1
      currentStopper++
    }
    newStones.push({
      x: maxLeft,
      y: stone.y,
    })
    maxLeft++
  })

  cache.set(cacheString, { stones: newStones, index: 0 })

  return newStones
}

const rollEast = (
  stopper: Position[],
  stones: Position[],
  columWidth: number,
  cache: ResultCache,
  currentRow: number
): Position[] => {
  const sorted = stones.sort((a, b) => b.x - a.x)
  const sortedStopper = stopper.sort((a, b) => b.x - a.x)

  const cacheString = `E;${currentRow};${sorted.map((stone) => stone.x).join(",")}`

  if (cache.has(cacheString)) {
    return cache.get(cacheString).stones
  }

  const newStones = []

  let maxRight = columWidth - 1
  let currentStopper = 0
  sorted.forEach((stone) => {
    while (sortedStopper.length > currentStopper && sortedStopper[currentStopper].x > stone.x) {
      maxRight = sortedStopper[currentStopper].x - 1
      currentStopper++
    }
    newStones.push({
      x: maxRight,
      y: stone.y,
    })
    maxRight--
  })

  cache.set(cacheString, { stones: newStones, index: 0 })

  return newStones
}

const parseStopperPositions = (lines: string[]): Position[] => {
  const stopper: Position[] = []
  lines.forEach((line, yIndex) => {
    line.split("").forEach((character, index) => {
      if (character === "#") {
        stopper.push({
          x: index,
          y: yIndex,
        })
      }
    })
  })
  return stopper
}

const parseStonePositions = (lines: string[]): Position[] => {
  const stones: Position[] = []
  lines.forEach((line, yIndex) => {
    line.split("").forEach((character, index) => {
      if (character === "O") {
        stones.push({
          x: index,
          y: yIndex,
        })
      }
    })
  })
  return stones
}

const fullRoll = (
  stopper: Position[],
  stones: Position[],
  direction: Direction,
  columnHeight: number,
  rowWidth: number,
  cache: ResultCache
): Position[] => {
  const newStones = []

  const cacheString = `F;${direction};${stones
    .map((stone) => `${stone.x}.${stone.y}`)
    .sort((a, b) => a.localeCompare(b))
    .join(",")}`

  if (cache.has(cacheString)) {
    return cache.get(cacheString).stones
  }

  if (direction === Direction.N || direction === Direction.S) {
    for (let x = 0; x < rowWidth; x++) {
      const relevantStopper = stopper.filter((stop) => stop.x === x)
      const relevantStones = stones.filter((stone) => stone.x === x)
      if (direction === Direction.N) {
        newStones.push(...rollNorth(relevantStopper, relevantStones, cache, x))
      } else {
        newStones.push(...rollSouth(relevantStopper, relevantStones, columnHeight, cache, x))
      }
    }
  } else {
    for (let y = 0; y < columnHeight; y++) {
      const relevantStopper = stopper.filter((stop) => stop.y === y)
      const relevantStones = stones.filter((stone) => stone.y === y)
      if (direction === Direction.E) {
        newStones.push(...rollEast(relevantStopper, relevantStones, rowWidth, cache, y))
      } else {
        newStones.push(...rollWest(relevantStopper, relevantStones, cache, y))
      }
    }
  }

  cache.set(cacheString, { stones: newStones, index: 0 })

  return newStones
}

const fullCycle = (
  stopper: Position[],
  stones: Position[],
  columnHeight: number,
  rowWidth: number,
  cache: ResultCache,
  index: number
): {
  stones: Position[]
  loopRange: number
} => {
  const cacheString = `C;${stones
    .map((stone) => `${stone.x}.${stone.y}`)
    .sort((a, b) => a.localeCompare(b))
    .join(",")}`

  if (cache.has(cacheString)) {
    return {
      stones: cache.get(cacheString).stones,
      loopRange: index - cache.get(cacheString).index,
    }
  }

  const stonesAfterNorth = fullRoll(stopper, stones, Direction.N, columnHeight, rowWidth, cache)
  const stonesAfterWest = fullRoll(
    stopper,
    stonesAfterNorth,
    Direction.W,
    columnHeight,
    rowWidth,
    cache
  )
  const stonesAfterSouth = fullRoll(
    stopper,
    stonesAfterWest,
    Direction.S,
    columnHeight,
    rowWidth,
    cache
  )
  const stonesAfterEast = fullRoll(
    stopper,
    stonesAfterSouth,
    Direction.E,
    columnHeight,
    rowWidth,
    cache
  )

  cache.set(cacheString, { stones: stonesAfterEast, index })
  return { stones: stonesAfterEast, loopRange: -1 }
}

const calculateLoad = (stones: Position[], columnHeight: number): number =>
  stones
    .map((stone) => columnHeight - stone.y)
    .reduce((previousValue, currentValue) => previousValue + currentValue)

const goA = (input: string) => {
  const lines = splitToLines(input)

  let load = 0
  for (let x = 0; x < lines[0].length; x++) {
    let loadPerColumn = 0
    let maxTop = 0
    for (let y = 0; y < lines.length; y++) {
      if (lines[y][x] === "#") {
        maxTop = y + 1
      } else if (lines[y][x] === "O") {
        loadPerColumn += lines.length - maxTop
        maxTop++
      }
    }
    load += loadPerColumn
  }

  return load
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const stopper = parseStopperPositions(lines)
  let currentStones = parseStonePositions(lines)

  const cache: ResultCache = new Map()
  for (let i = 0; i < 1000000000; i++) {
    const result = fullCycle(stopper, currentStones, lines.length, lines[0].length, cache, i)
    currentStones = result.stones

    if (result.loopRange !== -1) {
      const cyclesThatCanBeSkipped = Math.floor((1000000000 - i) / result.loopRange)
      i += cyclesThatCanBeSkipped * result.loopRange
    }
  }

  return calculateLoad(currentStones, lines.length)
}

/* Tests */

test(goA(readTestFile()), 136)
test(goB(readTestFile()), 64)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
