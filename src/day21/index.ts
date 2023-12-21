import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number,
  y: number,
  layer: number
}

const adjustPosition = (map: string[], position: Position): Position => {
  if(position.y === -1) {
    return {
      x: position.x,
      y: map.length - 1,
      layer: position.layer - 1
    }
  } else if(position.y === map.length) {
    return {
      x: position.x,
      y: 0,
      layer: position.layer + 1
    }
  } else if(position.x === -1) {
    return {
      x: map[position.y].length - 1,
      y: position.y,
      layer: position.layer - 0.5
    }
  } else if(position.x === map[position.y].length) {
    return {
      x: 0,
      y: position.y,
      layer: position.layer + 0.5
    }
  }
  return position
}

const getNextPossiblePositions = (map: string[], position: Position, adjustPositions: boolean): Position[] => {
  const possiblePositions = [
    {
      x: position.x + 1,
      y: position.y,
      layer: position.layer
    },
    {
      x: position.x - 1,
      y: position.y,
      layer: position.layer
    },
    {
      x: position.x,
      y: position.y + 1,
      layer: position.layer
    },
    {
      x: position.x,
      y: position.y - 1,
      layer: position.layer
    }
  ]

  if(adjustPositions) {
    return possiblePositions.map(pos => adjustPosition(map, pos)).filter(pos => map[pos.y].charAt(pos.x) !== "#")
  }

  return possiblePositions.filter(pos => pos.y >= 0 && pos.y < map.length && pos.x >= 0 && pos.x < map[pos.y].length && map[pos.y].charAt(pos.x) !== "#")
}

const calculatePossiblePositions = (map: string[], currentPosition: Position, stepsLeft: number, cache: Map<string, Map<string, boolean>>, adjustPositions: boolean): Map<string, boolean> => {
  if(stepsLeft === 0) {
    return new Map<string, boolean>([[currentPosition.x + "," + currentPosition.y + "," + currentPosition.layer, true]]);
  }

  const cacheString = currentPosition.x + "," + currentPosition.y + ";" + currentPosition.layer + ";" + stepsLeft

  if(cache.has(cacheString)) {
    return cache.get(cacheString)
  }

  const nextPositions = getNextPossiblePositions(map, currentPosition, adjustPositions)
  const reachablePositions: Map<string, boolean> = new Map<string, boolean>()
  nextPositions.map(pos => calculatePossiblePositions(map, pos, stepsLeft - 1, cache, adjustPositions)).forEach(possibleWay => {
    Array.from(possibleWay.keys()).forEach(reachedPos => {
      if (!reachablePositions.has(reachedPos)) {
        reachablePositions.set(reachedPos, true)
      }
    })
  })

  cache.set(cacheString, reachablePositions)

  return reachablePositions
}

const goA = (input: string, stepsLeft: number) => {
  const lines = splitToLines(input)

  const startPosition = {
    x: lines[lines.findIndex((line: string) => line.includes("S"))].indexOf("S"),
    y: lines.findIndex((line: string) => line.includes("S")),
    layer: 0
  }

  return Array.from(calculatePossiblePositions(lines, startPosition, stepsLeft, new Map<string, Map<string, boolean>>(), false).keys()).length
}

const goB = (input: string, stepsLeft: number) => {
  const lines = splitToLines(input)

  const startPosition = {
    x: lines[lines.findIndex((line: string) => line.includes("S"))].indexOf("S"),
    y: lines.findIndex((line: string) => line.includes("S")),
    layer: 0
  }

  return Array.from(calculatePossiblePositions(lines, startPosition, stepsLeft, new Map<string, Map<string, boolean>>(), true).keys()).length
}

/* Tests */

test(goA(readTestFile(), 6), 16)
test(goB(readTestFile(), 6), 16)
test(goB(readTestFile(), 10), 50)
test(goB(readTestFile(), 50), 1594)
test(goB(readTestFile(), 100), 6536)
test(goB(readTestFile(), 500), 167004)

/* Results */

console.time("Time") // eslint-disable-line no-console
// const resultA = goA(taskInput, 64)
// const resultB = goB(taskInput, 64)
console.timeEnd("Time") // eslint-disable-line no-console

// console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
// console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
