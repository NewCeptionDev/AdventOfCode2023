import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Beam {
  x: number
  y: number
  direction: Direction
}

enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

const getNextBeamForDot = (beam: Beam): Beam => {
  switch (beam.direction) {
    case Direction.NORTH:
      return {
        x: beam.x,
        y: beam.y - 1,
        direction: beam.direction,
      }
    case Direction.SOUTH:
      return {
        x: beam.x,
        y: beam.y + 1,
        direction: beam.direction,
      }
    case Direction.EAST:
      return {
        x: beam.x + 1,
        y: beam.y,
        direction: beam.direction,
      }
    case Direction.WEST:
      return {
        x: beam.x - 1,
        y: beam.y,
        direction: beam.direction,
      }
    default:
      throw new Error("Unknown direction")
  }
}

const getNextBeamForVerticalLine = (beam: Beam): Beam[] => {
  switch (beam.direction) {
    case Direction.NORTH:
      return [
        {
          x: beam.x,
          y: beam.y - 1,
          direction: beam.direction,
        },
      ]
    case Direction.SOUTH:
      return [
        {
          x: beam.x,
          y: beam.y + 1,
          direction: beam.direction,
        },
      ]
    case Direction.EAST:
      return [
        {
          x: beam.x,
          y: beam.y - 1,
          direction: Direction.NORTH,
        },
        {
          x: beam.x,
          y: beam.y + 1,
          direction: Direction.SOUTH,
        },
      ]
    case Direction.WEST:
      return [
        {
          x: beam.x,
          y: beam.y + 1,
          direction: Direction.SOUTH,
        },
        {
          x: beam.x,
          y: beam.y - 1,
          direction: Direction.NORTH,
        },
      ]
    default:
      throw new Error("Unknown direction")
  }
}

const getNextBeamForHorizontalLine = (beam: Beam): Beam[] => {
  switch (beam.direction) {
    case Direction.NORTH:
      return [
        {
          x: beam.x - 1,
          y: beam.y,
          direction: Direction.WEST,
        },
        {
          x: beam.x + 1,
          y: beam.y,
          direction: Direction.EAST,
        },
      ]
    case Direction.SOUTH:
      return [
        {
          x: beam.x + 1,
          y: beam.y,
          direction: Direction.EAST,
        },
        {
          x: beam.x - 1,
          y: beam.y,
          direction: Direction.WEST,
        },
      ]
    case Direction.EAST:
      return [
        {
          x: beam.x + 1,
          y: beam.y,
          direction: beam.direction,
        },
      ]
    case Direction.WEST:
      return [
        {
          x: beam.x - 1,
          y: beam.y,
          direction: beam.direction,
        },
      ]
    default:
      throw new Error("Unknown direction")
  }
}

const getNextBeamForSlash = (beam: Beam): Beam => {
  switch (beam.direction) {
    case Direction.NORTH:
      return {
        x: beam.x + 1,
        y: beam.y,
        direction: Direction.EAST,
      }
    case Direction.SOUTH:
      return {
        x: beam.x - 1,
        y: beam.y,
        direction: Direction.WEST,
      }
    case Direction.EAST:
      return {
        x: beam.x,
        y: beam.y - 1,
        direction: Direction.NORTH,
      }
    case Direction.WEST:
      return {
        x: beam.x,
        y: beam.y + 1,
        direction: Direction.SOUTH,
      }
    default:
      throw new Error("Unknown direction")
  }
}

const getNextBeamForBackSlash = (beam: Beam): Beam => {
  switch (beam.direction) {
    case Direction.NORTH:
      return {
        x: beam.x - 1,
        y: beam.y,
        direction: Direction.WEST,
      }
    case Direction.SOUTH:
      return {
        x: beam.x + 1,
        y: beam.y,
        direction: Direction.EAST,
      }
    case Direction.EAST:
      return {
        x: beam.x,
        y: beam.y + 1,
        direction: Direction.SOUTH,
      }
    case Direction.WEST:
      return {
        x: beam.x,
        y: beam.y - 1,
        direction: Direction.NORTH,
      }
    default:
      throw new Error("Unknown direction")
  }
}

