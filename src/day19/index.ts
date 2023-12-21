import { readInput, test } from "../utils/index"
import { readTestFile, splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Part {
  x: number
  m: number
  a: number
  s: number
}

interface SimpleWorkflow {
  label: string
  rules: string[]
}

interface Workflow {
  label: string
  rules: Rule[]
}

interface NumberRange {
  start: number
  end: number
}

type Rule = (part: Part) => string

const parseRule = (rulePart: string): Rule => {
  const split = rulePart.split(":")

  if (split.length > 1) {
    const element = split[0].charAt(0)
    const direction = split[0].charAt(1)
    const compareElement = parseInt(split[0].slice(2), 10)

    switch (element) {
      case "x":
        if (direction === ">") {
          return (part: Part) => (part.x > compareElement ? split[1] : "")
        }
        return (part: Part) => (part.x < compareElement ? split[1] : "")
      case "m":
        if (direction === ">") {
          return (part: Part) => (part.m > compareElement ? split[1] : "")
        }
        return (part: Part) => (part.m < compareElement ? split[1] : "")
      case "a":
        if (direction === ">") {
          return (part: Part) => (part.a > compareElement ? split[1] : "")
        }
        return (part: Part) => (part.a < compareElement ? split[1] : "")
      case "s":
        if (direction === ">") {
          return (part: Part) => (part.s > compareElement ? split[1] : "")
        }
        return (part: Part) => (part.s < compareElement ? split[1] : "")
      default:
        throw new Error("unknown element or direction")
    }
  } else {
    return () => split[0]
  }
}

const parseWorkflow = (line: string): Workflow => {
  const split = line.split("{")
  const rules = split[1]
    .slice(0, split[1].length - 1)
    .split(",")
    .map(parseRule)

  return {
    label: split[0],
    rules,
  }
}

const parseSimpleWorkflow = (line: string): SimpleWorkflow => {
  const split = line.split("{")
  const rules = split[1].slice(0, split[1].length - 1).split(",")

  return {
    label: split[0],
    rules,
  }
}

const parsePart = (line: string): Part => {
  const elements = line.slice(1, line.length - 1).split(",")
  let x
  let m
  let a
  let s

  elements.forEach((element) => {
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

  if (x === undefined || m === undefined || a === undefined || s === undefined) {
    throw new Error("not all element parts provided")
  }

  return {
    x,
    m,
    a,
    s,
  }
}

const getNewRanges = (
  ranges: NumberRange[],
  comparison: string,
  comparisonElement: number,
  index: number
): NumberRange[][] => {
  const accepted: NumberRange[] = []
  const rest: NumberRange[] = []

  ranges.forEach((range, rangeIndex) => {
    if (rangeIndex === index) {
      if (comparison === ">") {
        accepted.push({
          start: comparisonElement + 1,
          end: range.end,
        })
        rest.push({
          start: range.start,
          end: comparisonElement,
        })
      } else {
        accepted.push({
          start: range.start,
          end: comparisonElement - 1,
        })
        rest.push({
          start: comparisonElement,
          end: range.end,
        })
      }
    } else {
      accepted.push(range)
      rest.push(range)
    }
  })

  return [accepted, rest]
}

const findAccepted = (
  currentPart: string,
  ranges: NumberRange[],
  workflows: Map<string, SimpleWorkflow>
): NumberRange[][] => {
  if (currentPart === "A") {
    return [ranges]
  }
  if (currentPart === "R") {
    return []
  }
  let currentRange = ranges

  const accepted: NumberRange[][] = []
  const currentWorkflow = workflows.get(currentPart)

  currentWorkflow.rules.forEach((rule) => {
    const split = rule.split(":")

    if (split.length > 1) {
      const element = split[0].charAt(0)
      const direction = split[0].charAt(1)
      const compareElement = parseInt(split[0].slice(2), 10)

      let index

      switch (element) {
        case "x":
          index = 0
          break
        case "m":
          index = 1
          break
        case "a":
          index = 2
          break
        case "s":
          index = 3
          break
        default:
          throw new Error("Unknown element")
      }

      const newRanges = getNewRanges(currentRange, direction, compareElement, index)
      accepted.push(...findAccepted(split[1], newRanges[0], workflows))
      currentRange = newRanges[1]
    } else {
      accepted.push(...findAccepted(split[0], currentRange, workflows))
    }
  })

  return accepted
}

const goA = (input: string) => {
  const lines = splitToAllLines(input)
  const workflows = new Map<string, Workflow>()
  const parts: Part[] = []
  let parsingWorkflows = true

  lines.forEach((line) => {
    if (line.length === 0) {
      parsingWorkflows = false
    } else if (parsingWorkflows) {
      const newWorkflow = parseWorkflow(line)
      workflows.set(newWorkflow.label, newWorkflow)
    } else {
      parts.push(parsePart(line))
    }
  })

  let accepted = 0
  parts.forEach((part) => {
    let currentWorkflow = workflows.get("in")
    let done = false

    while (!done) {
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

const goB = (input: string) => {
  const lines = splitToAllLines(input)
  const workflows = new Map<string, SimpleWorkflow>()
  let parsingWorkflows = true

  lines.forEach((line) => {
    if (line.length === 0) {
      parsingWorkflows = false
    } else if (parsingWorkflows) {
      const newWorkflow = parseSimpleWorkflow(line)
      workflows.set(newWorkflow.label, newWorkflow)
    }
  })

  const ranges: NumberRange[] = [
    {
      start: 1,
      end: 4000,
    },
    {
      start: 1,
      end: 4000,
    },
    {
      start: 1,
      end: 4000,
    },
    {
      start: 1,
      end: 4000,
    },
  ]

  return findAccepted("in", ranges, workflows)
    .map((range) =>
      range
        .map((r) => r.end - r.start + 1)
        .reduce((previousValue, currentValue) => previousValue * currentValue, 1)
    )
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

/* Tests */

test(goA(readTestFile()), 19114)
test(goB(readTestFile()), 167409079868000)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
