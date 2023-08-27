import type { Plugin, RollupOptions } from 'rollup'
import type { IEnv } from './env'
import type { IManifest } from './manifest'

export enum PresetBuilderName {
  TS = 'ts',
  DTS = 'dts',
}

export enum DependencyCategory {
  BUILTIN = 'builtin',
  EXTERNAL = 'external',
  UNKNOWN = 'unknown',
}

export interface IRollupConfig extends RollupOptions {
  plugins: Plugin[]
}

export interface IPresetRollupConfig extends Omit<IRollupConfig, 'input' | 'output'> {}

export interface IPresetConfigBuilderContext {
  readonly env: IEnv
  readonly manifest: IManifest
  baseExternal(id: string): boolean
}

export interface IPresetConfigBuilder {
  readonly name: string

  build(ctx: IPresetConfigBuilderContext): IPresetRollupConfig | Promise<IPresetRollupConfig>
}
