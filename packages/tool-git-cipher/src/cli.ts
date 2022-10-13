import {
  createProgram,
  logger,
  mountSubCommandDecrypt,
  mountSubCommandEncrypt,
  mountSubCommandInit,
} from '.'

const program = createProgram()

// mount sub-command: init
mountSubCommandInit(program)

// mount sub-command: encrypt
mountSubCommandEncrypt(program)

// mount sub-command: decrypt
mountSubCommandDecrypt(program)

program.parseAsync(process.argv).catch(error => {
  logger.error(error)
})
