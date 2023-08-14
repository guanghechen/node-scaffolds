import { collectAllDependencies, getDefaultDependencyFields } from '@guanghechen/helper-npm'
import type { IEnv, IManifestWithDependencies } from './types'

const builtinModules = [
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
]

const builtinExternals: ReadonlyArray<string> = builtinModules.concat(['glob', 'sync'])
export const builtinExternalSet: ReadonlySet<string> = new Set<string>(builtinExternals)

export async function resolveExternal(
  manifest: IManifestWithDependencies,
  env: IEnv,
  additionalExternal: ((id: string) => boolean) | undefined,
): Promise<(id: string) => boolean> {
  const dependencyFields = getDefaultDependencyFields()
  let dependencies: string[] = dependencyFields.reduce((acc, key) => {
    const deps = manifest[key] as Record<string, string> | string[]
    const result: string[] = Array.isArray(deps) ? deps : Object.keys(deps || {})
    return acc.concat(result)
  }, [] as string[])

  if (env.externalAll) {
    dependencies = await collectAllDependencies(null, dependencyFields, dependencies, () => true)
  }
  const externalSet = new Set(dependencies)

  const external = (id: string): boolean => {
    if (builtinExternalSet.has(id)) return true
    if (/^node:[\w\S]+$/.test(id)) return true
    if (additionalExternal && additionalExternal(id)) return true

    const m = /^([.][\s\S]*|@[^/\s]+[/][^/\s]+|[^/\s]+)/.exec(id)
    if (m == null) return false
    return externalSet.has(m[1])
  }
  return external
}
