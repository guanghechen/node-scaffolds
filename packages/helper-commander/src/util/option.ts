import { resolveLevel } from '@guanghechen/chalk-logger'
import type { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import {
  isNonBlankString,
  isNotEmptyArray,
  isNotEmptyObject,
  isObject,
} from '@guanghechen/helper-is'
import { cover, coverString } from '@guanghechen/helper-option'
import { absoluteOfWorkspace, locateNearestFilepath } from '@guanghechen/helper-path'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type {
  ICommandConfiguration,
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
} from '../types'
import { loadConfig } from './config'
import type { IMergeStrategyMap } from './merge'
import { merge } from './merge'

/**
 * Flat defaultOptions with configs from package.json
 */
export function flatOptionsFromConfiguration<O extends ICommandConfigurationOptions>(
  logger: ChalkLogger,
  defaultOptions: O,
  flatOpts: Readonly<ICommandConfigurationFlatOpts>,
  subCommandName: string | false,
  strategyMap?: Readonly<Partial<IMergeStrategyMap<O>>>,
): O {
  let resolvedConfig = {} as unknown as ICommandConfiguration<O>

  // load configs
  if (isNotEmptyArray(flatOpts.configPath)) {
    const configs: Array<ICommandConfiguration<O>> = []
    for (const filepath of flatOpts.configPath) {
      if (existsSync(filepath)) {
        const config = loadConfig(filepath) as ICommandConfiguration<O>
        configs.push(config)
      } else {
        logger.verbose(
          `[flatOptionsFromConfiguration] Config file is not exist (ignored). ${filepath}`,
        )
      }
    }
    resolvedConfig = merge(configs, {})
  } else {
    // otherwise, load from parastic config
    if (
      isNonBlankString(flatOpts.parasticConfigPath) &&
      isNonBlankString(flatOpts.parasticConfigEntry)
    ) {
      const config = loadConfig(flatOpts.parasticConfigPath) ?? {}
      resolvedConfig = (config[flatOpts.parasticConfigEntry] as ICommandConfiguration<O>) || {}
    }
  }

  let result: O = defaultOptions
  if (subCommandName === false) {
    result = merge(
      [
        result,
        isObject(resolvedConfig.__globalOptions__)
          ? resolvedConfig.__globalOptions__
          : (resolvedConfig as unknown as O),
      ],
      strategyMap,
    )
  } else {
    // merge globalOptions
    if (isNotEmptyObject(resolvedConfig.__globalOptions__)) {
      result = merge([result, resolvedConfig.__globalOptions__], strategyMap)
    }

    // merge specified sub-command option
    if (isNonBlankString(subCommandName) && isObject(resolvedConfig[subCommandName])) {
      result = merge([result, resolvedConfig[subCommandName]], strategyMap)
    }
  }

  return result
}

// Resolve CommandConfigurationOptions
export function resolveCommandConfigurationOptions<O extends ICommandConfigurationOptions>(
  logger: ChalkLogger,
  commandName: string,
  subCommandName: string | false,
  workspaceDir: string,
  defaultOptions: O,
  options: Partial<O>,
  strategyMap?: Partial<IMergeStrategyMap<O>>,
): O & ICommandConfigurationFlatOpts {
  const cwd: string = path.resolve()
  const workspace: string = path.resolve(cwd, workspaceDir)

  // Resolve configPath
  const configPath: string[] = cover<string[]>(
    defaultOptions.configPath ?? [],
    options.configPath,
    isNotEmptyArray,
  )
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => absoluteOfWorkspace(workspace, p))

  // Resolve parasticConfigPath
  const parasticConfigPath: string | null | undefined = cover<string | null>(
    () => locateNearestFilepath(workspace, 'package.json'),
    options.parasticConfigPath,
  )

  // Resolve parasticConfigEntry
  const parasticConfigEntry: string = coverString(commandName, options.parasticConfigEntry)

  const flatOpts: ICommandConfigurationFlatOpts = {
    cwd,
    workspace,
    configPath,
    parasticConfigPath,
    parasticConfigEntry,
  }

  const resolvedOptions = flatOptionsFromConfiguration<O>(
    logger,
    defaultOptions,
    flatOpts,
    subCommandName,
    strategyMap,
  )

  // reset log-level
  const logLevel = cover<string | undefined>(resolvedOptions.logLevel, options.logLevel)
  if (logLevel) {
    const level: Level | null = resolveLevel(logLevel)
    if (level) logger.setLevel(level)
  }

  logger.debug('cwd:', flatOpts.cwd)
  logger.debug('workspace:', flatOpts.workspace)
  logger.debug('configPath:', flatOpts.configPath)
  logger.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
  logger.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)
  logger.debug('logLevel:', logLevel)

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
