import {readInput, test} from "../utils/index"
import {readTestFile, splitToLines} from "../utils/readInput";

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
    x: number,
    y: number
}

interface PositionWithDistance {
    position: Position,
    distance: number
}

const isInMap = (position: Position, map: string[]): boolean => {
    return position.y >= 0 && position.y < map.length && position.x >= 0 && position.x < map[position.y].length && map[position.y].charAt(position.x) !== "#"
}

const getPossiblePositions = (position: Position, lastPosition: Position, endPosition: Position, map: string[], slipperySlopes: boolean): PositionWithDistance[] => {
    const east = {
        x: position.x + 1,
        y: position.y
    }

    const west = {
        x: position.x - 1,
        y: position.y
    }

    const north = {
        x: position.x,
        y: position.y - 1
    }

    const south = {
        x: position.x,
        y: position.y + 1
    }

    const currentSymbol = map[position.y].charAt(position.x)

    let possiblePositionsWithDistance: PositionWithDistance[] = []

    if (slipperySlopes && currentSymbol === ">") {
        possiblePositionsWithDistance = isInMap(east, map) ? [{position: east, distance: 1}] : []
    } else if (slipperySlopes && currentSymbol === "<") {
        possiblePositionsWithDistance = isInMap(west, map) ? [{position: west, distance: 1}] : []
    } else if (slipperySlopes && currentSymbol === "^") {
        possiblePositionsWithDistance = isInMap(north, map) ? [{position: north, distance: 1}] : []
    } else if (slipperySlopes && currentSymbol === "v") {
        possiblePositionsWithDistance = isInMap(south, map) ? [{position: south, distance: 1}] : []
    } else {
        possiblePositionsWithDistance = [east, west, north, south]
            .filter(pos => isInMap(pos, map))
            .filter(pos => lastPosition === undefined || (lastPosition.x !== pos.x || lastPosition.y !== pos.y))
            .map(pos => {
                return {
                    position: pos,
                    distance: 1
                }
            })
    }

    if (possiblePositionsWithDistance.length === 1 && (possiblePositionsWithDistance[0].position.x !== endPosition.x || possiblePositionsWithDistance[0].position.y !== endPosition.y)) {
        if (isJunction(possiblePositionsWithDistance[0].position, map)) {
            return possiblePositionsWithDistance.map(val => {
                return {
                    position: val.position,
                    distance: val.distance + 1
                }
            })
        }

        return getPossiblePositions(possiblePositionsWithDistance[0].position, position, endPosition, map, slipperySlopes).map(val => {
            return {
                position: val.position,
                distance: val.distance + 1
            }
        })
    }

    return possiblePositionsWithDistance
}

const isJunction = (position: Position, map: string[]) => {
    return map[position.y].charAt(position.x) === "." &&
        getNeighbourPositions(position, map)
            .filter(pos => isInMap(pos, map))
            .filter(pos => map[pos.y].charAt(pos.x) !== "#").length > 2
}

const getNeighbourPositions = (position: Position, map: string[]) => {
    const east = {
        x: position.x + 1,
        y: position.y
    }

    const west = {
        x: position.x - 1,
        y: position.y
    }

    const north = {
        x: position.x,
        y: position.y - 1
    }

    const south = {
        x: position.x,
        y: position.y + 1
    }

    return [east, west, north, south]
        .filter(pos => isInMap(pos, map))
}

const buildDistanceMap = (position: Position, distanceMap: Map<string, PositionWithDistance[]>, map: string[], endPosition: Position, slipperySlopes: boolean) => {
    const directions: Position[] = getNeighbourPositions(position, map)
    const positionString = position.x + "," + position.y

    if (!distanceMap.has(positionString)) {
        distanceMap.set(positionString, [])
    }

    directions.forEach(direction => {
        const possiblePositions = getPossiblePositions(direction, position, endPosition, map, slipperySlopes)

        possiblePositions.forEach(pos => {
            if (distanceMap.get(positionString)
                    .every(added => added.position.x !== pos.position.x || added.position.y !== pos.position.y)
                && (pos.position.x !== position.x || pos.position.y !== position.y)) {
                distanceMap.get(positionString).push(pos)
            }
        })
    })
}

const findLongestWayToEnd = (position: Position, endPosition: Position, map: string[], distanceMap: Map<string, PositionWithDistance[]>, visited: Position[]): number => {
    const currentPosition = distanceMap.get(position.x + "," + position.y)

    if (position.x === endPosition.x && position.y === endPosition.y) {
        return 0
    }

    if (currentPosition === undefined || currentPosition.filter(pos => visited.every(visitedPos => visitedPos.x !== pos.position.x || visitedPos.y !== pos.position.y)).length === 0) {
        return -1000
    }

    visited.push(position)

    const result = currentPosition
        .filter(pos => visited.every(visitedPos => visitedPos.x !== pos.position.x || visitedPos.y !== pos.position.y))
        .map(pos => {
            const res = pos.distance + findLongestWayToEnd(pos.position, endPosition, map, distanceMap, [...visited])
            return res
        })
    return result.sort((a, b) => b - a)[0]
}

const goA = (input: string) => {
    const lines = splitToLines(input)
    const endPoint = {
        x: lines[lines.length - 1].indexOf("."),
        y: lines.length - 1
    }

    const startPoint = {
        x: lines[0].indexOf("."),
        y: 0
    }

    const distanceMap = new Map<string, PositionWithDistance[]>()


    buildDistanceMap(startPoint, distanceMap, lines, endPoint, true)
    for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
            if (isJunction({x, y}, lines)) {
                buildDistanceMap({x, y}, distanceMap, lines, endPoint, true)
            }
        }
    }

    return findLongestWayToEnd(startPoint, endPoint, lines, distanceMap, [startPoint]) + 1
}

const goB = (input: string) => {
    const lines = splitToLines(input)
    const endPoint = {
        x: lines[lines.length - 1].indexOf("."),
        y: lines.length - 1
    }

    const startPoint = {
        x: lines[0].indexOf("."),
        y: 0
    }

    const distanceMap = new Map<string, PositionWithDistance[]>()

    buildDistanceMap(startPoint, distanceMap, lines, endPoint, false)
    for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
            if (isJunction({x, y}, lines)) {
                buildDistanceMap({x, y}, distanceMap, lines, endPoint, false)
            }
        }
    }

    return findLongestWayToEnd(startPoint, endPoint, lines, distanceMap, [startPoint]) + 1
}

/* Tests */

test(goA(readTestFile()), 94)
test(goB(readTestFile()), 154)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
