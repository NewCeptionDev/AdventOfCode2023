import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number
  y: number
}

const addEmptyLines = (galaxies: string[][]) => {
  const horizontalChange = []
  galaxies.forEach((line) => {
    if (line.every((character) => character === ".")) {
      horizontalChange.push(line, line)
    } else {
      horizontalChange.push(line)
    }
  })

  const verticalChange = []
  for (let y = 0; y < horizontalChange.length; y++) {
    verticalChange.push([])
  }

  for (let x = 0; x < horizontalChange[0].length; x++) {
    let allEmpty = true
    for (let y = 0; y < horizontalChange.length && allEmpty; y++) {
      if (horizontalChange[y][x] !== ".") {
        allEmpty = false
      }
    }

    for (let y = 0; y < horizontalChange.length; y++) {
      if (allEmpty) {
        verticalChange[y].push(horizontalChange[y][x], horizontalChange[y][x])
      } else {
        verticalChange[y].push(horizontalChange[y][x])
      }
    }
  }

  return verticalChange
}

const getExpandingLines = (galaxyMap: string[][]): number[] => {
  const horizontalExpanding = []
  galaxyMap.forEach((line, index) => {
    if (line.every((character) => character === ".")) {
      horizontalExpanding.push(index)
    }
  })

  return horizontalExpanding
}

const getExpandingColumns = (galaxyMap: string[][]): number[] => {
  const expandingColumns = []

  for (let x = 0; x < galaxyMap[0].length; x++) {
    let allEmpty = true
    for (let y = 0; y < galaxyMap.length && allEmpty; y++) {
      if (galaxyMap[y][x] !== ".") {
        allEmpty = false
      }
    }

    if (allEmpty) {
      expandingColumns.push(x)
    }
  }

  return expandingColumns
}

const getGalaxyPositions = (galaxyMap: string[][]) => {
  const galaxies = []
  for (let y = 0; y < galaxyMap.length; y++) {
    for (let x = 0; x < galaxyMap[y].length; x++) {
      if (galaxyMap[y][x] !== ".") {
        galaxies.push({ x, y })
      }
    }
  }

  return galaxies
}

const calculateDistanceBetweenGalaxies = (galaxy1: Position, galaxy2: Position): number => Math.abs(galaxy2.x - galaxy1.x) + Math.abs(galaxy2.y - galaxy1.y)

const calculateDistanceBetweenGalaxiesWithSpaces = (
  galaxy1: Position,
  galaxy2: Position,
  horizontalExpanding: number[],
  verticalExpanding: number[],
  expansionRange: number
): number => {
  const initialDistance = Math.abs(galaxy2.x - galaxy1.x) + Math.abs(galaxy2.y - galaxy1.y)
  const sortedX = [galaxy1.x, galaxy2.x].sort((a, b) => a - b)
  const sortedY = [galaxy1.y, galaxy2.y].sort((a, b) => a - b)
  const verticalExpansion = verticalExpanding.filter((val) => val > sortedX[0] && val < sortedX[1])
  const horizontalExpansion = horizontalExpanding.filter(
    (val) => val > sortedY[0] && val < sortedY[1]
  )

  return (
    initialDistance +
    expansionRange * (verticalExpansion.length + horizontalExpansion.length) -
    verticalExpansion.length -
    horizontalExpansion.length
  )
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const galaxyMap = lines.map((line) => line.split(""))
  const adjustedGalaxyMap = addEmptyLines(galaxyMap)

  const galaxies = getGalaxyPositions(adjustedGalaxyMap)
  let distanceSum = 0
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      distanceSum += calculateDistanceBetweenGalaxies(galaxies[i], galaxies[j])
    }
  }

  return distanceSum
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const galaxyMap = lines.map((line) => line.split(""))

  const expandingLines = getExpandingLines(galaxyMap)
  const expandingColumns = getExpandingColumns(galaxyMap)

  const galaxies = getGalaxyPositions(galaxyMap)

  let distanceSum = 0
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      distanceSum += calculateDistanceBetweenGalaxiesWithSpaces(
        galaxies[i],
        galaxies[j],
        expandingLines,
        expandingColumns,
        1000000
      )
    }
  }

  return distanceSum
}

/* Tests */

test(goA(readTestFile()), 374)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
