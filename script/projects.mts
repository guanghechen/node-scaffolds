import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname: string = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')

const workspaceNames: string[] = ['packages']
for (const workspaceName of workspaceNames) {
  const packagesDir: string = path.resolve(__dirname, workspaceName)
  if (!fs.existsSync(packagesDir) || !fs.statSync(packagesDir).isDirectory()) continue

  const packageNames: string[] = fs.readdirSync(packagesDir)
  for (const packageName of packageNames) {
    const projectPath: string = path.resolve(packagesDir, packageName, 'project.json')
    if (fs.existsSync(projectPath) && !fs.statSync(projectPath).isFile()) continue

    const testsPath: string = path.resolve(packagesDir, packageName, '__test__')
    const hasTests: boolean = fs.existsSync(testsPath) && fs.statSync(testsPath).isDirectory()

    const isTool: boolean = /^tool-|-tool$/.test(packageName)
    const content: string = genProjectJSON({ workspaceName, packageName, hasTests, isTool })
    fs.writeFileSync(projectPath, content, 'utf8')
  }
}

function genProjectJSON(data: {
  workspaceName: string
  packageName: string
  hasTests: boolean
  isTool: boolean
}): string {
  const { workspaceName, packageName, hasTests, isTool } = data
  const rollupConfigFilename: string = isTool ? 'rollup.config.cli.mjs' : 'rollup.config.mjs'
  const cwd: string = `${workspaceName}/${packageName}`
  const sourceRoot: string = `${cwd}/src`

  const json = {
    $schema: '../../node_modules/nx/schemas/project-schema.json',
    name: packageName,
    sourceRoot,
    projectType: 'library',
    tags: [],
    targets: {
      clean: {
        executor: 'nx:run-commands',
        options: {
          cwd,
          parallel: false,
          commands: ['rimraf lib'],
        },
      },
      build: {
        executor: 'nx:run-commands',
        dependsOn: ['clean', '^build'],
        options: {
          cwd,
          parallel: false,
          commands: [`rollup -c ../../${rollupConfigFilename}`],
          env: {
            NODE_ENV: 'production',
            ROLLUP_SHOULD_SOURCEMAP: 'true',
          },
        },
        configurations: {
          production: {
            env: {
              NODE_ENV: 'production',
              ROLLUP_SHOULD_SOURCEMAP: 'false',
            },
          },
        },
      },
      watch: {
        executor: 'nx:run-commands',
        options: {
          cwd,
          parallel: false,
          commands: [`rollup -c ../../${rollupConfigFilename} -w`],
          env: {
            NODE_ENV: 'development',
            ROLLUP_SHOULD_SOURCEMAP: 'true',
          },
        },
      },
      test: hasTests
        ? {
            executor: 'nx:run-commands',
            options: {
              cwd,
              commands: [
                'node --experimental-vm-modules ../../node_modules/.bin/jest --config ../../jest.config.mjs --rootDir .',
              ],
            },
            configurations: {
              coverage: {
                commands: [
                  'node --experimental-vm-modules ../../node_modules/.bin/jest --config ../../jest.config.mjs --rootDir . --coverage',
                ],
              },
              update: {
                commands: [
                  'node --experimental-vm-modules ../../node_modules/.bin/jest --config ../../jest.config.mjs --rootDir . -u',
                ],
              },
            },
          }
        : undefined,
    },
  }
  return JSON.stringify(json, null, 2)
}
