import { readInput, test } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

type PointMap = Map<number, Map<number, Point>>

enum InnerDirection {
  NORTH,
  EAST,
  SOUTH,
  WEST,
  NORTH_EAST,
  NORTH_WEST,
  SOUTH_EAST,
  SOUTH_WEST,
}

interface Position {
  x: number
  y: number
}

interface Point {
  isStartPipe: boolean
  identifier: string
  pos: Position
  leftPosition: Position | null
  rightPosition: Position | null
}

// Get all Positions from a direction that are startPoints for an area within the loop
const getInnerPositions = (position: Position, innerDirection: InnerDirection): Position[] => {
  switch (innerDirection) {
    case InnerDirection.NORTH:
      return [
        {
          x: position.x,
          y: position.y - 1,
        },
      ]
    case InnerDirection.EAST:
      return [
        {
          x: position.x + 1,
          y: position.y,
        },
      ]
    case InnerDirection.SOUTH:
      return [
        {
          x: position.x,
          y: position.y + 1,
        },
      ]
    case InnerDirection.WEST:
      return [
        {
          x: position.x - 1,
          y: position.y,
        },
      ]
    case InnerDirection.NORTH_EAST:
      return [
        {
          x: position.x + 1,
          y: position.y - 1,
        },
        {
          x: position.x,
          y: position.y - 1,
        },
        {
          x: position.x + 1,
          y: position.y,
        },
      ]
    case InnerDirection.NORTH_WEST:
      return [
        {
          x: position.x - 1,
          y: position.y - 1,
        },
        {
          x: position.x,
          y: position.y - 1,
        },
        {
          x: position.x - 1,
          y: position.y,
        },
      ]
    case InnerDirection.SOUTH_EAST:
      return [
        {
          x: position.x + 1,
          y: position.y + 1,
        },
        {
          x: position.x,
          y: position.y + 1,
        },
        {
          x: position.x + 1,
          y: position.y,
        },
      ]
    case InnerDirection.SOUTH_WEST:
      return [
        {
          x: position.x - 1,
          y: position.y + 1,
        },
        {
          x: position.x,
          y: position.y + 1,
        },
        {
          x: position.x - 1,
          y: position.y,
        },
      ]
    default:
      throw new Error(`Unknown Inner Direction: ${innerDirection}`)
  }
}

// Identify Positions where the pipe is connected
const identifyConnectedPointPositions = (pipeType: string, pos: Position): Position[] => {
  switch (pipeType) {
    case "|":
      return [
        {
          x: pos.x,
          y: pos.y - 1,
        },
        {
          x: pos.x,
          y: pos.y + 1,
        },
      ]
    case "-":
      return [
        {
          x: pos.x - 1,
          y: pos.y,
        },
        {
          x: pos.x + 1,
          y: pos.y,
        },
      ]
    case "L":
      return [
        {
          x: pos.x + 1,
          y: pos.y,
        },
        {
          x: pos.x,
          y: pos.y - 1,
        },
      ]
    case "J":
      return [
        {
          x: pos.x - 1,
          y: pos.y,
        },
        {
          x: pos.x,
          y: pos.y - 1,
        },
      ]
    case "7":
      return [
        {
          x: pos.x - 1,
          y: pos.y,
        },
        {
          x: pos.x,
          y: pos.y + 1,
        },
      ]
    case "F":
      return [
        {
          x: pos.x + 1,
          y: pos.y,
        },
        {
          x: pos.x,
          y: pos.y + 1,
        },
      ]
    default:
      throw new Error(`Unknown PipeType: ${pipeType}`)
  }
}

const parsePoint = (pipe: string, pos: Position): Point => {
  if (pipe === "S" || pipe === ".") {
    return {
      isStartPipe: pipe === "S",
      identifier: pipe,
      pos,
      leftPosition: null,
      rightPosition: null,
    }
  }

  const connectedPositions = identifyConnectedPointPositions(pipe, pos)

  return {
    isStartPipe: false,
    identifier: pipe,
    pos,
    leftPosition: connectedPositions[0],
    rightPosition: connectedPositions[1],
  }
}

const parsePoints = (lines: string[]): PointMap => {
  const resultMap = new Map<number, Map<number, Point>>()

  lines.forEach((line, y) => {
    const lineMap = new Map<number, Point>()

    line.split("").forEach((character, x) => {
      lineMap.set(x, parsePoint(character, { x, y }))
    })
    resultMap.set(y, lineMap)
  })

  return resultMap
}

