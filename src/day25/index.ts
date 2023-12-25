import {readInput, test} from "../utils/index"
import {readTestFile, splitToLines} from "../utils/readInput";

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Component {
    label: string,
    connected: string[]
}

const parseComponent = (line: string): Component => {
    const split = line.split(": ")
    return {
        label: split[0],
        connected: split[1].split(" ")
    }
}

const getConnectedComponents = (currentComponent: string, componentMap: Map<string, string[]>, cutWires: string[], visited: string[]): string[] => {
    const connected = [currentComponent]

    const wires = componentMap.get(currentComponent)
        .filter(wire => !visited.includes(wire))
        .filter(wire => {
            return cutWires.map(cutWire => {
                const split = cutWire.split("/")
                return split.includes(wire) && split.includes(currentComponent)
            }).filter(val => val).length === 0
        })

    wires.forEach(wire => {
        if (!visited.includes(wire)) {
            visited.push(wire)
            connected.push(...getConnectedComponents(wire, componentMap, cutWires, visited))
        }
    })

    return connected
}

const findPath = (nodes: Map<string, string[]>, start: string, end: string): string[] => {
    // Dijkstra's algorithm
    let visited = []
    let queue = []
    let parents = new Map<string, string>()
    queue.push(start);
    while (queue.length > 0) {
        const node = queue.shift()
        if (!visited.includes(node)) {
            visited.push(node)
            if (node === end) {
                break
            }
            const neighbours = nodes.get(node)
            neighbours.forEach(neighbour => {
                if (!visited.includes(neighbour)) {
                    parents.set(neighbour, node)
                    queue.push(neighbour)
                }
            })
        }
    }

    const path = []
    let node = end

    while (node !== start) {
        path.push(node)
        if (parents.has(node)) {
            node = parents.get(node)
        } else {
            return undefined
        }
    }

    path.push(start)
    path.reverse()
    return path
}

const goA = (input: string) => {
    const initialComponents = splitToLines(input).map(parseComponent)
    const componentMap = new Map<string, string[]>()
    initialComponents.forEach(component => {
        if (!componentMap.has(component.label)) {
            componentMap.set(component.label, [])
        }

        component.connected.forEach(connected => {
            componentMap.get(component.label).push(connected)

            if (!componentMap.has(connected)) {
                componentMap.set(connected, [])
            }
            componentMap.get(connected).push(component.label)
        })
    })

    const keys = Array.from(componentMap.keys())
    let result = undefined

    for (let k = 1; k < keys.length && !result; k++) {
        let paths = []
        for (let i = 0; i < 3; i++) {
            const pathFindResult = findPath(componentMap, keys[0], keys[k])
            paths.push(pathFindResult)
            // Temporarily remove paths
            for (let j = 1; j < pathFindResult.length; j++) {
                componentMap.get(pathFindResult[j - 1]).splice(componentMap.get(pathFindResult[j - 1]).indexOf(pathFindResult[j]), 1)
                componentMap.get(pathFindResult[j]).splice(componentMap.get(pathFindResult[j]).indexOf(pathFindResult[j - 1]), 1)
            }
        }
        const nextPathFind = findPath(componentMap, keys[0], keys[k])

        if (nextPathFind === undefined) {
            const connected = getConnectedComponents(keys[k], componentMap, [], [keys[k]])
            result = connected.length * (Array.from(componentMap.keys()).length - connected.length)
        }

        // Re-add paths
        paths.forEach(path => {
            for (let j = 1; j < path.length; j++) {
                componentMap.get(path[j - 1]).push(path[j])
                componentMap.get(path[j]).push(path[j - 1])
            }
        })
    }
    return result
}

/* Tests */

test(goA(readTestFile()), 54)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
