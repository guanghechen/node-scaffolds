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
 * @param target
 * @returns
 */
export function normalizeTarget(target: IOptionTarget): IConfigTarget | never {
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

  const configTarget: IConfigTarget = {
    src: Array.isArray(src) ? src : [src],
    dest: Array.isArray(dest) ? dest : [dest],
    rename: rename ? normalizeRename(rename) : undefined,
    transform: target.transform,
    copyOnce: target.copyOnce,
    flatten: target.flatten,
    verbose: target.verbose,
    globbyOptions: target.globbyOptions ?? {},
    fsExtraOptions: {
      copy: target.fsExtraOptions?.copy ?? {},
      outputFile: target.fsExtraOptions?.outputFile,
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
    targets: targets ? targets.map(normalizeTarget) : [],
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
  return config
}
