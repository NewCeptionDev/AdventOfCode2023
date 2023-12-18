import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number
  y: number
}

const parseMap = (lines: string[]): Map<number, Map<number, string>> => {
  const map = new Map<number, Map<number, string>>()
  let currentX = 0
  let currentY = 0

  lines.forEach((instruction) => {
    const parts = instruction.split(" ")
    const direction = parts[0]
    const amount = parseInt(parts[1], 10)
    const color = parts[2]

    let endX = currentX
    let endY = currentY
    switch (direction) {
      case "L":
        endX = currentX - amount
        currentX = currentX - 1
        break
      case "R":
        endX = currentX + amount
        currentX = currentX + 1
        break
      case "U":
        endY = currentY - amount
        currentY = currentY - 1
        break
      case "D":
        endY = currentY + amount
        currentY = currentY + 1
        break
      default:
        throw new Error("Unknown direction")
    }

    const ySorted = [currentY, endY].sort((a, b) => a - b)
    const xSorted = [currentX, endX].sort((a, b) => a - b)
    for (let y = ySorted[0]; y <= ySorted[1]; y++) {
      if (!map.has(y)) {
        map.set(y, new Map<number, string>())
      }
      for (let x = xSorted[0]; x <= xSorted[1]; x++) {
        map.get(y).set(x, color)
      }
    }
    currentX = endX
    currentY = endY
  })

  return map
}

const isEndpoint = (expected: Position, point: Position): boolean =>
  expected.x === point.x && expected.y === point.y

const getPointsCounterClockWise = (map: Map<number, Map<number, string>>): Position[] => {
  const yKeys = Array.from(map.keys()).sort((a, b) => a - b)
  const smallestY = yKeys[0]
  const largestY = yKeys[yKeys.length - 1]
  const points: Position[] = []
  let lastX: number = Array.from(map.get(smallestY).keys()).sort((a, b) => b - a)[0]
  let lastPointReached = false
  let currentY = smallestY
  let yDown: boolean = true

  while (!lastPointReached) {
    const xValues = Array.from(map.get(currentY).keys()).sort((a, b) => a - b)
    if (!xValues.includes(lastX)) {
      currentY = yDown ? currentY - 1 : currentY + 1
      yDown = !yDown
    } else {
      points.push({
        x: lastX,
        y: currentY,
      })

      if (points.length > 1 && isEndpoint(points[0], points[points.length - 1])) {
        lastPointReached = true
        points.pop()
      }

      if (!lastPointReached && xValues.includes(lastX - 1)) {
        while (xValues.includes(lastX - 1)) {
          points.push({
            x: lastX - 1,
            y: currentY,
          })
          lastX = lastX - 1
        }
      } else if (!lastPointReached && xValues.includes(lastX + 1)) {
        while (xValues.includes(lastX + 1)) {
          points.push({
            x: lastX + 1,
            y: currentY,
          })
          lastX = lastX + 1
        }
      }
    }

    if (yDown && currentY === largestY) {
      yDown = false
      currentY = currentY - 1
    } else if (!yDown && currentY === smallestY) {
      yDown = true
      currentY = currentY + 1
    } else {
      currentY = yDown ? currentY + 1 : currentY - 1
    }
  }

  return points
}

const getPointDifference = (point1: Position, point2: Position): number =>
  (point1.y + point2.y) * (point1.x - point2.x)

const shoelaceAlgorithm = (points: Position[]): number => {
  let pointSum = 0
  let outline = 0

  for (let i = 0; i < points.length; i++) {
    if (i === points.length - 1) {
      pointSum += getPointDifference(points[i], points[0])
      outline += Math.abs(points[i].x - points[0].x + (points[i].y - points[0].y))
    } else {
      pointSum += getPointDifference(points[i], points[i + 1])
      outline += Math.abs(points[i].x - points[i + 1].x + (points[i].y - points[i + 1].y))
    }
  }

  outline += 1

  return Math.round(0.5 * (Math.abs(pointSum) + outline))
}

const getCornerPoints = (lines: string[]): Position[] => {
  const points: Position[] = []
  let currentX = 0
  let currentY = 0
  let nextX = 0
  let nextY = 0

  points.push({
    x: currentX,
    y: currentY,
  })

  lines.forEach((line, index) => {
    const relevantPart = line.split(" ")[2].replace("(", "").replace(")", "")

    const direction = relevantPart.charAt(relevantPart.length - 1)
    const amount = parseInt(relevantPart.slice(1, relevantPart.length - 1), 16)

    // Add startPoint
    switch (direction) {
      case "0":
        nextX = currentX + amount
        break
      case "1":
        nextY = currentY + amount
        break
      case "2":
        nextX = currentX - amount
        break
      case "3":
        nextY = currentY - amount
        break
      default:
        throw new Error("Unknown direction")
    }

    if (lines.length - 1 !== index) {
      points.push({
        x: nextX,
        y: nextY,
      })
    }

    currentX = nextX
    currentY = nextY
  })

  return points
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const map = parseMap(lines)

  return shoelaceAlgorithm(getPointsCounterClockWise(map))
}

const goB = (input: string) => {
  const lines = splitToLines(input)

  return shoelaceAlgorithm(getCornerPoints(lines))
}

/* Tests */

test(goA(readTestFile()), 62)
test(goB(readTestFile()), 952408144115)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
