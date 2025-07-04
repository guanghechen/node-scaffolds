import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {string} WORKSPACE_ROOT
 * @param {string[]} workspaceNames
 * @returns {Promise<import("./index.d.ts").IDepsInfo>}
 */
export async function checkDepsInfo(WORKSPACE_ROOT, workspaceNames) {
  const dependencies = new Set()
  const devDependencies = new Set()

  for (const workspaceName of workspaceNames) {
    const packagesDir = path.resolve(WORKSPACE_ROOT, workspaceName)
    const tsconfig = await import(path.resolve(WORKSPACE_ROOT, 'tsconfig.json'), {
      with: { type: 'json' },
    }).then(md => md.default)

    const internals = new Set(Object.keys(tsconfig.compilerOptions.paths))
    const packageJsonFilePaths = fs
      .readdirSync(packagesDir)
      .map(p => path.resolve(packagesDir, p, 'package.json'))
      .filter(p => fs.existsSync(p) && fs.statSync(p).isFile())

    for (const packageJsonFilePath of packageJsonFilePaths) {
      const packageJson = await import(packageJsonFilePath, { with: { type: 'json' } }).then(
        md => md.default,
      )

      /** @type {Record<string, string>} */
      const rawDependencies = packageJson.dependencies ?? {}
      for (const [key, value] of Object.entries(rawDependencies)) {
        if (internals.has(key)) continue
        dependencies.add(key + '@' + value)
      }

      /** @type {Record<string, string>} */
      const rawDevDependencies = packageJson.devDependencies ?? {}
      for (const [key, value] of Object.entries(rawDevDependencies)) {
        if (internals.has(key)) continue
        devDependencies.add(key + '@' + value)
      }
    }
  }

  /** @type {import("./index.d.ts").IDepsInfo} */
  const infos = {
    dependencies: Array.from(dependencies).sort(),
    devDependencies: Array.from(devDependencies).sort(),
  }
  return infos
}
