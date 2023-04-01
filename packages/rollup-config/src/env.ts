import type { IEnv } from './types'

export interface IRawRollupConfigEnv {
  /**
   * Whether if generate sourcemaps.
   * @default true
   */
  shouldSourceMap?: boolean
  /**
   * Whether if make all dependencies external.
   * @default true
   */
  shouldExternalAll?: boolean
}

export function resolveRollupConfigEnv(rawEnv: IRawRollupConfigEnv): IEnv {
  const forceSourceMap: boolean | undefined = convertToBoolean(process.env.ROLLUP_SHOULD_SOURCEMAP)
  const forceExternalAll: boolean | undefined = convertToBoolean(
    process.env.ROLLUP_EXTERNAL_ALL_DEPENDENCIES,
  )
  const env: IEnv = {
    sourcemap: forceSourceMap ?? rawEnv.shouldSourceMap ?? true,
    externalAll: forceExternalAll ?? rawEnv.shouldExternalAll ?? true,
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