const getPoint = (pos: Position, pointMap: PointMap): Point | null => {
  if (pointMap.has(pos.y) && pointMap.get(pos.y).has(pos.x)) {
    return pointMap.get(pos.y).get(pos.x)
  }

  return null
}

// Find loop by running through connected pipes until they meet or have no connection point
const findLoop = (startPoint: Point, pointMap: PointMap): Point[] => {
  const loopPoints = []
  let lastPoints = []

  let openLoop = false
  let finishedLoop = false
  while (!openLoop && !finishedLoop) {
    if (lastPoints.length === 0) {
      const firstPoints = [
        getPoint(startPoint.leftPosition, pointMap),
        getPoint(startPoint.rightPosition, pointMap),
      ]
      loopPoints.push(startPoint, ...firstPoints)
      lastPoints.push(...firstPoints, startPoint)
    } else {
      const newPoints = [
        getPoint(lastPoints[0].leftPosition, pointMap),
        getPoint(lastPoints[0].rightPosition, pointMap),
        getPoint(lastPoints[1].leftPosition, pointMap),
        getPoint(lastPoints[1].rightPosition, pointMap),
      ]

      if (
        newPoints.length < 4 ||
        newPoints.some(
          (point) => (!point.leftPosition || !point.rightPosition) && !point.isStartPipe
        )
      ) {
        openLoop = true
      }

      const actuallyNewPoints = newPoints.filter((newPoint) =>
        loopPoints.every(
          (lastPoint) => lastPoint.pos.x !== newPoint.pos.x || lastPoint.pos.y !== newPoint.pos.y
        )
      )

      if (
        actuallyNewPoints.length === 1 ||
        (actuallyNewPoints.length === 2 &&
          actuallyNewPoints[0].pos.x === actuallyNewPoints[1].pos.x &&
          actuallyNewPoints[0].pos.y === actuallyNewPoints[1].pos.y)
      ) {
        finishedLoop = true
        loopPoints.push(actuallyNewPoints[0])
      } else {
        loopPoints.push(...actuallyNewPoints)
        lastPoints = actuallyNewPoints
      }
    }
  }

  if (finishedLoop) {
    return loopPoints
  }

  return []
}

// Returns all possible connections from the start point
const findPossibleConnectionsFromStartPoint = (startPoint: Point, pointMap: PointMap): Point[] => {
  const surroundingPositions: Position[] = [
    {
      x: startPoint.pos.x - 1,
      y: startPoint.pos.y,
    },
    {
      x: startPoint.pos.x - 1,
      y: startPoint.pos.y - 1,
    },
    {
      x: startPoint.pos.x,
      y: startPoint.pos.y - 1,
    },
    {
      x: startPoint.pos.x + 1,
      y: startPoint.pos.y - 1,
    },
    {
      x: startPoint.pos.x + 1,
      y: startPoint.pos.y,
    },
    {
      x: startPoint.pos.x + 1,
      y: startPoint.pos.y + 1,
    },
    {
      x: startPoint.pos.x,
      y: startPoint.pos.y + 1,
    },
    {
      x: startPoint.pos.x - 1,
      y: startPoint.pos.y + 1,
    },
  ]

  const possibleConnectionPoints = []

  surroundingPositions.forEach((pos) => {
    if (pointMap.has(pos.y) && pointMap.get(pos.y).has(pos.x)) {
      const possiblePoint = pointMap.get(pos.y).get(pos.x)

      if (
        possiblePoint &&
        possiblePoint.leftPosition &&
        possiblePoint.rightPosition &&
        ((possiblePoint.leftPosition.x === startPoint.pos.x &&
          possiblePoint.leftPosition.y === startPoint.pos.y) ||
          (possiblePoint.rightPosition.x === startPoint.pos.x &&
            possiblePoint.rightPosition.y === startPoint.pos.y))
      ) {
        possibleConnectionPoints.push(possiblePoint)
      }
    }
  })

  return possibleConnectionPoints
}

