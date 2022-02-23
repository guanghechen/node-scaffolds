import dirGlob from 'dir-glob'
import type {
  IConfig,
  IConfigRename,
  IConfigTarget,
  IOptionRename,
  IOptionTarget,
  IOptions,
} from '../types'
import { isPlainObject, stringify } from './common'

/**
 * Normalize `options.targets.$.rename`.
 * @param rename
 * @returns
 */
export function normalizeRename(rename: IOptionRename): IConfigRename {
  if (typeof rename === 'string') return () => rename
  return rename
}

/**
 * Normalize element of `options.targets`.
 *
 * @param config
 * @param target
 * @returns
 */
export function normalizeTarget(
  config: Exclude<IConfig, 'targets'>,
  target: IOptionTarget,
): IConfigTarget | never {
  if (!isPlainObject(target)) {
    throw new Error(`${stringify(target)} target must be an object`)
  }

  const { src, dest, rename } = target

  if (!src || !dest) {
    throw new Error(`${stringify(target)} target must have "src" and "dest" properties`)
  }

  if (rename != null && typeof rename !== 'string' && typeof rename !== 'function') {
    throw new Error(
      `${stringify(target)} target's "rename" property must be a string or a function`,
    )
  }

  const targetSrc: string[] = Array.isArray(src) ? src : [src]
  const targetSrcPattens: string[] = dirGlob
    .sync(targetSrc)
    .map(pattern => (/\/[*]{2}$/.test(pattern) ? pattern + '/*' : pattern))
  const configTarget: IConfigTarget = {
    src: targetSrc,
    srcPatterns: targetSrcPattens,
    dest: Array.isArray(dest) ? dest : [dest],
    rename: rename ? normalizeRename(rename) : undefined,
    transform: target.transform,
    copyOnce: target.copyOnce ?? config.copyOnce,
    flatten: target.flatten ?? config.flatten,
    verbose: target.verbose ?? config.verbose,
    globbyOptions: {
      ...config.globbyOptions,
      ...target.globbyOptions,
    },
    fsExtraOptions: {
      copy: {
        ...config.fsExtraOptions.copy,
        ...target.fsExtraOptions?.copy,
      },
      outputFile: target.fsExtraOptions?.outputFile ?? config.fsExtraOptions?.outputFile,
    },
  }
  return configTarget
}

export function normalizeOptions(options: IOptions): IConfig {
  const {
    targets,
    copyOnce = false,
    flatten = true,
    verbose = false,
    hook = 'buildEnd',
    watchHook = 'buildStart',
    globbyOptions = {},
    fsExtraOptions = {},
  } = options

  const config: IConfig = {
    targets: [],
    copyOnce,
    flatten,
    verbose,
    hook,
    watchHook,
    globbyOptions: globbyOptions,
    fsExtraOptions: {
      copy: fsExtraOptions.copy ?? {},
      outputFile: fsExtraOptions.outputFile,
    },
  }
  config.targets = targets ? targets.map(target => normalizeTarget(config, target)) : []
  return config
}
