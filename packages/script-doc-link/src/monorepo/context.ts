import invariant from '@guanghechen/invariant'
import path from 'node:path'
import { escapeRegexSpecialChars } from 'packages/helper-func/lib/types'
import type { ITopPackageJson } from '../types'
import { loadJson } from '../util'

interface IMonorepoContextProps {
  readonly username: string
  readonly repository: string
  readonly workspaces: string[]
}

export class MonorepoContext {
  public readonly username: string
  public readonly repository: string
  public readonly workspaces: ReadonlyArray<string>
  protected readonly versionMap: Map<string, string> //

  constructor(props: IMonorepoContextProps) {
    this.versionMap = new Map()
    this.username = props.username
    this.repository = props.repository
    this.workspaces = props.workspaces
  }

  public static async scanAndBuild(rootDir: string): Promise<MonorepoContext> {
    const topPackageJsonPath = path.join(rootDir, 'package.json')
    const topPackageJson = await loadJson<ITopPackageJson>(topPackageJsonPath)
    const username: string | undefined =
      typeof topPackageJson.author === 'string'
        ? topPackageJson.author
        : topPackageJson.author?.name
    invariant(!!username, `[${this.name}] Not found valid username in ${topPackageJsonPath}`)

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
      !!repository,
      `[${this.name}] Not found valid repository url in ${topPackageJsonPath}`,
    )

    // FIXME: resolve all possible workspaces.
    return new MonorepoContext({ username, repository, workspaces: [] })
  }

  public getTagName(workspace: string, packageDirName: string): string | undefined {
    const version = this.versionMap.get(packageDirName)
    if (version) return this.generateTagNameFromVersion(version, workspace, packageDirName)
    return undefined
  }

  protected generateTagNameFromVersion(
    version: string,
    workspace: string,
    packageDirName: string,
  ): string {
    // FIXME: resolve the tagName from version
    return ''
  }
}
