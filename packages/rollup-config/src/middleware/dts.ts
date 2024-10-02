import type { IConfigMiddleware } from '../types'
import { PresetBuilderName } from '../types'
import { hasSpecifiedOutputFile } from '../util'

export const dtsConfigMiddleware: IConfigMiddleware = ctx => next => (entry, prevResults) => {
  if (entry.types && !hasSpecifiedOutputFile(prevResults, entry.types)) {
    const dtsPresetConfig = ctx.presetMap.get(PresetBuilderName.DTS)
    if (!dtsPresetConfig) {
      console.warn('Missing builtin dts preset-config.')
      return next(entry, prevResults)
    }

    return next(entry, [
      ...prevResults,
      {
        ...dtsPresetConfig,
        input: entry.source,
        output: {
          format: 'esm',
          exports: 'named',
          file: entry.types,
          inlineDynamicImports: ctx.env.inlineDynamicImports,
        },
      },
    ])
  }
  return next(entry, prevResults)
}