// Checks all possible connections from the start point for a loop and returns it when found
const findLoopFromStartPoint = (startPoint: Point, pointMap: PointMap): Point[] => {
  const possibleConnectionPoints = findPossibleConnectionsFromStartPoint(startPoint, pointMap)

  const startPointsToTry: Point[] = []
  for (let i = 0; i < possibleConnectionPoints.length; i++) {
    for (let j = i + 1; j < possibleConnectionPoints.length; j++) {
      startPointsToTry.push({
        isStartPipe: true,
        identifier: getCorrectIdentifier(possibleConnectionPoints[i], possibleConnectionPoints[j]),
        pos: startPoint.pos,
        leftPosition: possibleConnectionPoints[i].pos,
        rightPosition: possibleConnectionPoints[j].pos,
      })
    }
  }

  let loop = []

  startPointsToTry.forEach((point) => {
    if (loop.length > 0) {
      return
    }

    const result = findLoop(point, pointMap)

    if (result.length > 0) {
      loop = result
    }
  })

  if (loop.length > 0) {
    return loop
  }

  throw new Error("No Loop found")
}

// Identifies the correct pipe type for the start point based on the connected pipes
const getCorrectIdentifier = (leftPoint: Point, rightPoint: Point): string => {
  if (leftPoint.pos.x === rightPoint.pos.x) {
    return "|"
  }
  if (leftPoint.pos.y === rightPoint.pos.y) {
    return "-"
  }
  if (leftPoint.identifier === "|" && leftPoint.pos.x + 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "F"
    }
    return "L"
  }
  if (leftPoint.identifier === "|" && leftPoint.pos.x - 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "7"
    }
    return "J"
  }
  if (leftPoint.identifier === "-" && leftPoint.pos.x + 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "J"
    }
    return "7"
  }
  if (leftPoint.identifier === "-" && leftPoint.pos.x - 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "L"
    }
    return "F"
  }
  if (leftPoint.identifier === "L" && leftPoint.pos.x + 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "F"
    }
    return "7"
  }
  if (leftPoint.identifier === "L" && leftPoint.pos.x - 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "7"
    }
    throw new Error("Should not happen")
  }
  if (leftPoint.identifier === "F" && leftPoint.pos.x + 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "J"
    }
    return "7"
  }
  if (leftPoint.identifier === "F" && leftPoint.pos.x - 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      throw new Error("Should not happen")
    } else {
      return "J"
    }
  }
  if (leftPoint.identifier === "J" && leftPoint.pos.x + 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "F"
    }
    throw new Error("Should no happen")
  }
  if (leftPoint.identifier === "J" && leftPoint.pos.x - 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "7"
    }
    return "F"
  }
  if (leftPoint.identifier === "7" && leftPoint.pos.x + 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      throw new Error("Should not happen")
    } else {
      return "L"
    }
  }
  if (leftPoint.identifier === "7" && leftPoint.pos.x - 1 === rightPoint.pos.x) {
    if (leftPoint.pos.y - 1 === rightPoint.pos.y) {
      return "L"
    }
    return "F"
  }

  throw new Error("Was not able to identify correct Identifier for Start Point")
}

// Returns all horizontally and vertically surrounding points
const getSurroundingPoints = (currentPosition: Position, pointMap: PointMap): Point[] => {
  const surroundingPositions: Position[] = [
    {
      x: currentPosition.x - 1,
      y: currentPosition.y,
    },
    {
      x: currentPosition.x,
      y: currentPosition.y - 1,
    },
    {
      x: currentPosition.x + 1,
      y: currentPosition.y,
    },
    {
      x: currentPosition.x,
      y: currentPosition.y + 1,
    },
  ]

  const points = []

  surroundingPositions.forEach((pos) => {
    if (pointMap.has(pos.y) && pointMap.get(pos.y).has(pos.x)) {
      const possiblePoint = pointMap.get(pos.y).get(pos.x)

      if (possiblePoint) {
        points.push(possiblePoint)
      }
    }
  })

  return points
}

// Finds and returns a complete area based on a start point and the loop as a border
const findAllTilesWithinArea = (
  currentPoint: Point,
  loop: Point[],
  pointMap: PointMap
): Point[] => {
  if (!currentPoint) {
    return []
  }

  const area = [currentPoint]
  let possiblePartsOfArea = getSurroundingPoints(currentPoint.pos, pointMap)

  while (possiblePartsOfArea.length > 0) {
    const possiblePartsReference = possiblePartsOfArea
    const newPossible: Point[] = []
    possiblePartsReference.forEach((point) => {
      if (
        loop.some((loopPoint) => point.pos.x === loopPoint.pos.x && point.pos.y === loopPoint.pos.y)
      ) {
        // part of loop - ignore
      } else {
        area.push(point)
        const possibleNewPartsOfArea = getSurroundingPoints(point.pos, pointMap)
        const result = possibleNewPartsOfArea.filter(
          (possible) =>
            !area.some(
              (areaPoint) =>
                areaPoint.pos.x === possible.pos.x && areaPoint.pos.y === possible.pos.y
            ) &&
            !possiblePartsReference.some(
              (alreadyPossible) =>
                alreadyPossible.pos.x === possible.pos.x && alreadyPossible.pos.y === possible.pos.y
            ) &&
            !newPossible.some(
              (alreadyAdded) =>
                alreadyAdded.pos.x === possible.pos.x && alreadyAdded.pos.y === possible.pos.y
            )
        )
        newPossible.push(...result)
      }
    })
    possiblePartsOfArea = newPossible
  }

  return area
}

