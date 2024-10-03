import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname: string = path.dirname(url.fileURLToPath(import.meta.url))
const WORKSPACE_ROOT: string = path.resolve(__dirname, '..')

const tsconfig = await import(path.resolve(WORKSPACE_ROOT, 'tsconfig.json'), {
  assert: { type: 'json' },
}).then(md => md.default)
const internals: Set<string> = new Set<string>(Object.keys(tsconfig.compilerOptions.paths))

const packageJsonFilePaths: string[] = fs
  .readdirSync(path.resolve(WORKSPACE_ROOT, 'packages'))
  .map(p => path.resolve(WORKSPACE_ROOT, 'packages', p, 'package.json'))
  .filter(p => fs.existsSync(p) && fs.statSync(p).isFile())

const dependencies: Set<string> = new Set<string>()
const devDependencies: Set<string> = new Set<string>()

for (const packageJsonFilePath of packageJsonFilePaths) {
  const packageJson = await import(packageJsonFilePath, { assert: { type: 'json' } }).then(
    md => md.default,
  )
  const rawDependencies: Record<string, string> = packageJson.dependencies ?? {}
  for (const [key, value] of Object.entries(rawDependencies)) {
    if (internals.has(key)) continue
    dependencies.add(key + '@' + value)
  }

  const rawDevDependencies: Record<string, string> = packageJson.devDependencies ?? {}
  for (const [key, value] of Object.entries(rawDevDependencies)) {
    if (internals.has(key)) continue
    devDependencies.add(key + '@' + value)
  }
}

console.log('dependencies:', Array.from(dependencies).sort())
console.log('devDependencies:', Array.from(devDependencies).sort())
