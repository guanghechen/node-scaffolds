export interface ICommandConfigurationFlatOpts {
  /**
   * Path of currently executing command.
   */
  readonly cwd: string
  /**
   * Working directory.
   */
  readonly workspace: string
  /**
   * Filepath of configs, only *.yml, *.yaml and *.json are supported.
   * Each configuration file can specify the same options, the configuration
   * file specified later can override the configuration specified previous.
   * @default []
   */
  readonly configPath?: string[]
  /**
   * Filepath of parastic config.
   */
  readonly parasticConfigPath?: string | null
  /**
   * The entry key of options in the parasitic configuration file.
   */
  readonly parasticConfigEntry?: string | null
}

export interface ICommandConfigurationOptions {
  /**
   * Log level.
   * @default undefined
   */
  readonly logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | string
  /**
   * Filepath of configs, only *.yml, *.yaml and *.json are supported.
   * Each configuration file can specify the same options, the configuration
   * file specified later can override the configuration specified previous.
   * @default []
   */
  readonly configPath?: string[]
  /**
   * Filepath of parastic config.
   */
  readonly parasticConfigPath?: string | null
  /**
   * The entry key of options in the parasitic configuration file.
   */
  readonly parasticConfigEntry?: string | null
  /**
   * The root dir to locate the config files and resolve relative paths.
   */
  readonly workspace?: string
}

export interface ICommandConfiguration<IOptions extends ICommandConfigurationOptions> {
  /**
   * Global options shared by all sub-commands
   */
  __globalOptions__: IOptions
  /**
   * Sub-command specific options
   */
  [subCommand: string]: IOptions
}