// Returns the new direction of the loops inner area based on the new point, the old point and the old direction
const getNextInnerDirection = (
  newPoint: Point,
  lastInnerDirection: InnerDirection,
  lastPoint: Point
): InnerDirection => {
  switch (newPoint.identifier) {
    case "|":
      if (lastPoint.identifier === "|") {
        return lastInnerDirection
      } else if (lastPoint.identifier === "F") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.WEST
        }
        return InnerDirection.EAST
      } else if (lastPoint.identifier === "7" || lastPoint.identifier === "L") {
        if (lastInnerDirection === InnerDirection.NORTH_EAST) {
          return InnerDirection.EAST
        }
        return InnerDirection.WEST
      } else if (lastPoint.identifier === "J") {
        if (lastInnerDirection === InnerDirection.SOUTH_EAST) {
          return InnerDirection.EAST
        }
        return InnerDirection.WEST
      }
      throw new Error("Unexpected")
    case "-":
      if (lastPoint.identifier === "-") {
        return lastInnerDirection
      } else if (lastPoint.identifier === "L" || lastPoint.identifier === "7") {
        if (lastInnerDirection === InnerDirection.NORTH_EAST) {
          return InnerDirection.NORTH
        }
        return InnerDirection.SOUTH
      } else if (lastPoint.identifier === "F") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.NORTH
        }
        return InnerDirection.SOUTH
      } else if (lastPoint.identifier === "J") {
        if (lastInnerDirection === InnerDirection.SOUTH_EAST) {
          return InnerDirection.SOUTH
        }
        return InnerDirection.NORTH
      }
      throw new Error("Unexpected")
    case "F":
      if (lastPoint.identifier === "|") {
        if (lastInnerDirection === InnerDirection.EAST) {
          return InnerDirection.SOUTH_EAST
        }
        return InnerDirection.NORTH_WEST
      } else if (lastPoint.identifier === "J") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      } else if (lastPoint.identifier === "L") {
        if (lastInnerDirection === InnerDirection.SOUTH_WEST) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      } else if (lastPoint.identifier === "7") {
        if (lastInnerDirection === InnerDirection.NORTH_EAST) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      } else if (lastPoint.identifier === "-") {
        if (lastInnerDirection === InnerDirection.NORTH) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      }
      throw new Error("Unexpected")
    case "L":
      if (lastPoint.identifier === "|") {
        if (lastInnerDirection === InnerDirection.EAST) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      } else if (lastPoint.identifier === "F") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.SOUTH_WEST
        }
        return InnerDirection.NORTH_EAST
      } else if (lastPoint.identifier === "J") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      } else if (lastPoint.identifier === "7") {
        if (lastInnerDirection === InnerDirection.SOUTH_WEST) {
          return InnerDirection.SOUTH_WEST
        }
        return InnerDirection.NORTH_EAST
      } else if (lastPoint.identifier === "-") {
        if (lastInnerDirection === InnerDirection.NORTH) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      }
      throw new Error("Unexpected")
    case "J":
      if (lastPoint.identifier === "|") {
        if (lastInnerDirection === InnerDirection.EAST) {
          return InnerDirection.SOUTH_EAST
        }
        return InnerDirection.NORTH_WEST
      } else if (lastPoint.identifier === "F") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      } else if (lastPoint.identifier === "L") {
        if (lastInnerDirection === InnerDirection.NORTH_EAST) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      } else if (lastPoint.identifier === "7") {
        if (lastInnerDirection === InnerDirection.NORTH_EAST) {
          return InnerDirection.SOUTH_EAST
        }
        return InnerDirection.NORTH_WEST
      } else if (lastPoint.identifier === "-") {
        if (lastInnerDirection === InnerDirection.NORTH) {
          return InnerDirection.NORTH_WEST
        }
        return InnerDirection.SOUTH_EAST
      }
      throw new Error("Unexpected")
    case "7":
      if (lastPoint.identifier === "|") {
        if (lastInnerDirection === InnerDirection.EAST) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      } else if (lastPoint.identifier === "F") {
        if (lastInnerDirection === InnerDirection.NORTH_WEST) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      } else if (lastPoint.identifier === "J") {
        if (lastInnerDirection === InnerDirection.SOUTH_EAST) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      } else if (lastPoint.identifier === "L") {
        if (lastInnerDirection === InnerDirection.SOUTH_WEST) {
          return InnerDirection.SOUTH_WEST
        }
        return InnerDirection.NORTH_EAST
      } else if (lastPoint.identifier === "-") {
        if (lastInnerDirection === InnerDirection.NORTH) {
          return InnerDirection.NORTH_EAST
        }
        return InnerDirection.SOUTH_WEST
      }
      throw new Error("Unexpected")
    default:
      throw new Error(`no inner direction found for: ${newPoint.identifier},${lastInnerDirection}`)
  }
}

