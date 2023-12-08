import { readInput, test } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Point {
  identifier: string,
  left: string,
  right: string
}

const parsePoint = (line: string): Point => {
  const splitIdentifierInstructions = line.split(" = ")
  const splitInstructions = splitIdentifierInstructions[1].split(", ")

  return {
    identifier: splitIdentifierInstructions[0],
    left: splitInstructions[0].substring(1),
    right: splitInstructions[1].substring(0, splitInstructions[1].length - 1)
  }
}

const goA = (input: string) => {
  const lines = splitToAllLines(input)

  const leftRightInstructions = lines[0].split("")
  const points = lines.slice(2).map(parsePoint)

  let currentPoint = points.find(point => point.identifier === "AAA")
  let currentInstruction = 0
  let steps = 0

  while(currentPoint.identifier !== "ZZZ") {
    currentPoint = leftRightInstructions[currentInstruction] === "L" ? points.find(point => point.identifier === currentPoint.left) : points.find(point => point.identifier === currentPoint.right)
    currentInstruction++
    steps++

    if(currentInstruction === leftRightInstructions.length) {
      currentInstruction = 0
    }
  }

  return steps
}

const findFirstRepentance = (instructions: string[], point: Point, pointMap: Map<string, Point>): number => {
  let lastSteps = 0
  let currentPoint = point

  let currentInstruction = 0
  let steps = 0

  while(true) {
    currentPoint = instructions[currentInstruction] === "L" ? pointMap.get(currentPoint.left) : pointMap.get(currentPoint.right)
    currentInstruction++
    steps++

    if(currentPoint.identifier.endsWith("Z")) {
        if(lastSteps !== 0) {
          if(steps - lastSteps === lastSteps) {
            return lastSteps
          } else {
            throw new Error("Should not happen")
          }
        } else {
          lastSteps = steps
        }
      }

    if(currentInstruction === instructions.length) {
      currentInstruction = 0
    }
  }
}

const goB = (input: string) => {
  const lines = splitToAllLines(input)

  const leftRightInstructions = lines[0].split("")
  const points = lines.slice(2).map(parsePoint)
  const pointMap = new Map<string, Point>
  points.forEach(point => {
    pointMap.set(point.identifier, point)
  })


  let currentPoints = points.filter(point => point.identifier.endsWith("A"))

  const stepsPerPoint = currentPoints.map(point => findFirstRepentance(leftRightInstructions, point, pointMap))

  // Find smallest common multiple for stepsPerPoint
  return 0
}

/* Tests */

test(goA(readTestFile()), 2)
// test(goB(readInputFromSpecialFile("testInput2.txt")), 6)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
