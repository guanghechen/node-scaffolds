import { resolveLevel } from '@guanghechen/chalk-logger'
import {
  isFunction,
  isNonBlankString,
  isNotEmptyArray,
  isNotEmptyObject,
  isObject,
} from '@guanghechen/helper-is'
import { cover, coverString } from '@guanghechen/helper-option'
import { locateNearestFilepath, pathResolver } from '@guanghechen/path'
import type { IReporter, ReporterLevelEnum } from '@guanghechen/reporter.types'
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

export interface IResolveDefaultOptionsParams {
  cwd: string
  workspace: string
  reporter: IReporter
}

export interface IResolveCommandConfigurationOptionsParams<O extends ICommandConfigurationOptions> {
  commandName: string
  defaultOptions: O | ((params: IResolveDefaultOptionsParams) => O)
  reporter: IReporter
  options: Partial<O>
  strategyMap?: Partial<IMergeStrategyMap<O>>
  subCommandName: string | false
  workspace: string | undefined
}

// Resolve CommandConfigurationOptions
export function resolveCommandConfigurationOptions<O extends ICommandConfigurationOptions>(
  params: IResolveCommandConfigurationOptionsParams<O>,
): O & ICommandConfigurationFlatOpts {
  const cwd: string = path.resolve()
  const { commandName, defaultOptions, reporter, options, strategyMap, subCommandName } = params
  const workspace = path.resolve(cwd, options.workspace || params.workspace || '.')

  const baseOptions: O = isFunction(defaultOptions)
    ? defaultOptions({ cwd, workspace, reporter })
    : defaultOptions

  // Resolve configPath
  const configPath: string[] = cover<string[]>(
    baseOptions.configPath ?? [],
    options.configPath,
    isNotEmptyArray,
  )
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => pathResolver.safeResolve(workspace, p))

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

  const setLoggerLevel = (
    defaultLogLevel: string | ReporterLevelEnum | undefined,
  ): ReporterLevelEnum | null => {
    const _logLevel = cover<string | ReporterLevelEnum | undefined>(
      defaultLogLevel,
      options.logLevel,
    )
    const _level: ReporterLevelEnum | null = _logLevel ? resolveLevel(_logLevel) : null
    if (_level) {
      reporter.setLevel(_level)
    }
    return _level
  }

  setLoggerLevel(undefined)

  const resolvedConfig: ICommandConfiguration<O> = flatConfiguration<O>(reporter, flatOpts)
  const resolvedOptions: O = flatOptions<O>(
    resolvedConfig,
    baseOptions,
    subCommandName,
    strategyMap,
  )
  const logLevel: ReporterLevelEnum | null = setLoggerLevel(resolvedOptions.logLevel)

  reporter.debug('cwd:', flatOpts.cwd)
  reporter.debug('workspace:', flatOpts.workspace)
  reporter.debug('configPath:', flatOpts.configPath)
  reporter.debug('parasticConfigPath:', flatOpts.parasticConfigPath)
  reporter.debug('parasticConfigEntry:', flatOpts.parasticConfigEntry)
  reporter.debug('logLevel:', logLevel)
  reporter.debug('resolvedConfig:', resolvedConfig)
  reporter.debug('resolvedOptions:', resolvedOptions)

  return { ...defaultOptions, ...resolvedOptions, ...flatOpts, logLevel }
}

// Flat defaultOptions with configs from package.json
function flatConfiguration<O extends ICommandConfigurationOptions>(
  reporter: IReporter,
  flatOpts: Readonly<ICommandConfigurationFlatOpts>,
): ICommandConfiguration<O> {
  // load configs
  if (isNotEmptyArray(flatOpts.configPath)) {
    const configs: Array<ICommandConfiguration<O>> = []
    for (const filepath of flatOpts.configPath) {
      if (existsSync(filepath)) {
        const config = loadConfig(filepath) as ICommandConfiguration<O>
        configs.push(config)
      } else {
        reporter.verbose(
          `[flatOptionsFromConfiguration] Config file is not exist (ignored). ${filepath}`,
        )
      }
    }
    return merge(configs, {})
  } else {
    // otherwise, load from parastic config
    if (
      isNonBlankString(flatOpts.parasticConfigPath) &&
      isNonBlankString(flatOpts.parasticConfigEntry)
    ) {
      const config = (loadConfig(flatOpts.parasticConfigPath) ?? {}) as Record<string, unknown>
      return (config[flatOpts.parasticConfigEntry] as ICommandConfiguration<O>) || {}
    }
  }
  return {} as unknown as ICommandConfiguration<O>
}

// Flat defaultOptions with configs from package.json
function flatOptions<O extends ICommandConfigurationOptions>(
  resolvedConfig: ICommandConfiguration<O>,
  defaultOptions: O,
  subCommandName: string | false,
  strategyMap: Readonly<Partial<IMergeStrategyMap<O>>> | undefined,
): O {
  if (subCommandName === false) {
    return merge(
      [
        defaultOptions,
        isObject(resolvedConfig.__globalOptions__)
          ? resolvedConfig.__globalOptions__
          : (resolvedConfig as unknown as O),
      ],
      strategyMap,
    )
  }

  let resolvedOptions: O = defaultOptions

  // merge globalOptions
  if (isNotEmptyObject(resolvedConfig.__globalOptions__)) {
    resolvedOptions = merge([resolvedOptions, resolvedConfig.__globalOptions__], strategyMap)
  }

  // merge specified sub-command option
  if (isNonBlankString(subCommandName) && isObject(resolvedConfig[subCommandName])) {
    resolvedOptions = merge([resolvedOptions, resolvedConfig[subCommandName]], strategyMap)
  }
  return resolvedOptions
}