const getNextBeam = (map: string[], beam: Beam): Beam[] => {
  if (beam.y >= 0 && beam.y < map.length && beam.x >= 0 && beam.x < map[beam.y].length) {
    const element = map[beam.y][beam.x]

    if (element === ".") {
      return [getNextBeamForDot(beam)]
    } else if (element === "|") {
      return getNextBeamForVerticalLine(beam)
    } else if (element === "-") {
      return getNextBeamForHorizontalLine(beam)
    } else if (element === "/") {
      return [getNextBeamForSlash(beam)]
    } else if (element === "\\") {
      return [getNextBeamForBackSlash(beam)]
    }
  }
  return []
}

const isValidPosition = (map: string[], beam: Beam): boolean => beam.y >= 0 && beam.y < map.length && beam.x >= 0 && beam.x < map[beam.y].length

const getCountOfEnergizedTiles = (map: string[], startingBeam: Beam): number => {
  const visited: Map<number, number[]> = new Map<number, number[]>()
  const cache: Map<string, boolean> = new Map<string, boolean>()
  let beams = [startingBeam]

  while (beams.length > 0) {
    // for(let i = 0; i < 100; i++) {
    const newBeams: Beam[] = []

    beams.forEach((beam) => {
      if (isValidPosition(map, beam)) {
        const cacheString = `${beam.x  },${  beam.y  },${  beam.direction}`

        if (!cache.has(cacheString)) {
          if (!visited.has(beam.y)) {
            visited.set(beam.y, [])
          }

          if (!visited.get(beam.y).includes(beam.x)) {
            visited.get(beam.y).push(beam.x)
          }

          const result = getNextBeam(map, beam)
          newBeams.push(...result)
        }
        cache.set(cacheString, true)
      }
    })
    beams = newBeams
  }

  return Array.from(visited.values())
    .map((list) => list.length)
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const startingBeam: Beam = {
    x: 0,
    y: 0,
    direction: Direction.EAST,
  }

  return getCountOfEnergizedTiles(lines, startingBeam)
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  let highestCountOfEnergizedTiles = 0

  for (let y = 0; y < lines.length; y++) {
    const fromWest = {
      x: 0,
      y,
      direction: Direction.EAST,
    }
    const fromEast = {
      x: lines[y].length - 1,
      y,
      direction: Direction.WEST,
    }

    const fromWestEnergized = getCountOfEnergizedTiles(lines, fromWest)
    const fromEastEnergized = getCountOfEnergizedTiles(lines, fromEast)

    if (fromWestEnergized > highestCountOfEnergizedTiles) {
      highestCountOfEnergizedTiles = fromWestEnergized
    }

    if (fromEastEnergized > highestCountOfEnergizedTiles) {
      highestCountOfEnergizedTiles = fromEastEnergized
    }
  }

  for (let x = 0; x < lines[0].length; x++) {
    const fromNorth = {
      x,
      y: 0,
      direction: Direction.SOUTH,
    }
    const fromSouth = {
      x,
      y: lines.length - 1,
      direction: Direction.NORTH,
    }

    const fromNorthEnergized = getCountOfEnergizedTiles(lines, fromNorth)
    const fromSouthEnergized = getCountOfEnergizedTiles(lines, fromSouth)

    if (fromNorthEnergized > highestCountOfEnergizedTiles) {
      highestCountOfEnergizedTiles = fromNorthEnergized
    }

    if (fromSouthEnergized > highestCountOfEnergizedTiles) {
      highestCountOfEnergizedTiles = fromSouthEnergized
    }
  }

  return highestCountOfEnergizedTiles
}

/* Tests */

test(goA(readTestFile()), 46)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
