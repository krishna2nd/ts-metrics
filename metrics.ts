import * as tc from './lib'

import { access, accessSync, constants, fstat, lstatSync, stat } from 'fs'

import glob from 'glob'
import path from 'path'

const inputArgs = process.argv.slice(2)

const createReport = (files: string[]) => {
    const report: any[] = []
    files.forEach((file: string) => {
        const metricMaintanability = tc.getMaintainability(file)
        report.push({
            file,
            ...metricMaintanability
        })
    })
    console.table(report)
}

const GLOBAL_TS_PATTERN: string = '{,!(node_modules)/**/}*.ts'
const createReportWithPathPattern = (matchPattern: string = GLOBAL_TS_PATTERN) => {
    console.log(matchPattern)
    const options = {}

    const paternMatchAndCreateReport = (err: Error | null, files: string[]) => {
        if (err) {
            console.error("Some error occured", err)
        }
        createReport(files)
    }
    glob(matchPattern, options, paternMatchAndCreateReport)
}

if (inputArgs.length > 0) {
    const stat = lstatSync(inputArgs[0]);
    if (stat.isFile()) {
        createReport(inputArgs)
    } else if (stat.isDirectory()) {
        createReportWithPathPattern(inputArgs[0] + GLOBAL_TS_PATTERN)
    } else {
        // TODO Validate pattern
        createReportWithPathPattern(inputArgs[0])
    }
}
