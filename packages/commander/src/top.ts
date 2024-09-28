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

    // Register logger (reporter) related options.
    .option('--log-encoding <encoding>', 'Encoding of log file.')
    .option('--log-filepath <filepath>', 'Path which the log file is located.')
    .option('--log-level <level>', 'Log level.')
    .option('--log-name <name>', 'Logger name.')
    .option('--log-mode <normal|loose>', 'Log format mode.')
    .option(
      '--log-flight <[[no-]<date|title|colorful|inline>]>',
      'Enable / disable logger flights.',
      (val: string, acc: string[]) => acc.concat(val),
      [],
    )

    // Other builtin options.
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
