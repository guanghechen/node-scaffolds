import type { IConfigMiddleware } from '../types'
import { PresetBuilderName } from '../types'
import { hasSpecifiedOutputFile } from '../util'

export const tsConfigMiddleware: IConfigMiddleware = ctx => next => (entry, prevResults) => {
  const todoImport = !!entry.import && !hasSpecifiedOutputFile(prevResults, entry.import)
  const todoRequire = !!entry.require && !hasSpecifiedOutputFile(prevResults, entry.require)

  if (todoImport || todoRequire) {
    const tsPresetConfig = ctx.presetMap.get(PresetBuilderName.TS)
    if (!tsPresetConfig) {
      console.warn('Missing builtin ts preset-config.')
      return next(entry, prevResults)
    }

    const nextResults = [...prevResults]
    if (todoImport) {
      nextResults.push({
        ...tsPresetConfig,
        input: entry.source,
        output: {
          format: 'esm',
          exports: 'named',
          file: entry.import,
          sourcemap: ctx.env.sourcemap,
        },
      })
    }

    if (todoRequire) {
      nextResults.push({
        ...tsPresetConfig,
        input: entry.source,
        output: {
          format: 'cjs',
          exports: 'named',
          interop: 'auto',
          file: entry.require,
          sourcemap: ctx.env.sourcemap,
        },
      })
    }
    return next(entry, nextResults)
  }

  return next(entry, prevResults)
}
