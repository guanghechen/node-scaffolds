import type { ICommandConfigurationOptions } from '@guanghechen/cli'
import type { CommandOptions } from 'commander'
import type { Command } from './command'

// Process main command.
export type IMainCommandProcessor<O extends ICommandConfigurationOptions> = (
  options: O,
) => void | Promise<void>

// Create main command
export type IMainCommandCreator<O extends ICommandConfigurationOptions> = (
  handle?: IMainCommandProcessor<O>,
) => Command

// Mount main command
export type IMainCommandMounter = (parentCommand: Command, opts?: CommandOptions) => void

// Execute main command.
export type IMainCommandExecutor<V = void> = (args: string[]) => Promise<V>

/**
 * Create main command mounter
 *
 * @param create  main command creator
 * @param handle  main command processor
 */
export function createMainCommandMounter<O extends ICommandConfigurationOptions>(
  create: IMainCommandCreator<O>,
  handle: IMainCommandProcessor<O>,
): IMainCommandMounter {
  return (program: Command, opts?: CommandOptions): void => {
    const command = create(handle)
    if (command.name().length <= 0) {
      command.name('__main__')
    }
    program.addCommand(command, { ...opts, isDefault: true })
  }
}

/**
 * Create main command executor
 *
 * @param create  main command creator
 * @param handle  main command processor
 */
export function createMainCommandExecutor<O extends ICommandConfigurationOptions>(
  create: IMainCommandCreator<O>,
  handle: IMainCommandProcessor<O>,
): IMainCommandExecutor {
  return (args: string[]): Promise<void> => {
    return new Promise(resolve => {
      const wrappedHandler = async (options: O): Promise<void> => {
        await handle(options)
        resolve()
      }

      const command = create(wrappedHandler)
      command.parse(args)
    })
  }
}
