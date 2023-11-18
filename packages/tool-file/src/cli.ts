import { createProgram, mountSubCommandMerge, mountSubCommandSplit, reporter } from '.'

const program = createProgram()

// mount sub-command:merge
mountSubCommandMerge(program)

// mount sub-command:split
mountSubCommandSplit(program)

program.parseAsync(process.argv).catch(error => reporter.error(error))
