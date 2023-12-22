import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number
  y: number
  z: number
}

const getPosition = (line: string): Position => {
  const split = line.split(",").map((val) => parseInt(val, 10))
  return {
    x: split[0],
    y: split[1],
    z: split[2],
  }
}

const getAllCubePositions = (line: string): Position[] => {
  const split = line.split("~")
  const startPosition = getPosition(split[0])
  const endPosition = getPosition(split[1])
  const positions: Position[] = []

  for (let z = startPosition.z; z <= endPosition.z; z++) {
    for (let y = startPosition.y; y <= endPosition.y; y++) {
      for (let x = startPosition.x; x <= endPosition.x; x++) {
        positions.push({
          x,
          y,
          z,
        })
      }
    }
  }

  return positions
}

const getLowestCubes = (cubes: Position[]): Position[] => {
  const lowestZ = cubes.map((cube) => cube.z).sort((a, b) => a - b)[0]
  return cubes.filter((cube) => cube.z === lowestZ)
}

const findLowestPossiblePosition = (
  cubes: Position[],
  map: Map<number, Map<string, number>>
): number => {
  const highestMapZ = Array.from(map.keys()).sort((a, b) => b - a)[0]

  let lowestCommonPoint = -1
  cubes.forEach((cube) => {
    let currentZ = highestMapZ
    const positionString = `${cube.x},${cube.y}`
    let searching = true
    let lowestFoundPoint = -1
    while (searching) {
      if (currentZ === undefined || currentZ <= 0) {
        lowestFoundPoint = 1
        searching = false
      } else if (!map.get(currentZ).has(positionString)) {
        currentZ--
      } else {
        searching = false
        lowestFoundPoint = currentZ + 1
      }

      if (lowestFoundPoint > lowestCommonPoint) {
        lowestCommonPoint = lowestFoundPoint
      }
    }
  })

  return lowestCommonPoint
}

const findSupportingBlocks = (
  lowestCubes: Position[],
  lowestPoint: number,
  map: Map<number, Map<string, number>>
): number[] => {
  const supportingUniqueElements: number[] = []

  lowestCubes.forEach((cube) => {
    const positionString = `${cube.x},${cube.y}`
    const supportedBy =
      map.has(lowestPoint - 1) && map.get(lowestPoint - 1).has(positionString)
        ? map.get(lowestPoint - 1).get(positionString)
        : -1
    if (supportedBy !== -1 && !supportingUniqueElements.includes(supportedBy)) {
      supportingUniqueElements.push(supportedBy)
    }
  })

  return supportingUniqueElements
}

const getSmallestYForLine = (line: string): number => {
  const split = line.split("~")
  const startPosition = getPosition(split[0])
  const endPosition = getPosition(split[1])

  return startPosition.z < endPosition.z ? startPosition.z : endPosition.z
}

const addCubesToMapAndSupporting = (
  line: string,
  map: Map<number, Map<string, number>>,
  supporting: Map<number, number[]>,
  lineIdentifier: number
) => {
  const cubes = getAllCubePositions(line)
  const lowestCubes = getLowestCubes(cubes)

  const lowestPossibleZ = findLowestPossiblePosition(lowestCubes, map)
  const downAdjustment = lowestCubes[0].z - lowestPossibleZ
  const adjustedCubes = cubes.map((cube) => ({
    x: cube.x,
    y: cube.y,
    z: cube.z - downAdjustment,
  }))

  adjustedCubes.forEach((cube) => {
    if (!map.has(cube.z)) {
      map.set(cube.z, new Map<string, number>())
    }

    const positionString = `${cube.x},${cube.y}`
    map.get(cube.z).set(positionString, lineIdentifier)
  })

  supporting.set(lineIdentifier, findSupportingBlocks(lowestCubes, lowestPossibleZ, map))
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const map: Map<number, Map<string, number>> = new Map<number, Map<string, number>>()
  const supporting: Map<number, number[]> = new Map<number, number[]>()

  let safelyRemovable = 0

  const sortedLines = lines.sort((a, b) => getSmallestYForLine(a) - getSmallestYForLine(b))

  sortedLines.forEach((line, lineIndex) =>
    addCubesToMapAndSupporting(line, map, supporting, lineIndex)
  )

  Array.from(supporting.keys()).forEach((key) => {
    if (
      Array.from(supporting.values()).every(
        (supportingElements) =>
          supportingElements.length === 0 ||
          supportingElements.length > 1 ||
          supportingElements[0] !== key
      )
    ) {
      safelyRemovable++
    }
  })

  return safelyRemovable
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const map: Map<number, Map<string, number>> = new Map<number, Map<string, number>>()
  const supporting: Map<number, number[]> = new Map<number, number[]>()

  const sortedLines = lines.sort((a, b) => getSmallestYForLine(a) - getSmallestYForLine(b))

  sortedLines.forEach((line, lineIndex) =>
    addCubesToMapAndSupporting(line, map, supporting, lineIndex)
  )

  let fallingBricks = 0

  Array.from(supporting.keys()).forEach((key) => {
    if (
      !Array.from(supporting.values()).every(
        (supportingElements) =>
          supportingElements.length === 0 ||
          supportingElements.length > 1 ||
          supportingElements[0] !== key
      )
    ) {
      // Is single Point of failure
      let hasChanges = true
      const removedOrFalling = [key]
      while (hasChanges) {
        hasChanges = false
        let localHasChanges = hasChanges
        Array.from(supporting.keys()).forEach((supportingKey) => {
          if (
            supporting.get(supportingKey).length > 0 &&
            supporting.get(supportingKey).filter((val) => !removedOrFalling.includes(val))
              .length === 0
          ) {
            if (!removedOrFalling.includes(supportingKey)) {
              removedOrFalling.push(supportingKey)
              localHasChanges = true
            }
          }
        })
        hasChanges = localHasChanges
      }
      fallingBricks += removedOrFalling.length - 1
    }
  })

  return fallingBricks
}

/* Tests */

test(goA(readTestFile()), 5)
test(goB(readTestFile()), 7)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
