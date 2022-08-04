import { Level } from '@guanghechen/chalk-logger'
import type { ChalkLogger } from '@guanghechen/chalk-logger'
import { isNonBlankString, isNotEmptyArray, isNotEmptyObject } from '@guanghechen/helper-is'
import { cover, coverString } from '@guanghechen/helper-option'
import { absoluteOfWorkspace, locateNearestFilepath } from '@guanghechen/helper-path'
import path from 'path'
import { loadJsonOrYamlSync } from './fs'
import type { IMergeStrategy } from './merge'
import { defaultMergeStrategies, merge } from './merge'

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
   * Filepath of parastic config,
   */
  readonly parasticConfigPath?: string | null

  /**
   * The entry key of options in the parasitic configuration file
   */
  readonly parasticConfigEntry?: string | null
}

export interface ICommandConfigurationOptions extends Record<string, unknown> {
  /**
   * log level
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
   * Filepath of parastic config,
   */
  readonly parasticConfigPath?: string | null

  /**
   * The entry key of options in the parasitic configuration file
   */
  readonly parasticConfigEntry?: string | null
}

export interface ICommandConfiguration<Options extends ICommandConfigurationOptions> {
  /**
   * Global options shared by all sub-commands
   */
  __globalOptions__: Options

  /**
   * Sub-command specific options
   */
  [subCommand: string]: Options
}

/**
 * Flat defaultOptions with configs from package.json
 */
export function flatOptionsFromConfiguration<C extends ICommandConfigurationOptions>(
  defaultOptions: C,
  flatOpts: ICommandConfigurationFlatOpts,
  subCommandName: string | false,
  strategies: Partial<Record<keyof C, IMergeStrategy>> = {},
): C {
  let resolvedConfig = {} as unknown as ICommandConfiguration<C>

  // load configs
  if (isNotEmptyArray(flatOpts.configPath)) {
    const configs: Array<ICommandConfiguration<C>> = []
    for (const filepath of flatOpts.configPath) {
      const config = loadJsonOrYamlSync(filepath) as ICommandConfiguration<C>
      configs.push(config)
    }
    resolvedConfig = merge<ICommandConfiguration<C>>(configs, {}, defaultMergeStrategies.replace)
  } else {
    // otherwise, load from parastic config
    if (
      isNonBlankString(flatOpts.parasticConfigPath) &&
      isNonBlankString(flatOpts.parasticConfigEntry)
    ) {
      const config = loadJsonOrYamlSync(flatOpts.parasticConfigPath) as any
      resolvedConfig = (config[flatOpts.parasticConfigEntry] as ICommandConfiguration<C>) || {}
    }
  }

  let result: C = defaultOptions
  if (subCommandName === false) {
    result = merge<C>(
      [result, resolvedConfig as unknown as C],
      strategies,
      defaultMergeStrategies.replace,
    )
  } else {
    // merge globalOptions
    if (isNotEmptyObject(resolvedConfig.__globalOptions__)) {
      result = merge<C>(
        [result, resolvedConfig.__globalOptions__],
        strategies,
        defaultMergeStrategies.replace,
      )
    }

    // merge specified sub-command option
    if (isNonBlankString(subCommandName) && typeof resolvedConfig[subCommandName] == 'object') {
      result = merge<C>(
        [result, resolvedConfig[subCommandName]],
        strategies,
        defaultMergeStrategies.replace,
      )
    }
  }

  return result
}

/**
 * Resolve CommandConfigurationOptions
 *
 * @param logger
 * @param commandName
 * @param subCommandName
 * @param workspaceDir
 * @param defaultOptions
 * @param options
 * @param strategies
 */
export function resolveCommandConfigurationOptions<
  C extends Partial<ICommandConfigurationOptions>,
  D extends ICommandConfigurationOptions,
>(
  logger: ChalkLogger,
  commandName: string,
  subCommandName: string | false,
  workspaceDir: string,
  defaultOptions: D,
  options: C,
  strategies: Partial<Record<keyof D, IMergeStrategy>> = {},
): D & ICommandConfigurationFlatOpts {
  const cwd: string = path.resolve()
  const workspace: string = path.resolve(cwd, workspaceDir)
  const configPath: string[] = (options.configPath ?? defaultOptions.configPath ?? []).map(
    (p: string) => absoluteOfWorkspace(workspace, p),
  )
  const parasticConfigPath: string | null | undefined = cover<string | null>(
    () => locateNearestFilepath(workspace, 'package.json'),
    options.parasticConfigPath,
  )
  const parasticConfigEntry: string = coverString(commandName, options.parasticConfigEntry)
  const flatOpts: ICommandConfigurationFlatOpts = {
    cwd,
    workspace,
    configPath,
    parasticConfigPath,
    parasticConfigEntry,
  }

  const resolvedOptions = flatOptionsFromConfiguration<D>(
    defaultOptions,
    flatOpts,
    subCommandName,
    strategies,
  )

  // reset log-level
  const logLevel = cover<string | undefined>(resolvedOptions.logLevel, options.logLevel)
  if (logLevel != null) {
    const level = Level.valueOf(logLevel)
    if (level != null) logger.setLevel(level)
  }

  logger.debug('cwd:', flatOpts.cwd)
  logger.debug('workspace:', flatOpts.workspace)
  logger.debug('configPath:', flatOpts.configPath)
  logger.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
  logger.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)

  return {
    ...resolvedOptions,
    logLevel,
    cwd,
    workspace,
    configPath,
    parasticConfigPath,
    parasticConfigEntry,
  }
}
