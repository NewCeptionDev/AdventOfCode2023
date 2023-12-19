import { readInput, test } from "../utils/index"
import { readTestFile, splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Part {
  x: number,
  m: number,
  a: number,
  s: number
}

interface Workflow {
  label: string,
  rules: Rule[]
}

type Rule = (part: Part) => string

const parseRule = (rulePart: string): Rule => {
  const split = rulePart.split(":")

  if(split.length > 1) {
    const element = split[0].charAt(0)
    const direction = split[0].charAt(1)
    const compareElement = parseInt(split[0].slice(2), 10)

    switch (element) {
      case "x":
        if(direction === ">") {
          return (part: Part) => part.x > compareElement ? split[1] : ""
        }
        return (part: Part) => part.x < compareElement ? split[1] : ""
      case "m":
        if(direction === ">") {
          return (part: Part) => part.m > compareElement ? split[1] : ""
        }
        return (part: Part) => part.m < compareElement ? split[1] : ""
      case "a":
        if(direction === ">") {
          return (part: Part) => part.a > compareElement ? split[1] : ""
        }
        return (part: Part) => part.a < compareElement ? split[1] : ""
      case "s":
        if(direction === ">") {
          return (part: Part) => part.s > compareElement ? split[1] : ""
        }
        return (part: Part) => part.s < compareElement ? split[1] : ""
      default:
        throw new Error("unknown element or direction")
    }
  } else {
    return () => split[0]
  }
}

const parseWorkflow = (line: string): Workflow => {
  const split = line.split("{")
  const rules = split[1].slice(0, split[1].length - 1).split(",").map(parseRule)

  return {
    label: split[0],
    rules
  }
}

const parsePart = (line: string): Part => {
  const elements = line.slice(1, line.length - 1).split(",")
  let x = undefined
  let m = undefined
  let a = undefined
  let s = undefined

  elements.forEach(element => {
    const elementParts = element.split("=")
    const amount = parseInt(elementParts[1], 10)
    switch (elementParts[0]) {
      case "x":
        x = amount
        break
      case "m":
        m = amount
        break
      case "a":
        a = amount
        break
      case "s":
        s = amount
        break
      default:
        throw new Error("unknown element label")
    }
  })

  if(x === undefined || m === undefined || a === undefined || s === undefined) {
    throw new Error("not all element parts provided")
  }

  return {
    x,
    m,
    a,
    s
  }
}

const goA = (input: string) => {
  const lines = splitToAllLines(input)
  const workflows = new Map<string, Workflow>()
  const parts: Part[] = []
  let parsingWorkflows = true

  lines.forEach(line => {
    if(line.length === 0) {
      parsingWorkflows = false
    } else if(parsingWorkflows) {
      const newWorkflow = parseWorkflow(line)
      workflows.set(newWorkflow.label, newWorkflow)
    } else {
      parts.push(parsePart(line))
    }
  })

  let accepted = 0
  parts.forEach(part => {
    let currentWorkflow = workflows.get("in")
    let done = false

    while(!done) {
      let nextLabel = ""
      for (let i = 0; i < currentWorkflow.rules.length && nextLabel.length === 0; i++) {
        nextLabel = currentWorkflow.rules[i](part)
      }

      if (nextLabel === "A") {
        accepted += part.x + part.m + part.a + part.s
        done = true
      } else if (nextLabel === "R") {
        done = true
      } else {
        currentWorkflow = workflows.get(nextLabel)
      }
    }
  })

  return accepted
}

const goB = (input: string) => {}

/* Tests */

test(goA(readTestFile()), 19114)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
