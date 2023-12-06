import {readInput, test} from "../utils/index"
import {readTestFile, splitToAllLines} from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface RangeMap {
    sourceStart: number
    destinationStart: number
    range: number
}

interface Almanac {
    seeds: number[]
    seedToSoilMap: RangeMap[]
    soilToFertilizer: RangeMap[]
    fertilizerToWater: RangeMap[]
    waterToLight: RangeMap[]
    lightToTemperature: RangeMap[]
    temperatureToHumidity: RangeMap[]
    humidityToLocation: RangeMap[]
}

interface Range {
    start: number,
    end: number
}

const parseToRangeMap = (line: string): RangeMap => {
    const split = line.split(" ").map((val) => parseInt(val, 10))

    return {
        sourceStart: split[1],
        destinationStart: split[0],
        range: split[2],
    }
}

const parseMap = (lines: string[]): RangeMap[] => lines.map(parseToRangeMap)

const parseAlmanac = (lines: string[]): Almanac => {
    const seeds = lines[0]
        .split(": ")[1]
        .split(" ")
        .map((val) => parseInt(val, 10))
    const mappings: RangeMap[][] = []

    let nextMapStart = 3
    for (let i = nextMapStart; i < lines.length; i++) {
        if (lines[i].length === 0) {
            const newMap = parseMap(lines.slice(nextMapStart, i))
            nextMapStart = i + 2

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
        humidityToLocation: mappings[6],
    }
}

const translateToDestination = (sourceNumber: number, map: RangeMap): number => {
    if (map.sourceStart <= sourceNumber && map.sourceStart + map.range > sourceNumber) {
        const offsetFromStart = sourceNumber - map.sourceStart
        return map.destinationStart + offsetFromStart
    }

    return sourceNumber
}

const translateToCorrectDestination = (sourceNumber: number, maps: RangeMap[]): number => {
    const results = maps
        .map((rangeMap) => translateToDestination(sourceNumber, rangeMap))
        .filter((result) => result != sourceNumber)

    if (results.length > 1) {
        throw new Error("too many results")
    }

    return results.length === 1 ? results[0] : sourceNumber
}

const translateAgainstSingleMapWithRanges = (range: Range, map: RangeMap): { changed: Range[], unchanged: Range[] } => {
    if (range.end < map.sourceStart || range.start > map.sourceStart + map.range) {
        return {
            unchanged: [range],
            changed: []
        }
    }

    if (range.start >= map.sourceStart && range.end <= (map.sourceStart + map.range)) {
        const startOffset = range.start - map.sourceStart

        return {
            changed: [{
                start: map.destinationStart + startOffset,
                end: map.destinationStart + startOffset + range.end - range.start
            }],
            unchanged: []
        }
    }

    if (range.start < map.sourceStart && range.end > map.sourceStart) {
        return {
            unchanged: [{
                start: range.start,
                end: map.sourceStart - 1
            }],
            changed: [{
                start: map.destinationStart,
                end: map.destinationStart + range.end - map.sourceStart
            }]
        }
    }

    if (range.start > map.sourceStart && range.end > map.sourceStart + map.range) {
        return {
            changed: [{
                start: map.destinationStart + (range.start - map.sourceStart),
                end: map.destinationStart + map.range
            }],
            unchanged: [{
                start: map.sourceStart + map.range + 1,
                end: range.end
            }]
        }
    }

    return {
        unchanged: [{
            start: range.start,
            end: map.sourceStart - 1
        }, {
            start: map.sourceStart + map.range + 1,
            end: range.end
        }],
        changed: [{
            start: map.destinationStart,
            end: map.destinationStart + map.range
        }]
    }
}

const translateWithRanges = (ranges: Range[], maps: RangeMap[]): Range[] => {
    let updatedRanges = ranges
    const finalRanges = []

    maps.forEach(map => {
        const newRanges = []
        updatedRanges.forEach((range: Range) => {
            const result = translateAgainstSingleMapWithRanges(range, map)
            newRanges.push(...result.unchanged)
            finalRanges.push(...result.changed)
        })
        updatedRanges = newRanges
    })

    return [...updatedRanges, ...finalRanges]
}

const goA = (input: string) => {
    const lines = splitToAllLines(input)
    const almanac = parseAlmanac(lines)

    const soil = almanac.seeds.map((seed) =>
        translateToCorrectDestination(seed, almanac.seedToSoilMap)
    )
    const fertilizer = soil.map((seed) =>
        translateToCorrectDestination(seed, almanac.soilToFertilizer)
    )
    const water = fertilizer.map((seed) =>
        translateToCorrectDestination(seed, almanac.fertilizerToWater)
    )
    const light = water.map((seed) => translateToCorrectDestination(seed, almanac.waterToLight))
    const temperature = light.map((seed) =>
        translateToCorrectDestination(seed, almanac.lightToTemperature)
    )
    const humidity = temperature.map((seed) =>
        translateToCorrectDestination(seed, almanac.temperatureToHumidity)
    )
    const location = humidity.map((seed) =>
        translateToCorrectDestination(seed, almanac.humidityToLocation)
    )

    return location.sort((a, b) => a - b)[0]
}

const goB = (input: string) => {
    const lines = splitToAllLines(input)
    const almanac = parseAlmanac(lines)
    let lowestLocation = Number.MAX_VALUE

  for (let i = 0; i < almanac.seeds.length; i += 2) {
    const range = {
      start: almanac.seeds[i],
      end: almanac.seeds[i] + almanac.seeds[i + 1]
    }

        const soil = translateWithRanges([range], almanac.seedToSoilMap)
        const fertilizer = translateWithRanges(soil, almanac.soilToFertilizer)
        const water = translateWithRanges(fertilizer, almanac.fertilizerToWater)
        const light = translateWithRanges(water, almanac.waterToLight)
        const temperature = translateWithRanges(light, almanac.lightToTemperature)
        const humidity = translateWithRanges(temperature, almanac.temperatureToHumidity)
        const location = translateWithRanges(humidity, almanac.humidityToLocation)

        const lowest = location.sort((a, b) => a.start - b.start)[0]

        if (lowest.start < lowestLocation) {
            lowestLocation = lowest.start
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
