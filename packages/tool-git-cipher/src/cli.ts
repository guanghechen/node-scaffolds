import {
  createProgram,
  logger,
  mountSubCommandCat,
  mountSubCommandDecrypt,
  mountSubCommandEncrypt,
  mountSubCommandInit,
} from '.'

const program = createProgram()

// mount sub-command: cat
mountSubCommandCat(program)

// mount sub-command: decrypt
mountSubCommandDecrypt(program)

// mount sub-command: encrypt
mountSubCommandEncrypt(program)

// mount sub-command: init
mountSubCommandInit(program)

program.parseAsync(process.argv).catch(error => logger.error(error))
