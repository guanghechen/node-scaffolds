import { isFileSync } from '@guanghechen/helper-fs'
import { escapeRegexSpecialChars } from '@guanghechen/helper-func'
import { isNonBlankString } from '@guanghechen/helper-is'
import invariant from '@guanghechen/invariant'
import { globby } from 'globby'
import path from 'node:path'
import type { ILernaJson, IPackageJson, ITopPackageJson } from '../types'
import { loadJson } from '../util'

interface IPackageItem {
  name: string
  version: string
}

interface IMonorepoContextProps {
  readonly username: string
  readonly repository: string
  readonly rootDir: string
  readonly packagePathMap: ReadonlyMap<string, IPackageItem>
  readonly isVersionIndependent: boolean
}

export class MonorepoContext {
  public readonly username: string
  public readonly repository: string
  public readonly rootDir: string
  public readonly packagePaths: ReadonlyArray<string>
  public readonly isVersionIndependent: boolean
  protected readonly packagePathMap: ReadonlyMap<string, IPackageItem>

  constructor(props: IMonorepoContextProps) {
    this.rootDir = props.rootDir
    this.username = props.username
    this.repository = props.repository
    this.packagePaths = Array.from(props.packagePathMap.keys())
    this.packagePathMap = new Map(props.packagePathMap)
    this.isVersionIndependent = props.isVersionIndependent
  }

  public static async scanAndBuild(rootDir: string): Promise<MonorepoContext> {
    const topPackageJsonPath = path.join(rootDir, 'package.json')
    const topPackageJson = await loadJson<ITopPackageJson>(topPackageJsonPath)
    const username: string | undefined =
      typeof topPackageJson.author === 'string'
        ? topPackageJson.author
        : topPackageJson.author?.name
    invariant(
      isNonBlankString(username),
      `[${this.name}] Not found valid username in ${topPackageJsonPath}`,
    )

    const rawRepository: string | undefined =
      typeof topPackageJson.repository === 'string'
        ? topPackageJson.repository
        : topPackageJson.repository?.url
    const repositoryRegex = new RegExp(
      `^https://github\\.com/${escapeRegexSpecialChars(username)}/([^/]+)`,
    )
    const repositoryMatch = rawRepository ? repositoryRegex.exec(rawRepository) : undefined
    const repository: string | undefined = repositoryMatch ? repositoryMatch[1] : undefined
    invariant(
      isNonBlankString(repository),
      `[${this.name}] Not found valid repository url in ${topPackageJsonPath}`,
    )

    const workspacesPattern: string[] = topPackageJson.workspaces ?? []
    invariant(
      Array.isArray(workspacesPattern) &&
        workspacesPattern.length > 0 &&
        workspacesPattern.every(isNonBlankString),
      `[${this.name}] Not found valid workspaces`,
    )
    const packagePaths = (
      await globby(workspacesPattern, {
        onlyDirectories: true,
        onlyFiles: false,
        expandDirectories: false,
        cwd: rootDir,
      })
    )
      .filter(packagePath => isFileSync(path.join(rootDir, packagePath, 'package.json')))
      .map(packagePath => packagePath.replace(/[/\\]+/g, '/').replace(/[/\\]$/, ''))

    const packagePathMap: Map<string, IPackageItem> = new Map() // key is <${workspace}/${packageDir}>, value is version
    for (const packagePath of packagePaths) {
      const packageJsonPath = path.join(rootDir, packagePath, 'package.json')
      const packageJson = await loadJson<IPackageJson>(packageJsonPath)
      invariant(
        isNonBlankString(packageJson.name) && isNonBlankString(packageJson.version),
        `[${this.name}] Not found valid package name or package version in ${packageJsonPath}`,
      )

      const isPrivatePackage: boolean = packageJson.private ?? false
      if (!isPrivatePackage) {
        packagePathMap.set(packagePath, {
          name: packageJson.name,
          version: packageJson.version,
        })
      }
    }

    let isVersionIndependent: boolean =
      new Set(Array.from(packagePathMap.values()).map(p => p.version)).size > 1
    if (!isVersionIndependent) {
      const lernaJsonPath: string = path.join(rootDir, 'lerna.json')
      if (isFileSync(lernaJsonPath)) {
        const lernaJson = await loadJson<ILernaJson>(lernaJsonPath)
        if (lernaJson.version === 'independent') isVersionIndependent = true
      }
    }
    return new MonorepoContext({
      username,
      repository,
      rootDir,
      packagePathMap,
      isVersionIndependent,
    })
  }

  public getTagName(packagePath: string): string | undefined {
    const packageItem = this.packagePathMap.get(packagePath)
    if (packageItem) {
      const { name, version } = packageItem
      return this.isVersionIndependent ? `${name}@${version}` : `v${version}`
    }
    return undefined
  }
}
