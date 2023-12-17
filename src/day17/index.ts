import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

interface Position {
  x: number
  y: number
}

interface Path {
  current: Position
  direction: Direction
  movesInSameDirection: number
}

const getPathForLeftTurn = (path: Path): Path => {
  let newPosition: Position
  let newDirection: Direction
  switch (path.direction) {
    case Direction.NORTH:
      newPosition = {
        x: path.current.x - 1,
        y: path.current.y,
      }
      newDirection = Direction.WEST
      break
    case Direction.EAST:
      newPosition = {
        x: path.current.x,
        y: path.current.y - 1,
      }
      newDirection = Direction.NORTH
      break
    case Direction.SOUTH:
      newPosition = {
        x: path.current.x + 1,
        y: path.current.y,
      }
      newDirection = Direction.EAST
      break
    case Direction.WEST:
      newPosition = {
        x: path.current.x,
        y: path.current.y + 1,
      }
      newDirection = Direction.SOUTH
      break
    default:
      throw new Error("Unknown direction")
  }

  return {
    current: newPosition,
    direction: newDirection,
    movesInSameDirection: 1,
  }
}

const getPathForRightTurn = (path: Path): Path => {
  let newPosition: Position
  let newDirection: Direction
  switch (path.direction) {
    case Direction.NORTH:
      newPosition = {
        x: path.current.x + 1,
        y: path.current.y,
      }
      newDirection = Direction.EAST
      break
    case Direction.EAST:
      newPosition = {
        x: path.current.x,
        y: path.current.y + 1,
      }
      newDirection = Direction.SOUTH
      break
    case Direction.SOUTH:
      newPosition = {
        x: path.current.x - 1,
        y: path.current.y,
      }
      newDirection = Direction.WEST
      break
    case Direction.WEST:
      newPosition = {
        x: path.current.x,
        y: path.current.y - 1,
      }
      newDirection = Direction.NORTH
      break
    default:
      throw new Error("Unknown direction")
  }
  return {
    current: newPosition,
    direction: newDirection,
    movesInSameDirection: 1,
  }
}

const getPathForSameDirection = (path: Path): Path => {
  let newPosition: Position
  switch (path.direction) {
    case Direction.NORTH:
      newPosition = {
        x: path.current.x,
        y: path.current.y - 1,
      }
      break
    case Direction.EAST:
      newPosition = {
        x: path.current.x + 1,
        y: path.current.y,
      }
      break
    case Direction.SOUTH:
      newPosition = {
        x: path.current.x,
        y: path.current.y + 1,
      }
      break
    case Direction.WEST:
      newPosition = {
        x: path.current.x - 1,
        y: path.current.y,
      }
      break
    default:
      throw new Error("Unknown direction")
  }
  return {
    current: newPosition,
    direction: path.direction,
    movesInSameDirection: path.movesInSameDirection + 1,
  }
}

const getNextPaths = (path: Path, map: string[]) => {
  const nextPaths = [getPathForLeftTurn(path), getPathForRightTurn(path)]

  if (path.movesInSameDirection < 3) {
    nextPaths.push(getPathForSameDirection(path))
  }

  return nextPaths.filter(
    (nextPath) =>
      nextPath.current.x >= 0 &&
      nextPath.current.x < map[0].length &&
      nextPath.current.y >= 0 &&
      nextPath.current.y < map.length
  )
}

const getNextPathsForPart2 = (path: Path, map: string[]) => {
  const nextPaths: Path[] = []

  if (path.movesInSameDirection < 10) {
    nextPaths.push(getPathForSameDirection(path))
  }

  if (path.movesInSameDirection >= 4) {
    nextPaths.push(getPathForLeftTurn(path), getPathForRightTurn(path))
  }

  return nextPaths.filter(
    (nextPath) =>
      nextPath.current.x >= 0 &&
      nextPath.current.x < map[0].length &&
      nextPath.current.y >= 0 &&
      nextPath.current.y < map.length
  )
}

const buildAndTraverseNodeMap = (map: string[], part2: boolean) => {
  const nodeMap = new Map<string, number>()
  nodeMap.set("0,0;1,0", 0)
  nodeMap.set("0,0;2,0", 0)

  let currentNodes: Path[] = []
  currentNodes.push(
    {
      current: {
        x: 0,
        y: 0,
      },
      direction: Direction.SOUTH,
      movesInSameDirection: 0,
    },
    {
      current: {
        x: 0,
        y: 0,
      },
      direction: Direction.EAST,
      movesInSameDirection: 0,
    }
  )

  while (currentNodes.length > 0) {
    const newNodes: Path[] = []
    currentNodes.forEach((node) => {
      const nextPaths = part2 ? getNextPathsForPart2(node, map) : getNextPaths(node, map)
      const currentCost = nodeMap.get(
        `${node.current.x},${node.current.y};${node.direction},${node.movesInSameDirection}`
      )

      nextPaths.forEach((path) => {
        const pathIdentifier = `${path.current.x},${path.current.y};${path.direction},${path.movesInSameDirection}`
        const heatCostForNewNode =
          currentCost + parseInt(map[path.current.y].charAt(path.current.x), 10)

        if (!nodeMap.has(pathIdentifier) || nodeMap.get(pathIdentifier) > heatCostForNewNode) {
          nodeMap.set(pathIdentifier, heatCostForNewNode)
          newNodes.push(path)
        }
      })
    })
    currentNodes = newNodes
  }

  return Array.from(nodeMap.keys())
    .filter((key) => key.startsWith(`${map.length - 1},${map[0].length - 1}`))
    .filter(
      (key) =>
        !part2 || (parseInt(key.split(",")[2], 10) >= 4 && parseInt(key.split(",")[2], 10) <= 10)
    )
    .map((key) => nodeMap.get(key))
    .sort((a, b) => a - b)[0]
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  return buildAndTraverseNodeMap(lines, false)
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  return buildAndTraverseNodeMap(lines, true)
}

/* Tests */

test(goA(readTestFile()), 102)
test(goB(readTestFile()), 94)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
