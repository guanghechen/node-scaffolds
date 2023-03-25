import { registerCommanderOptions } from '@guanghechen/chalk-logger'
import { Command } from './command'

/**
 * Create top command
 * @param commandName
 * @param version
 */
export function createTopCommand(commandName: string, version: string): Command {
  const program = new Command()

  program
    .storeOptionsAsProperties(false) //
    .version(version)
    .name(commandName)

  registerCommanderOptions(program)

  program
    .option(
      '-c, --config-path, --configPath <configPath>',
      'config filepaths',
      (val, acc: string[]) => acc.concat(val),
      [],
    )
    .option(
      '--parastic-config-path, --parasticConfigFilepath <parasticConfigFilepath>',
      'parastic config filepath',
    )
    .option(
      '--parastic-config-entry, --parasticConfigEntry <parasticConfigEntry>',
      'parastic config filepath',
    )
    .option(
      '--workspace <workspace>',
      'The root dir to locate the config files and resolve relative paths',
    )

  return program
}
