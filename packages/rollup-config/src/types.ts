import type { RollupCommonJSOptions as CommonJSOptions } from '@rollup/plugin-commonjs'
import type { RollupJsonOptions as JsonOptions } from '@rollup/plugin-json'
import type { RollupNodeResolveOptions as NodeResolveOptions } from '@rollup/plugin-node-resolve'
import type { RPT2Options as TypescriptOptions } from 'rollup-plugin-typescript2'

export type { RPT2Options as TypescriptOptions } from 'rollup-plugin-typescript2'
export type { RollupCommonJSOptions as CommonJSOptions } from '@rollup/plugin-commonjs'
export type { RollupJsonOptions as JsonOptions } from '@rollup/plugin-json'
export type { RollupNodeResolveOptions as NodeResolveOptions } from '@rollup/plugin-node-resolve'

/**
 * Params for creating a rollup config.
 */
export interface RollupConfigOptions {
  /**
   * Main input / output options.
   */
  manifest: RollupManifestOptions
  /**
   * Options of the builtin plugin by the @guanghechen/rollup-config.
   */
  pluginOptions?: RollupPluginOptions
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

/**
 * Input / Output main options.
 */
export interface RollupManifestOptions {
  /**
   * Source entry file.
   */
  source: string
  /**
   * Target entry file for cjs bundles.
   */
  main?: string
  /**
   * Target entry file for es bundles.
   */
  module?: string
  /**
   * Dependency list.
   */
  dependencies?: Record<string, string>
  /**
   * Optional dependency list.
   */
  optionalDependencies?: Record<string, string>
  /**
   * Peer dependency list.
   */
  peerDependencies?: Record<string, string>
}

/**
 * Options of the builtin plugins.
 */
export interface RollupPluginOptions {
  /**
   * options for @rollup/plugin-commonjs
   */
  commonjsOptions?: CommonJSOptions
  /**
   * options for @rollup/plugin-json
   */
  jsonOptions?: JsonOptions
  /**
   * options for @rollup/plugin-node-resolve
   */
  nodeResolveOptions?: NodeResolveOptions
  /**
   * options for rollup-plugin-typescript2
   */
  typescriptOptions?: TypescriptOptions
}
