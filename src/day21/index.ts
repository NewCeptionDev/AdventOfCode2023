import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number
  y: number
  stepsLeft: number
}
const getNextPossiblePositions = (map: string[], position: Position): Position[] => {
  const possiblePositions = [
    {
      x: position.x + 1,
      y: position.y,
      stepsLeft: position.stepsLeft - 1,
    },
    {
      x: position.x - 1,
      y: position.y,
      stepsLeft: position.stepsLeft - 1,
    },
    {
      x: position.x,
      y: position.y + 1,
      stepsLeft: position.stepsLeft - 1,
    },
    {
      x: position.x,
      y: position.y - 1,
      stepsLeft: position.stepsLeft - 1,
    },
  ]

  return possiblePositions.filter(
    (pos) =>
      pos.y >= 0 &&
      pos.y < map.length &&
      pos.x >= 0 &&
      pos.x < map[pos.y].length &&
      map[pos.y].charAt(pos.x) !== "#"
  )
}

const calculatePossiblePositions = (map: string[], startPosition: Position): Position[] => {
  const nextPossiblePositions = [startPosition]
  const reachable: Position[] = []
  const visited: Position[] = []

  while (nextPossiblePositions.length > 0) {
    const nextPosition = nextPossiblePositions.shift()

    if (nextPosition.stepsLeft % 2 === 0) {
      reachable.push(nextPosition)
    }

    visited.push(nextPosition)
    if (nextPosition.stepsLeft > 0) {
      const next = getNextPossiblePositions(map, nextPosition).filter(
        (possible) =>
          visited.every(
            (visitedPosition) =>
              visitedPosition.y !== possible.y || visitedPosition.x !== possible.x
          ) &&
          nextPossiblePositions.every(
            (nextPossiblePosition) =>
              nextPossiblePosition.x !== possible.x || nextPossiblePosition.y !== possible.y
          )
      )
      nextPossiblePositions.push(...next)
    }
  }

  return reachable
}

const getPosition = (x: number, y: number, stepsLeft: number): Position => ({
  x,
  y,
  stepsLeft,
})

const goA = (input: string, stepsLeft: number) => {
  const lines = splitToLines(input)

  const startPosition: Position = {
    x: lines[lines.findIndex((line: string) => line.includes("S"))].indexOf("S"),
    y: lines.findIndex((line: string) => line.includes("S")),
    stepsLeft,
  }

  return calculatePossiblePositions(lines, startPosition).length
}

/**
 * Alignment of the repeating gardens:
 *
 * O = Odd garden
 * E = Even garden
 * S = Small side garden
 * L = Large side garden
 * C = Center garden (Starting point)
 * North = North garden ( northPlots )
 * East = East garden ( eastPlots )
 * South = South garden ( southPlots )
 * West = West garden ( westPlots )
 *
 *                 North
 *                 S | S
 *               L - E - L
 *             S |   |   | S
 *           L - E - O - E - L
 *         S |   |   |   |   | S
 *    West - E - O - C - O - E - East
 *         S |   |   |   |   | S
 *           L - E - O - E - L
 *             S |   |   | S
 *               L - E - L
 *                 S | S
 *                 South
 */
const goB = (input: string, stepsLeft: number) => {
  const lines = splitToLines(input)

  const startX = lines[lines.findIndex((line: string) => line.includes("S"))].indexOf("S")
  const startY = lines.findIndex((line: string) => line.includes("S"))

  const gridSize = lines.length
  const gridWidth = Math.floor(stepsLeft / gridSize) - 1
  const oddGrids = Math.pow(Math.floor(gridWidth / 2) * 2 + 1, 2)
  const evenGrids = Math.pow(Math.floor((gridWidth + 1) / 2) * 2, 2)

  const oddPoints = calculatePossiblePositions(lines, getPosition(startX, startY, gridSize * 2 + 1))
  const evenPoints = calculatePossiblePositions(lines, getPosition(startX, startY, gridSize * 2))

  const eastPoints = calculatePossiblePositions(lines, getPosition(0, startY, gridSize - 1))
  const westPoints = calculatePossiblePositions(
    lines,
    getPosition(gridSize - 1, startY, gridSize - 1)
  )
  const northPoints = calculatePossiblePositions(
    lines,
    getPosition(startX, gridSize - 1, gridSize - 1)
  )
  const southPoints = calculatePossiblePositions(lines, getPosition(startX, 0, gridSize - 1))

  const smallNorthEastPoints = calculatePossiblePositions(
    lines,
    getPosition(0, gridSize - 1, Math.floor(gridSize / 2) - 1)
  )
  const smallSouthEastPoints = calculatePossiblePositions(
    lines,
    getPosition(0, 0, Math.floor(gridSize / 2) - 1)
  )
  const smallNorthWestPoints = calculatePossiblePositions(
    lines,
    getPosition(gridSize - 1, gridSize - 1, Math.floor(gridSize / 2) - 1)
  )
  const smallSouthWestPoints = calculatePossiblePositions(
    lines,
    getPosition(gridSize - 1, 0, Math.floor(gridSize / 2) - 1)
  )

  const largeNorthEastPoints = calculatePossiblePositions(
    lines,
    getPosition(0, gridSize - 1, Math.floor((gridSize * 3) / 2) - 1)
  )
  const largeSouthEastPoints = calculatePossiblePositions(
    lines,
    getPosition(0, 0, Math.floor((gridSize * 3) / 2) - 1)
  )
  const largeNorthWestPoints = calculatePossiblePositions(
    lines,
    getPosition(gridSize - 1, gridSize - 1, Math.floor((gridSize * 3) / 2) - 1)
  )
  const largeSouthWestPoints = calculatePossiblePositions(
    lines,
    getPosition(gridSize - 1, 0, Math.floor((gridSize * 3) / 2) - 1)
  )

  return (
    oddGrids * oddPoints.length +
    evenGrids * evenPoints.length +
    eastPoints.length +
    westPoints.length +
    northPoints.length +
    southPoints.length +
    (gridWidth + 1) *
      (smallNorthEastPoints.length +
        smallNorthWestPoints.length +
        smallSouthEastPoints.length +
        smallSouthWestPoints.length) +
    gridWidth *
      (largeNorthEastPoints.length +
        largeNorthWestPoints.length +
        largeSouthEastPoints.length +
        largeSouthWestPoints.length)
  )
}

/* Tests */

test(goA(readTestFile(), 6), 16)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput, 64)
const resultB = goB(taskInput, 26501365)
console.timeEnd("Time") // eslint-disable-line no-console
//
console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
