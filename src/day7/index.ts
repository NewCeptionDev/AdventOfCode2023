import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const enum HandType {
  FIVE_KIND,
  FOUR_KIND,
  FULL_HOUSE,
  THREE_KIND,
  TWO_PAIR,
  ONE_PAIR,
  HIGH_CARD,
}

const enum Card {
  A,
  K,
  Q,
  J,
  T,
  NINE,
  EIGHT,
  SEVEN,
  SIX,
  FIVE,
  FOUR,
  THREE,
  TWO,
}

interface Hand {
  bid: number
  cards: Card[]
  handType: HandType
}

const compareHands = (handOne: Hand, handTwo: Hand, partTwo: boolean): number => {
  if (handOne.handType < handTwo.handType) {
    return 1
  } else if (handOne.handType > handTwo.handType) {
    return -1
  }
  let cardCompareValue = 0
  for (let i = 0; i < 5 && cardCompareValue === 0; i++) {
    cardCompareValue = compareCards(handOne.cards[i], handTwo.cards[i], partTwo)
  }
  return cardCompareValue
}

const compareCards = (cardOne: Card, cardTwo: Card, partTwo: boolean): number => {
  if (cardOne === cardTwo) {
    return 0
  } else if (partTwo && cardOne === Card.J) {
    return -1
  } else if (partTwo && cardTwo === Card.J) {
    return 1
  } else if (cardOne < cardTwo) {
    return 1
  }
  return -1
}

const identifyCardType = (cards: Card[], partTwo: boolean): HandType => {
  const mapOfCards = new Map<Card, number>()

  cards.forEach((card) => {
    if (mapOfCards.has(card)) {
      mapOfCards.set(card, mapOfCards.get(card) + 1)
    } else {
      mapOfCards.set(card, 1)
    }
  })

  const countOfJokers = partTwo ? mapOfCards.get(Card.J) : 0

  if (mapOfCards.size === 1) {
    return HandType.FIVE_KIND
  } else if (mapOfCards.size === 2) {
    if (countOfJokers > 0) {
      return HandType.FIVE_KIND
    }
    if (Array.from(mapOfCards.values()).includes(4)) {
      return HandType.FOUR_KIND
    }
    return HandType.FULL_HOUSE
  }
  const values = Array.from(mapOfCards.values())
  const pairs = values.filter((val) => val === 2).length

  if (values.includes(3)) {
    if (countOfJokers > 0) {
      return HandType.FOUR_KIND
    }
    return HandType.THREE_KIND
  } else if (pairs === 2) {
    if (countOfJokers === 1) {
      return HandType.FULL_HOUSE
    }
    if (countOfJokers === 2) {
      return HandType.FOUR_KIND
    }
    return HandType.TWO_PAIR
  } else if (pairs === 1) {
    if (countOfJokers > 0) {
      return HandType.THREE_KIND
    }
    return HandType.ONE_PAIR
  }

  if (countOfJokers === 1) {
    return HandType.ONE_PAIR
  }

  return HandType.HIGH_CARD
}

const parseCard = (cardValue: string): Card => {
  switch (cardValue) {
    case "A":
      return Card.A
    case "K":
      return Card.K
    case "Q":
      return Card.Q
    case "J":
      return Card.J
    case "T":
      return Card.T
    case "9":
      return Card.NINE
    case "8":
      return Card.EIGHT
    case "7":
      return Card.SEVEN
    case "6":
      return Card.SIX
    case "5":
      return Card.FIVE
    case "4":
      return Card.FOUR
    case "3":
      return Card.THREE
    case "2":
      return Card.TWO
    default:
      throw new Error("Unknown Card Value provided")
  }
}

const parseHand = (line: string, partTwo: boolean): Hand => {
  const handAndBid = line.split(" ")
  const cards = handAndBid[0].split("").map(parseCard)

  return {
    bid: parseInt(handAndBid[1], 10),
    cards,
    handType: identifyCardType(cards, partTwo),
  }
}

const calculateWinnings = (hand: Hand, index: number) => hand.bid * (index + 1)

const calculateTotalWinnings = (hands: Hand[], partTwo: boolean) => {
  const sortedHands = hands.sort((a, b) => compareHands(a, b, partTwo))
  return sortedHands
    .map(calculateWinnings)
    .reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goA = (input: string) => {
  const lines = splitToLines(input)

  return calculateTotalWinnings(
    lines.map((hand) => parseHand(hand, false)),
    false
  )
}

const goB = (input: string) => {
  const lines = splitToLines(input)

  return calculateTotalWinnings(
    lines.map((hand) => parseHand(hand, true)),
    true
  )
}

/* Tests */

test(goA(readTestFile()), 6440)
test(goB(readTestFile()), 5905)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
