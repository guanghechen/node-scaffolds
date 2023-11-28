import { ChalkLogger } from '@guanghechen/chalk-logger'
import type { ISubCommand, ISubCommandOptions } from '@guanghechen/helper-commander'
import type { IGitCipherSubCommandProps } from '.'
import {
  COMMAND_NAME,
  CustomErrorCode,
  GitCipherSubCommandCat,
  GitCipherSubCommandDecrypt,
  GitCipherSubCommandEncrypt,
  GitCipherSubCommandInit,
  GitCipherSubCommandTree,
  GitCipherSubCommandVerify,
  createProgram,
  inputAnswerFromTerminal,
  isCustomError,
} from '.'

const reporter = new ChalkLogger(
  {
    name: COMMAND_NAME,
    flights: {
      colorful: true,
      date: false,
      inline: true,
      title: true,
    },
  },
  process.argv,
)

const program = createProgram()

const commandProps: IGitCipherSubCommandProps = {
  reporter,
  inputAnswer: inputAnswerFromTerminal,
}
const commands: Array<ISubCommand<ISubCommandOptions>> = [
  new GitCipherSubCommandCat(commandProps),
  new GitCipherSubCommandDecrypt(commandProps),
  new GitCipherSubCommandEncrypt(commandProps),
  new GitCipherSubCommandInit(commandProps),
  new GitCipherSubCommandTree(commandProps),
  new GitCipherSubCommandVerify(commandProps),
]

for (const subCommand of commands) {
  subCommand.mount(program, undefined)
}

program
  .parseAsync(process.argv) //
  .catch(error => {
    if (isCustomError(error) && error.code === CustomErrorCode.SOFT_EXITING) {
      process.exit(0)
    }
    reporter.error(error)
  })
