import type { RollupOptions } from 'rollup'
import { resolveEntryItems } from './entry'
import type { IRawRollupConfigEnv } from './env'
import { resolveRollupConfigEnv } from './env'
import { resolveExternal } from './external'
import { dtsConfigMiddleware } from './middleware/dts'
import { tsConfigMiddleware } from './middleware/ts'
import { dtsPresetConfigBuilder } from './preset/dts'
import { tsPresetConfigBuilder } from './preset/ts'
import type {
  DependencyCategory,
  IConfigMiddleware,
  IConfigMiddlewareContext,
  IConfigMiddlewareNext,
  IEntryItem,
  IEnv,
  IManifest,
  IPresetConfigBuilder,
  IPresetConfigBuilderContext,
  IPresetRollupConfig,
  IRollupConfig,
} from './types'
import { PresetBuilderName } from './types'

export interface IRollupConfigOptions {
  /**
   * Main input / output options.
   */
  manifest: IManifest
  /**
   * Environment variables.
   */
  env?: IRawRollupConfigEnv | undefined
  /**
   * Rollup preset configs.
   */
  presetConfigBuilders?: IPresetConfigBuilder[] | undefined
  /**
   * Rollup config middlewares.
   */
  middlewares?: IConfigMiddleware[] | undefined
  /**
   * Classify dependency.
   * @param id
   * @returns
   */
  classifyDependency?: (id: string) => DependencyCategory
}

export interface IBuildRollupConfigResult {
  env: IEnv
  configs: IRollupConfig[]
  presetMap: ReadonlyMap<string, IPresetRollupConfig>
}

export async function buildRollupConfig(
  options: IRollupConfigOptions,
): Promise<IBuildRollupConfigResult> {
  const { manifest, classifyDependency } = options
  const env = resolveRollupConfigEnv(options.env ?? {})
  const baseExternal = await resolveExternal(manifest, env, classifyDependency)
  const presetContext: IPresetConfigBuilderContext = {
    env,
    manifest,
    baseExternal,
  }

  const presetConfigMap: Map<string, IPresetRollupConfig> = new Map()
  {
    const builders = options.presetConfigBuilders ?? []
    for (const builder of builders) {
      if (presetConfigMap.has(builder.name)) {
        console.warn(`[createRollupConfig] Duplicate builder name: (${builder.name})`)
        continue
      }
      const presetConfig = await builder.build(presetContext)
      presetConfigMap.set(builder.name, presetConfig)
    }

    if (!presetConfigMap.has(PresetBuilderName.TS)) {
      presetConfigMap.set(PresetBuilderName.TS, await tsPresetConfigBuilder().build(presetContext))
    }

    if (!presetConfigMap.has(PresetBuilderName.DTS)) {
      presetConfigMap.set(
        PresetBuilderName.DTS,
        await dtsPresetConfigBuilder().build(presetContext),
      )
    }
  }

  const middlewareContext: IConfigMiddlewareContext = {
    env,
    manifest,
    presetMap: presetConfigMap,
  }
  const lastMiddlewareHandler: IConfigMiddlewareNext = (_, results) => results
  const handle: IConfigMiddlewareNext = [
    ...(options.middlewares ?? []),
    tsConfigMiddleware,
    dtsConfigMiddleware,
  ]
    .map(middleware => middleware(middlewareContext))
    .reduceRight((next, middlewareInner) => middlewareInner(next), lastMiddlewareHandler)

  const entries: IEntryItem[] = resolveEntryItems(manifest)
  const configs: IRollupConfig[] = entries.map(entry => handle(entry, [])).flat()
  return { configs, presetMap: presetConfigMap, env }
}

export async function createRollupConfig(options: IRollupConfigOptions): Promise<RollupOptions[]> {
  const { configs } = await buildRollupConfig(options)
  return configs
}
