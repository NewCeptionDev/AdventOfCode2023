import { readInput, test } from "../utils/index"
import {readTestFile, splitToLines} from "../utils/readInput";

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Vector {
    x: number,
    y: number,
    z: number
}

interface Line {
    position: Vector,
    velocity: Vector
}

const parseVector = (line: string): Vector => {
    const split = line.split(", ").map(val => parseInt(val, 10))
    return {
        x: split[0],
        y: split[1],
        z: split[2]
    }
}

const parseLine = (line: string): Line => {
    const split = line.split(" @ ").map(parseVector)
    return {
        position: split[0],
        velocity: split[1]
    }
}

// Expects Point to be on the line
const pointReachable = (p: Vector, line: Line): boolean => {
    return (p.x > line.position.x && line.velocity.x > 0)
        || (p.x < line.position.x && line.velocity.x < 0)
}

const intersect = (l1: Line, l2: Line, first: string, second: string): Vector => {
    const l1p2 = getPointAfterTime(l1, 1)
    const l2p2 = getPointAfterTime(l2, 1)

    const denominator = ((l2p2[second] - l2.position[second]) * (l1p2[first] - l1.position[first]) - (l2p2[first] - l2.position[first]) * (l1p2[second] - l1.position[second]))

    // Lines are parallel
    if (denominator === 0) {
        return undefined
    }

    let ua = ((l2p2[first] - l2.position[first]) * (l1.position[second] - l2.position[second]) - (l2p2[second] - l2.position[second]) * (l1.position[first] - l2.position[first])) / denominator

    let x = l1.position[first] + ua * (l1p2[first] - l1.position[first])
    let y = l1.position[second] + ua * (l1p2[second] - l1.position[second])

    const resultPoint = {
        x,
        y,
        z: 0
    }

    if(!pointReachable(resultPoint, l1) || !pointReachable(resultPoint, l2)) {
        return undefined
    }

    return resultPoint
}

const getPointAfterTime = (point: Line, t: number): Vector => {
    return {
        x: +(point.position.x + (point.velocity.x * t)).toFixed(2),
        y: +(point.position.y + (point.velocity.y * t)).toFixed(2),
        z: +(point.position.z + (point.velocity.z * t)).toFixed(2)
    }
}

const willCollide = (l1: Line, l2: Line): boolean => {
    let time

    if(l1.velocity.x !== l2.velocity.x) {
        time = (l2.position.x - l1.position.x) / (l1.velocity.x - l2.velocity.x)
    } else if(l1.velocity.y !== l2.velocity.y) {
        time = (l2.position.y - l1.position.y) / (l1.velocity.y - l2.velocity.y)
    } else if(l1.velocity.z !== l2.velocity.z) {
        time = (l2.position.z - l1.position.z) / (l1.velocity.z - l2.velocity.z)
    } else {
        return undefined
    }

    if(time < 0) {
        return false
    }
    const l1AfterTime = getPointAfterTime(l1, time)
    const l2AfterTime = getPointAfterTime(l2, time)

    return l1AfterTime.x === l2AfterTime.x
        && l1AfterTime.y === l2AfterTime.y
        && l1AfterTime.z === l2AfterTime.z
}

const getImpossibleToReach = (p1: number, v1: number, p2: number, v2: number): number[] => {
    const impossibleRange = []
    if(p1 > p2 && v1 > v2) {
        for(let i = v2; i <= v1; i++) {
            impossibleRange.push(i)
        }
    }
    if(p2 > p1 && v2 > v1) {
        for(let i = v1; i <= v2; i++) {
            impossibleRange.push(i)
        }
    }

    return impossibleRange
}

