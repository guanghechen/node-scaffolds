import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const packages = fs.readdirSync(path.resolve('packages'))
const cliProjectConfig = fs.readFileSync(
  path.resolve(__dirname, '../node-scaffolds/packages/cli/project.json'),
  'utf8',
)
for (const packageName of packages) {
  const projectPath = path.resolve('packages', packageName, 'project.json')
  if (fs.existsSync(projectPath)) {
    const content = cliProjectConfig.replace(/cli/g, packageName)
    fs.writeFileSync(projectPath, content, 'utf8')
  }
}
