import type commander from 'commander'
import type { ICommandConfigurationOptions } from '../types/configuration'
import type { Command } from './command'

// Process main command.
export type IMainCommandProcessor<O extends ICommandConfigurationOptions, V = void> = (
  options: O,
) => V | Promise<V>

// Create main command
export type IMainCommandCreator<O extends ICommandConfigurationOptions, V = void> = (
  handle?: IMainCommandProcessor<O, V>,
) => Command

// Mount main command
export type IMainCommandMounter = (parentCommand: Command, opts?: commander.CommandOptions) => void

// Execute main command.
export type IMainCommandExecutor<V = void> = (args: string[]) => Promise<V>

/**
 * Create main command mounter
 *
 * @param create  main command creator
 * @param handle  main command processor
 */
export function createMainCommandMounter<O extends ICommandConfigurationOptions, V = void>(
  create: IMainCommandCreator<O, V>,
  handle: IMainCommandProcessor<O, V>,
): IMainCommandMounter {
  return (program: Command, opts?: commander.CommandOptions): void => {
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
export function createMainCommandExecutor<O extends ICommandConfigurationOptions, V = void>(
  create: IMainCommandCreator<O, V>,
  handle: IMainCommandProcessor<O, V>,
): IMainCommandExecutor<V> {
  return (args: string[]): Promise<V> => {
    return new Promise(resolve => {
      const wrappedHandler = async (options: O): Promise<V> => {
        const result = await handle(options)
        resolve(result)
        return result
      }

      const command = create(wrappedHandler)
      command.parse(args)
    })
  }
}
