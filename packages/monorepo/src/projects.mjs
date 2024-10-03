import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {string} WORKSPACE_ROOT
 * @param {string[]} workspaceNames
 * @returns {Promise<void>}
 */
export async function genProjects(WORKSPACE_ROOT, workspaceNames) {
  for (const workspaceName of workspaceNames) {
    /** @type {string} */
    const packagesDir = path.resolve(WORKSPACE_ROOT, workspaceName)
    if (!fs.existsSync(packagesDir) || !fs.statSync(packagesDir).isDirectory()) continue

    /** @type {string[]} */
    const packageNames = fs.readdirSync(packagesDir)
    for (const packageName of packageNames) {
      /** @type {string} */
      const projectPath = path.resolve(packagesDir, packageName, 'project.json')
      if (fs.existsSync(projectPath) && !fs.statSync(projectPath).isFile()) continue

      /** @type {boolean } */
      const isTool = /^tool-|-tool$/.test(packageName)

      /** @type {string} */
      const rollupConfigFilename = isTool ? 'rollup.config.cli.mjs' : 'rollup.config.mjs'

      /** @type {string} */
      const testsPath = path.resolve(packagesDir, packageName, '__test__')

      /** @type {boolean } */
      const hasTests = fs.existsSync(testsPath) && fs.statSync(testsPath).isDirectory()

      /** @type {string} */
      const content = genProjectJSON({ workspaceName, packageName, rollupConfigFilename, hasTests })
      fs.writeFileSync(projectPath, content, 'utf8')
    }
  }
}

/**
 * @param {import("./index.d.ts").IGenProjectJSONParams} params
 * @return {string}
 */
export function genProjectJSON(params) {
  const { rollupConfigFilename, hasTests, packageName, workspaceName } = params
  const cwd = `${workspaceName}/${packageName}`
  const sourceRoot = `${cwd}/src`

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
