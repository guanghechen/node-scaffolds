import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

async function deps() {
  const WORKSPACE_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
  const workspaceNames = ['packages']

  const dependencies = new Set()
  const devDependencies = new Set()

  for (const workspaceName of workspaceNames) {
    const packagesDir = path.resolve(WORKSPACE_ROOT, workspaceName)
    const tsconfig = await import(path.resolve(WORKSPACE_ROOT, 'tsconfig.json'), {
      assert: { type: 'json' },
    }).then(md => md.default)

    const internals = new Set(Object.keys(tsconfig.compilerOptions.paths))
    const packageJsonFilePaths = fs
      .readdirSync(packagesDir)
      .map(p => path.resolve(packagesDir, p, 'package.json'))
      .filter(p => fs.existsSync(p) && fs.statSync(p).isFile())

    for (const packageJsonFilePath of packageJsonFilePaths) {
      const packageJson = await import(packageJsonFilePath, { assert: { type: 'json' } }).then(
        md => md.default,
      )
      const rawDependencies = packageJson.dependencies ?? {}
      for (const [key, value] of Object.entries(rawDependencies)) {
        if (internals.has(key)) continue
        dependencies.add(key + '@' + value)
      }
      const rawDevDependencies = packageJson.devDependencies ?? {}
      for (const [key, value] of Object.entries(rawDevDependencies)) {
        if (internals.has(key)) continue
        devDependencies.add(key + '@' + value)
      }
    }
  }

  return {
    dependencies: Array.from(dependencies).sort(),
    devDependencies: Array.from(devDependencies).sort(),
  }
}

console.log(await deps())
