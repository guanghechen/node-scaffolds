import type { IEnv } from './types'

export interface IRawRollupConfigEnv {
  /**
   * Whether if generate sourcemaps.
   * @default true
   */
  sourcemap?: boolean
  /**
   * Whether if make all dependencies external.
   * @default true
   */
  external?: boolean
  /**
   * Inline dynamic imports instead of creating new chunks to create a single bundle.
   * @see https://rollupjs.org/configuration-options/#output-inlinedynamicimports
   */
  inlineDynamicImports?: boolean
}

export function resolveRollupConfigEnv(rawEnv: IRawRollupConfigEnv): IEnv {
  const forceSourceMap: boolean | undefined = convertToBoolean(process.env.ROLLUP_SHOULD_SOURCEMAP)
  const forceExternalAll: boolean | undefined = convertToBoolean(
    process.env.ROLLUP_EXTERNAL_ALL_DEPENDENCIES,
  )
  const env: IEnv = {
    sourcemap: forceSourceMap ?? rawEnv.sourcemap ?? true,
    externalAll: forceExternalAll ?? rawEnv.external ?? true,
    inlineDynamicImports: rawEnv.inlineDynamicImports ?? false,
  }
  return env
}

function convertToBoolean(v?: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const t = v.toLowerCase()
    if (t === 'false') return false
    if (t === 'true') return true
  }
  return undefined
}
