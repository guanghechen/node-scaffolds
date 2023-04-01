import type { IPresetRollupConfig, IRollupConfig } from './config'
import type { IEntryItem } from './entry'
import type { IEnv } from './env'
import type { IManifest } from './manifest'

export interface IConfigMiddlewareContext {
  env: IEnv
  manifest: IManifest
  /**
   * Preset rollup config map, key is the RollupConfigBuilder name.
   */
  presetMap: ReadonlyMap<string, IPresetRollupConfig>
}

export type IConfigMiddlewareNext = (
  entry: IEntryItem,
  prevResults: ReadonlyArray<IRollupConfig>,
) => ReadonlyArray<IRollupConfig>

export type IConfigMiddleware = (
  ctx: IConfigMiddlewareContext,
) => (next: IConfigMiddlewareNext) => IConfigMiddlewareNext
