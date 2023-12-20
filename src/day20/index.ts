import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum ModuleType {
  BROADCASTER,
  FLIP_FLOP,
  CONJUNCTION
}

interface Module {
  type: ModuleType,
  label: string,
  destinations: string[],
  currentlyOnState?: boolean
  mapOfLastHighPulses?: Map<string, boolean>
}

interface WorkOrder {
  receivingModule: string,
  highPulse: boolean,
  sendingModule: string
}

const parseModule = (line: string): Module => {
  const split = line.split(" -> ")

  if(split[0] === "broadcaster") {
    return {
      type: ModuleType.BROADCASTER,
      label: split[0],
      destinations: split[1].split(", ")
    }
  } else {
    const moduleType = split[0].charAt(0) === "%" ? ModuleType.FLIP_FLOP : ModuleType.CONJUNCTION
    return {
      type: moduleType,
      label: split[0].slice(1),
      destinations: split[1].split(", "),
      currentlyOnState: moduleType === ModuleType.FLIP_FLOP ? false : undefined,
      mapOfLastHighPulses: moduleType === ModuleType.CONJUNCTION ? new Map<string, boolean>() : undefined
    }
  }
}

const updateModule = (module: Module, highPulse: boolean, sendingModule: string): boolean => {
  switch (module.type) {
    case ModuleType.BROADCASTER:
      return highPulse
    case ModuleType.FLIP_FLOP:
      if(!highPulse) {
        if (module.currentlyOnState) {
          module.currentlyOnState = false
          return false
        } else {
          module.currentlyOnState = true
          return true
        }
      }
      return undefined
    case ModuleType.CONJUNCTION:
      module.mapOfLastHighPulses.set(sendingModule, highPulse)
      return !Array.from(module.mapOfLastHighPulses.values()).every(elem => elem === true);
  }
}

const goA = (input: string) => {
  const lines = splitToLines(input)
  const modules = new Map<string, Module>
  lines.forEach(line => {
    const createdModule = parseModule(line)
    modules.set(createdModule.label, createdModule)
  })

  Array.from(modules.values()).forEach(module => {
    module.destinations.forEach(destination => {
      if(modules.get(destination) && modules.get(destination).type === ModuleType.CONJUNCTION) {
        modules.get(destination).mapOfLastHighPulses.set(module.label, false)
      }
    })
  })

  let lowPulsesSent = 0
  let highPulsesSent = 0
  for(let i = 0; i < 1000; i++) {
    let workOrders: WorkOrder[] = [{
      sendingModule: "button",
      receivingModule: "broadcaster",
      highPulse: false
    }]
    lowPulsesSent++

    while (workOrders.length > 0) {
      let newWorkOrders: WorkOrder[] = []
      const currentWorkOrder = workOrders.shift()
      const module = modules.get(currentWorkOrder.receivingModule)
      if(module !== undefined) {
        const result = updateModule(module, currentWorkOrder.highPulse, currentWorkOrder.sendingModule)

        if(result !== undefined) {
          if (result === false) {
            lowPulsesSent += module.destinations.length
          } else {
            highPulsesSent += module.destinations.length
          }

          module.destinations.forEach(destination => {
            newWorkOrders.push({
              receivingModule: destination,
              highPulse: result,
              sendingModule: module.label
            })
          })
          workOrders.push(...newWorkOrders)
        }
      }
    }
  }

  return lowPulsesSent * highPulsesSent
}

const goB = (input: string) => {
  const lines = splitToLines(input)
  const modules = new Map<string, Module>
  lines.forEach(line => {
    const createdModule = parseModule(line)
    modules.set(createdModule.label, createdModule)
  })

  Array.from(modules.values()).forEach(module => {
    module.destinations.forEach(destination => {
      if(modules.get(destination) && modules.get(destination).type === ModuleType.CONJUNCTION) {
        modules.get(destination).mapOfLastHighPulses.set(module.label, false)
      }
    })
  })

  let buttonPresses = 0
  let rxReceivedPulse = false
  while(!rxReceivedPulse) {
    buttonPresses++
    let workOrders: WorkOrder[] = [{
      sendingModule: "button",
      receivingModule: "broadcaster",
      highPulse: false
    }]

    while (workOrders.length > 0 && !rxReceivedPulse) {
      let newWorkOrders: WorkOrder[] = []
      const currentWorkOrder = workOrders.shift()
      const module = modules.get(currentWorkOrder.receivingModule)

      if(currentWorkOrder.receivingModule === "rx" && !currentWorkOrder.highPulse) {
        rxReceivedPulse = true
      }

      if(module !== undefined) {
        const result = updateModule(module, currentWorkOrder.highPulse, currentWorkOrder.sendingModule)

        if(result !== undefined) {
          module.destinations.forEach(destination => {
            newWorkOrders.push({
              receivingModule: destination,
              highPulse: result,
              sendingModule: module.label
            })
          })
          workOrders.push(...newWorkOrders)
        }
      }
    }
  }

  return buttonPresses
}

/* Tests */

test(goA(readTestFile()), 32000000)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
