import { createProgram, logger, mountSubCommandMerge, mountSubCommandSplit } from '.'

const program = createProgram()

// mount sub-command:merge
mountSubCommandMerge(program)

// mount sub-command:split
mountSubCommandSplit(program)

program.parseAsync(process.argv).catch(error => logger.error(error))
