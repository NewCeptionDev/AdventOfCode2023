import { readInput, test } from "../utils/index"
import {readTestFile, splitToLines} from "../utils/readInput";

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Element {
    label: string,
    lens: number
}

const calculateHash = (input: string): number => {
    let hash = 0
    for(let i = 0; i < input.length; i++) {
        const ascii = input.charCodeAt(i);
        hash += ascii
        hash *= 17
        hash = hash % 256
    }

    return hash
}


const parseElement = (line: string): Element => {
    if(line.includes("=")) {
        const split = line.split("=")
        return {
            label: split[0],
            lens: parseInt(split[1], 10)
        }
    } else {
        return {
            label: line.substring(0, line.length - 1),
            lens: null
        }
    }
}

const calculateFocusingPower = (hashMap: Map<number, Element[]>): number => {
    let focusingPower = 0

    Array.from(hashMap.keys()).forEach(key => {
        hashMap.get(key).forEach((element, index) => {
            focusingPower += (key + 1) * (index + 1) * element.lens
        })
    })

    return focusingPower
}

const goA = (input: string) => {
    const lines = splitToLines(input)
    return lines[0].split(",").map(calculateHash).reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
    const lines = splitToLines(input)

    const hashMap = new Map<number, Element[]>()

    const instructions = lines[0].split(",")

    instructions.forEach(instruction => {
        const element = parseElement(instruction)
        const hash = calculateHash(element.label)

        if(!hashMap.has(hash)) {
            hashMap.set(hash, [])
        }

        const currentBox = hashMap.get(hash)

        const labelInBox = currentBox.findIndex(elem => elem.label === element.label)

        if(labelInBox !== -1 && element.lens === null) {
            currentBox.splice(labelInBox, 1)
        } else if(labelInBox !== -1) {
            currentBox.splice(labelInBox, 1, element)
        } else if(element.lens !== null) {
            currentBox.push(element)
        }

        hashMap.set(hash, currentBox)
    })

    return calculateFocusingPower(hashMap)
}

/* Tests */

test(calculateHash("HASH"), 52)
test(goA(readTestFile()), 1320)
test(goB(readTestFile()), 145)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