const getPossibleRockVelocities = (amplitude: number, points: Line[]): Vector[] => {
    const velocityRange = []
    for(let i = -1 * amplitude; i <= amplitude; i++) {
        velocityRange.push(i)
    }

    const invalidXRanges = []
    const invalidYRanges = []
    const invalidZRanges = []

    for(let i = 0; i < points.length; i++) {
        for(let j = i + 1; j < points.length; j++) {
            const impossibleX = getImpossibleToReach(points[i].position.x, points[i].velocity.x, points[j].position.x, points[j].velocity.x)
            const impossibleY = getImpossibleToReach(points[i].position.y, points[i].velocity.y, points[j].position.y, points[j].velocity.y)
            const impossibleZ = getImpossibleToReach(points[i].position.z, points[i].velocity.z, points[j].position.z, points[j].velocity.z)

            impossibleX.forEach(impossible => {
                if(!invalidXRanges.includes(impossible)) {
                    invalidXRanges.push(impossible)
                }
            })
            impossibleY.forEach(impossible => {
                if(!invalidYRanges.includes(impossible)) {
                    invalidYRanges.push(impossible)
                }
            })
            impossibleZ.forEach(impossible => {
                if(!invalidZRanges.includes(impossible)) {
                    invalidZRanges.push(impossible)
                }
            })
        }
    }

    const possibleX = velocityRange.filter(val => !invalidXRanges.includes(val))
    const possibleY = velocityRange.filter(val => !invalidYRanges.includes(val))
    const possibleZ = velocityRange.filter(val => !invalidZRanges.includes(val))

    const vectors = []

    possibleX.forEach(vx => {
        possibleY.forEach(vy => {
            possibleZ.forEach(vz => {
                vectors.push({
                    x: vx,
                    y: vy,
                    z: vz
                })
            })
        })
    })

    return vectors
}

const findThrowingLocation = (l1: Line, l2: Line, velocity: Vector): Vector | undefined =>  {
    const l1RockVelocityX = l1.velocity.x - velocity.x
    const l1RockVelocityY = l1.velocity.y - velocity.y
    const l2RockVelocityX = l2.velocity.x - velocity.x
    const l2RockVelocityY = l2.velocity.y - velocity.y

    const slopeDiff = l1RockVelocityX * l2RockVelocityY - l1RockVelocityY * l2RockVelocityX

    if(slopeDiff === 0) {
        return undefined
    }

    const time = (l2RockVelocityY * (l2.position.x - l1.position.x) - l2RockVelocityX * (l2.position.y - l1.position.y)) / slopeDiff

    if(time < 0) {
        return undefined
    }

    return {
        x: +(l1.position.x + (l1.velocity.x - velocity.x) * time).toFixed(2),
        y: +(l1.position.y + (l1.velocity.y - velocity.y) * time).toFixed(2),
        z: +(l1.position.z + (l1.velocity.z - velocity.z) * time).toFixed(2)
    }
}

const goA = (input: string, testAreaStart: number, testAreaEnd: number) => {
    const points = splitToLines(input).map(parseLine)

    let intersectionsInRange = 0
    for(let i = 0; i < points.length; i++) {
        for(let j = i + 1; j < points.length; j++) {
            const intersectionPoint = intersect(points[i], points[j], "x", "y")

            if(intersectionPoint
                && intersectionPoint.x > testAreaStart && intersectionPoint.x < testAreaEnd
                && intersectionPoint.y > testAreaStart && intersectionPoint.y < testAreaEnd) {
                intersectionsInRange++
            }
        }
    }

    return intersectionsInRange
}

// Part 2 thanks to https://www.reddit.com/r/adventofcode/comments/18pnycy/comment/kev261u/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
const goB = (input: string) => {
    const points = splitToLines(input).map(parseLine)

    // Adjust amplitude for test input
    const amplitude = points.length < 10 ? 5 : 250

    const possibleRockVelocities = getPossibleRockVelocities(amplitude, points)
    let result = undefined

    for(let i = 0; i < possibleRockVelocities.length && !result; i++) {
        const throwingLocation = findThrowingLocation(points[0], points[1], possibleRockVelocities[i])

        if(throwingLocation) {
            const rock: Line = {
                position: throwingLocation,
                velocity: possibleRockVelocities[i]
            }

            if(points.every(point => willCollide(point, rock))) {
                result = throwingLocation.x + throwingLocation.y + throwingLocation.z
            }
        }
    }

    return result
}

/* Tests */

test(goA(readTestFile(), 7, 27), 2)
test(goB(readTestFile()), 47)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput, 200000000000000, 400000000000000)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