// Goes through all tiles and finds all tiles enclosed by loop. returns count of enclosed tiles
const countTilesEnclosedByLoop = (loop: Point[], pointMap: PointMap): number => {
  const checkedEnclosed = []

  let startPoint: Point

  // Find first Loop line with a horizontal Element - This is always an outer line
  for (let y = 0; y < Array.from(pointMap.keys()).length && !startPoint; y++) {
    for (let x = 0; x < Array.from(pointMap.get(y).keys()).length && !startPoint; x++) {
      if (
        pointMap.get(y).get(x).identifier === "-" &&
        loop.some((point) => point.pos.x === x && point.pos.y === y)
      ) {
        startPoint = pointMap.get(y).get(x)
      }
    }
  }

  let currentPoint = getPoint(startPoint.leftPosition, pointMap)
  let lastPoint: Point = startPoint
  // Last direction was SOUTH as it was an upper outer line element
  let currentInnerDirection = getNextInnerDirection(currentPoint, InnerDirection.SOUTH, lastPoint)

  while (currentPoint.pos.x !== startPoint.pos.x || currentPoint.pos.y !== startPoint.pos.y) {
    const innerAreaPoints = getInnerPositions(currentPoint.pos, currentInnerDirection)

    innerAreaPoints.forEach((innerAreaPoint) => {
      if (
        !loop.some(
          (point) => point.pos.x === innerAreaPoint.x && point.pos.y === innerAreaPoint.y
        ) &&
        !checkedEnclosed.some(
          (point) => point.pos.x === innerAreaPoint.x && point.pos.y === innerAreaPoint.y
        )
      ) {
        checkedEnclosed.push(
          ...findAllTilesWithinArea(getPoint(innerAreaPoint, pointMap), loop, pointMap)
        )
      }
    })

    const lastPointReference = lastPoint

    const nextPoint = [currentPoint.leftPosition, currentPoint.rightPosition].filter(
      (next) => next.x !== lastPointReference.pos.x || next.y !== lastPointReference.pos.y
    )

    lastPoint = currentPoint
    currentPoint = getPoint(nextPoint[0], pointMap)
    currentInnerDirection = getNextInnerDirection(currentPoint, currentInnerDirection, lastPoint)
  }

  return checkedEnclosed.length
}

const getLoop = (pointMap: PointMap) => {
  const startPoint = Array.from(pointMap.values()).flatMap((yPoints) =>
    Array.from(yPoints.values()).filter((point) => point.isStartPipe)
  )[0]

  if (!startPoint) {
    throw new Error("StartPoint not found")
  }

  return findLoopFromStartPoint(startPoint, pointMap)
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const pointMap: PointMap = parsePoints(lines)

  return Math.round((getLoop(pointMap).length - 1) / 2)
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const pointMap = parsePoints(lines)

  const loop = getLoop(pointMap)

  const loopStart = loop.find((point) => point.isStartPipe)
  pointMap.get(loopStart.pos.y).set(loopStart.pos.x, loopStart)

  return countTilesEnclosedByLoop(loop, pointMap)
}

/* Tests */

test(goA(readTestFile()), 4)
test(goB(readInputFromSpecialFile("testInput2.txt")), 4)
test(goB(readInputFromSpecialFile("testInput3.txt")), 8)
test(goB(readInputFromSpecialFile("testInput4.txt")), 10)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
