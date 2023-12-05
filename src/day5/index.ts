import { readInput, test } from "../utils/index"
import { readTestFile, splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface RangeMap {
  sourceStart: number,
  destinationStart: number,
  range: number
}

interface Almanac {
  seeds: number[],
  seedToSoilMap: RangeMap[],
  soilToFertilizer: RangeMap[],
  fertilizerToWater: RangeMap[],
  waterToLight: RangeMap[],
  lightToTemperature: RangeMap[],
  temperatureToHumidity: RangeMap[],
  humidityToLocation: RangeMap[],
}

const parseToRangeMap = (line: string): RangeMap => {
  const split = line.split(" ").map(val => parseInt(val, 10))

  return {
    sourceStart: split[1],
    destinationStart: split[0],
    range: split[2]
  }
}

const parseMap = (lines: string[]): RangeMap[] => {
  return lines.map(parseToRangeMap)
}

const parseAlmanac = (lines: string[]): Almanac => {
  let seeds = lines[0].split(": ")[1].split(" ").map(val => parseInt(val, 10))
  const mappings: RangeMap[][] = []

  let nextMapStart = 3
  for(let i = nextMapStart; i < lines.length; i++) {
    if(lines[i].length === 0) {
      const newMap = parseMap(lines.slice(nextMapStart, i))
      nextMapStart = i + 2;

      mappings.push(newMap)
    }
  }

  mappings.push(parseMap(lines.slice(nextMapStart, lines.length)))

  return {
    seeds,
    seedToSoilMap: mappings[0],
    soilToFertilizer: mappings[1],
    fertilizerToWater: mappings[2],
    waterToLight: mappings[3],
    lightToTemperature: mappings[4],
    temperatureToHumidity: mappings[5],
    humidityToLocation: mappings[6]
  }
}

const translateToDestination = (sourceNumber: number, map: RangeMap): number => {
  if(map.sourceStart <= sourceNumber && map.sourceStart + map.range > sourceNumber) {
    const offsetFromStart = sourceNumber - map.sourceStart
    return map.destinationStart + offsetFromStart
  }

  return sourceNumber
}

const translateToCorrectDestination = (sourceNumber: number, maps: RangeMap[]): number => {
  const results = maps.map(rangeMap => translateToDestination(sourceNumber, rangeMap)).filter(result => result != sourceNumber)

  if(results.length > 1) {
    throw new Error("too many results")
  }

  return results.length === 1 ? results[0] : sourceNumber
}

const goA = (input: string) => {
  const lines = splitToAllLines(input)
  const almanac = parseAlmanac(lines)

  const soil = almanac.seeds.map(seed => translateToCorrectDestination(seed, almanac.seedToSoilMap))
  const fertilizer = soil.map(seed => translateToCorrectDestination(seed, almanac.soilToFertilizer))
  const water = fertilizer.map(seed => translateToCorrectDestination(seed, almanac.fertilizerToWater))
  const light = water.map(seed => translateToCorrectDestination(seed, almanac.waterToLight))
  const temperature = light.map(seed => translateToCorrectDestination(seed, almanac.lightToTemperature))
  const humidity = temperature.map(seed => translateToCorrectDestination(seed, almanac.temperatureToHumidity))
  const location = humidity.map(seed => translateToCorrectDestination(seed, almanac.humidityToLocation))

  return location.sort((a, b) => a - b)[0]
}

const translateSeedsByRange = (startPosition: number, range: number): number[] => {
  const result = []

  for(let i = startPosition; i < startPosition + range; i++) {
      result.push(i)
  }

  return result
}

const goB = (input: string) => {
  const lines = splitToAllLines(input)
  const almanac = parseAlmanac(lines)

  let lowestLocation = Number.MAX_VALUE
  const cache = new Map<number, number>

  for(let i = 0; i < almanac.seeds.length; i+=2) {
    const translatedSeeds = translateSeedsByRange(almanac.seeds[i], almanac.seeds[i + 1])

    const soil = translatedSeeds.map(seed => translateToCorrectDestination(seed, almanac.seedToSoilMap))
    const fertilizer = soil.map(seed => translateToCorrectDestination(seed, almanac.soilToFertilizer))
    const water = fertilizer.map(seed => translateToCorrectDestination(seed, almanac.fertilizerToWater))
    const light = water.map(seed => translateToCorrectDestination(seed, almanac.waterToLight))
    const temperature = light.map(seed => translateToCorrectDestination(seed, almanac.lightToTemperature))
    const humidity = temperature.map(seed => translateToCorrectDestination(seed, almanac.temperatureToHumidity))
    const location = humidity.map(seed => translateToCorrectDestination(seed, almanac.humidityToLocation))

    const lowest = location.sort((a, b) => a - b)[0]

    if(lowest < lowestLocation) {
      lowestLocation = lowest
    }
  }

  return lowestLocation
}

/* Tests */

test(goA(readTestFile()), 35)
test(goB(readTestFile()), 46)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
