import type { IEnv, IManifestWithDependencies } from '../types'
import {
  builtinExternalSet,
  collectAllDependencies,
  getDefaultDependencyFields,
} from './dependency'

export async function resolveExternal(
  manifest: IManifestWithDependencies,
  env: IEnv,
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

    const m = /^([.][\s\S]*|@[^/\s]+[/][^/\s]+|[^/\s]+)/.exec(id)
    if (m == null) return false
    return externalSet.has(m[1])
  }
  return external
}
