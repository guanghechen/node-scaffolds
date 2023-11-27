import { ChalkLogger } from '@guanghechen/chalk-logger'
import { EventBus } from '@guanghechen/event-bus'
import type { ISubCommand, ISubCommandOptions } from '@guanghechen/helper-commander'
import type { IGitCipherSubCommandProps } from '.'
import {
  COMMAND_NAME,
  EventTypes,
  GitCipherSubCommandCat,
  GitCipherSubCommandDecrypt,
  GitCipherSubCommandEncrypt,
  GitCipherSubCommandInit,
  GitCipherSubCommandTree,
  GitCipherSubCommandVerify,
  createProgram,
  inputAnswerFromTerminal,
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

export const eventBus = new EventBus<EventTypes>()
  .on(EventTypes.CANCELED, (_evt, eb) => {
    reporter.info('canceled')
    eb.dispatch({ type: EventTypes.EXITING })
  })
  .on(EventTypes.EXITING, () => {
    process.exit(0)
  })

const program = createProgram()

const commandProps: IGitCipherSubCommandProps = {
  eventBus,
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
  .catch(error => reporter.error(error))
