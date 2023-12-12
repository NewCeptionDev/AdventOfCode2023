import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Row {
  record: string,
  damaged: number[]
}

interface RowState {
  currentDamagedIndex: number,
  currentDamagedRecord: number,
  rowDamaged: number[]
}

const parseRow = (line: string): Row => {
  const split = line.split(" ")
  return {
    record: split[0],
    damaged: split[1].split(",").map(val => parseInt(val, 10))
  }
}

const getPossibleArrangements = (row: Row): number => {

  let generatedRows = [row]
  for(let i = 0; i < row.record.length; i++) {
    let adjustedGeneratedRows = []
    if(row.record[i] === "?") {
      generatedRows.forEach(generated => {
        adjustedGeneratedRows.push({
            record: generated.record.slice(0, i) + "." + generated.record.slice(i + 1),
            damaged: row.damaged
          },
          {
            record: generated.record.slice(0, i) + "#" + generated.record.slice(i + 1),
            damaged: row.damaged
          })
      })
      generatedRows = adjustedGeneratedRows
    }
  }
  //
  // console.log(row)
  // console.log(generatedRows)

  const valid = generatedRows.filter(isRowValid).length
  // console.log(valid)
  // console.log("...")
  return valid
}

const allowQuestionMarkAsFirst = (row: Row): boolean => {
  let isDamaged = false
  for(let i = row.record.length - 1; i >= 0; i--) {
    if(row.record[i] === "#") {
      isDamaged = true
    } else if(row.record[i] === "?") {
      return true
    } else if(row.record[i] === ".") {
      return !isDamaged
    }
  }
  return false
}

const getPossibleArrangementsForEnlargedRow = (row: Row): number => {
  const firstRowEnlarged = {
    record: row.record + "?",
    damaged: row.damaged
  }
  const firstRow = getPossibleArrangements(firstRowEnlarged)
  const middleRows = {
    record: allowQuestionMarkAsFirst(row) ? "?" + row.record + "?" : row.record + "?",
    damaged: row.damaged
  }
  const middleRow = getPossibleArrangements(middleRows)
  const lastRowEnlarged = {
    record: allowQuestionMarkAsFirst(row) ? "?" + row.record : row.record,
    damaged: row.damaged
  }
  const lastRow = getPossibleArrangements(lastRowEnlarged)

  return firstRow * (Math.pow(middleRow, 3)) * lastRow
}

const getNewPossibleArrangements = (row: Row) => {
  let generatedRows: RowState[] = [{
    currentDamagedRecord: 0,
    currentDamagedIndex: 0,
    rowDamaged: row.damaged
  }]
  for (let i = 0; i < row.record.length; i++) {
    let adjustedGeneratedRows: RowState[] = []
    if (row.record[i] === "?") {
      generatedRows.forEach(generated => {
        if (generated.currentDamagedRecord > 0) {
          if (generated.currentDamagedIndex >= generated.rowDamaged.length) {
            // console.log("removed for ?")
            // do nothing
          } else {
            const required = generated.rowDamaged[generated.currentDamagedIndex]
            if (generated.currentDamagedRecord === required) {
              adjustedGeneratedRows.push({
                currentDamagedRecord: 0,
                currentDamagedIndex: generated.currentDamagedIndex + 1,
                rowDamaged: row.damaged
              })
            } else {
              adjustedGeneratedRows.push({
                currentDamagedRecord: generated.currentDamagedRecord + 1,
                currentDamagedIndex: generated.currentDamagedIndex,
                rowDamaged: row.damaged
              })
            }
          }
        }

        adjustedGeneratedRows.push({
            currentDamagedRecord: 0,
            currentDamagedIndex: generated.currentDamagedIndex,
            rowDamaged: row.damaged
          },
          {
            currentDamagedRecord: 1,
            currentDamagedIndex: generated.currentDamagedIndex,
            rowDamaged: row.damaged
          })
      })

    } else if (row.record[i] === "#") {
      generatedRows.forEach(generated => {
        if (generated.currentDamagedIndex >= generated.rowDamaged.length) {
          // console.log("removed for # and over")
          // do nothing
        } else {
          const required = generated.rowDamaged[generated.currentDamagedIndex]
          if (generated.currentDamagedRecord > required) {
            // console.log("removed for # and local over")
            // do nothing
          } else {
            adjustedGeneratedRows.push({
              currentDamagedRecord: generated.currentDamagedRecord + 1,
              currentDamagedIndex: generated.currentDamagedIndex,
              rowDamaged: row.damaged
            })
          }
        }
      })
    } else if(row.record[i] === ".") {
      generatedRows.forEach(generated => {
          const required = generated.rowDamaged[generated.currentDamagedIndex]
          if (generated.currentDamagedRecord === 0) {
            adjustedGeneratedRows.push({
              currentDamagedRecord: 0,
              currentDamagedIndex: generated.currentDamagedIndex,
              rowDamaged: row.damaged
            })
          } else if(required === generated.currentDamagedRecord){
            adjustedGeneratedRows.push({
              currentDamagedRecord: 0,
              currentDamagedIndex: generated.currentDamagedIndex + 1,
              rowDamaged: row.damaged
            })
          }
      })
    }
    generatedRows = adjustedGeneratedRows
  }

  return generatedRows.length
}

const isRowValid = (row: Row) => {
  let continuousBroken = 0;
  let currentDamagedRecord = 0
  let valid = true

  for(let i = 0; i < row.record.length && valid; i++) {
    if(row.record[i] === "#") {
      continuousBroken++
    } else {
      if(continuousBroken > 0 && (row.damaged.length <= currentDamagedRecord || row.damaged[currentDamagedRecord] !== continuousBroken)) {
        valid = false;
      } else if(continuousBroken > 0 && row.damaged[currentDamagedRecord] === continuousBroken) {
        currentDamagedRecord++;
      }
      continuousBroken = 0
    }
  }

  if(continuousBroken > 0 && (row.damaged.length <= currentDamagedRecord || row.damaged[currentDamagedRecord] !== continuousBroken)) {
    valid = false;
  } else if(continuousBroken > 0 && row.damaged[currentDamagedRecord] === continuousBroken) {
    currentDamagedRecord++;
  }

  return row.damaged.length === currentDamagedRecord && valid
}

const unfoldRow = (row: Row): Row => {
  let record = ""
  let damaged = []

  for(let i = 0; i < 5; i++) {
    record += row.record
    damaged.push(...row.damaged)
  }

  return {
    record,
    damaged
  }
}

const goA = (input: string) => {
  const lines = splitToLines(input);

  return lines.map(parseRow).map(getPossibleArrangements).reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input: string) => {
  const lines = splitToLines(input);

  return lines.map(parseRow).map(getPossibleArrangementsForEnlargedRow).reduce((previousValue, currentValue) => previousValue + currentValue)

}

/* Tests */

test(goA(readTestFile()), 21)
test(goB(readTestFile()), 525152)

/* Results */

console.time("Time") // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time") // eslint-disable-line no-console

console.log("Solution to part 1:", resultA) // eslint-disable-line no-console
console.log("Solution to part 2:", resultB) // eslint-disable-line no-console
