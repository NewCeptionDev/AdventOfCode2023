import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface RoundReveals {
  red: number
  green: number
  blue: number
}

interface Game {
  id: number
  rounds: RoundReveals[]
}

const parseRound = (part: string): RoundReveals => {
  const split = part.split(", ")
  let red = 0
  let blue = 0
  let green = 0

  split.forEach((splitPart) => {
    const numberAndColor = splitPart.split(" ")
    switch (numberAndColor[1]) {
      case "red":
        red = parseInt(numberAndColor[0], 10)
        break
      case "blue":
        blue = parseInt(numberAndColor[0], 10)
        break
      case "green":
        green = parseInt(numberAndColor[0], 10)
        break
      default:
        throw new Error("unexpected color")
    }
  })

  return {
    red,
    green,
    blue,
  }
}

const parseGame = (line: string): Game => {
  const gameAndRoundParts = line.split(": ")
  const gameId = parseInt(gameAndRoundParts[0].split(" ")[1], 10)

  const roundSplits = gameAndRoundParts[1].split("; ")

  return {
    id: gameId,
    rounds: roundSplits.map(parseRound),
  }
}

const calculatePower = (game: Game) => {
  let minimumRed = -1
  let minimumGreen = -1
  let minimumBlue = -1

  game.rounds.forEach((round) => {
    if (round.red > minimumRed) {
      minimumRed = round.red
    }

    if (round.green > minimumGreen) {
      minimumGreen = round.green
    }

    if (round.blue > minimumBlue) {
      minimumBlue = round.blue
    }
  })

  return minimumRed * minimumGreen * minimumBlue
}

const goA = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map(parseGame)
    .filter((game) =>
      game.rounds.every((round) => round.red <= 12 && round.green <= 13 && round.blue <= 14)
    )
    .map((game) => game.id)
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map(parseGame)
    .map(calculatePower)
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

/* Tests */

test(goA(readTestFile()), 8)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
