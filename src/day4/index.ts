import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Card {
  id: number
  winningNumbers: number[]
  numbers: number[]
}

const parseCard = (line: string): Card => {
  const cardSplit = line.split(": ")
  const id = parseInt(cardSplit[0].split(" ").filter((val) => val.length > 0)[1], 10)

  const numbersSplit = cardSplit[1].split(" | ")
  const winningNumbers = numbersSplit[0]
    .split(" ")
    .filter((val) => val.length > 0)
    .map((val) => parseInt(val, 10))
  const numbers = numbersSplit[1]
    .split(" ")
    .filter((value) => value.length > 0)
    .map((val) => parseInt(val, 10))

  return {
    id,
    winningNumbers,
    numbers,
  }
}

const getCardScore = (card: Card): number => {
  const numbersInWinning = card.numbers.filter((num) => card.winningNumbers.includes(num)).length

  if (numbersInWinning > 0) {
    return 2 ** (numbersInWinning - 1)
  }

  return 0
}

const getMatchingNumbersCount = (card: Card): number =>
  card.numbers.filter((num) => card.winningNumbers.includes(num)).length

const goA = (input: string) => {
  const lines = splitToLines(input)

  return lines
    .map(parseCard)
    .map(getCardScore)
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const cards = lines.map(parseCard)
  const amountOfCards = new Map<number, number>()
  cards.forEach((card) => {
    amountOfCards.set(card.id, 1)
  })

  cards.forEach((card) => {
    const matchingNumbers = getMatchingNumbersCount(card)

    for (let i = card.id + 1; i <= card.id + matchingNumbers; i++) {
      amountOfCards.set(i, amountOfCards.get(i) + amountOfCards.get(card.id))
    }
  })

  return Array.from(amountOfCards.values()).reduce(
    (previousValue, currentValue) => previousValue + currentValue
  )
}

/* Tests */

test(goA(readTestFile()), 13)
test(goB(readTestFile()), 30)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
