import { readInput, test } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const goA = (input: string) => {}

const goB = (input: string) => {}

/* Tests */

// test()

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
