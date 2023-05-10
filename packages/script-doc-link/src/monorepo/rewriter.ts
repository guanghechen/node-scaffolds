import invariant from '@guanghechen/invariant'
import { escapeRegexSpecialChars } from 'packages/helper-func/lib/types'
import type { IDocLinkRewriter, ITextTransformer } from '../types'
import type { MonorepoContext } from './context'

interface IMonorepoDocLinkRewriterProps {
  context: Readonly<MonorepoContext>
}

export class MonorepoDocLinkRewriter implements IDocLinkRewriter {
  public readonly context: Readonly<MonorepoContext>
  protected readonly transforms: ITextTransformer[] = []

  constructor(props: IMonorepoDocLinkRewriterProps) {
    this.context = props.context
    this.transforms = [this.getRepoLinkTransform(), this.getRawContentLinkTransform()]
  }

  public rewrite(text: string): string {
    return this.transforms.reduce((acc, transform) => transform(acc), text)
  }

  // https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/rollup-plugin-copy#readme
  protected getRepoLinkTransform = (): ITextTransformer => {
    const { context } = this
    const usernamePattern = escapeRegexSpecialChars(context.username)
    const repositoryPattern = escapeRegexSpecialChars(context.repository)
    const workspacePattern = context.workspaces.map(escapeRegexSpecialChars).join('|')
    const regex = new RegExp(
      `\bhttps://github\\.com/${usernamePattern}/${repositoryPattern}/tree/(?<tagName>[^/]+)/(?<workspace>${workspacePattern})/(?<packageDirName>[\\w.-]+)`,
      'g',
    )
    return text =>
      text.replace(regex, ([substring, tagName, workspace, packageDirName]) => {
        const nextTagName: string = context.getTagName(workspace, packageDirName) ?? tagName
        return substring.replace(tagName, nextTagName)
      })
  }

  // https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-5.x.x/packages/chalk-logger/screenshots/demo1.1.png
  protected getRawContentLinkTransform = (): ITextTransformer => {
    const { context } = this
    const usernamePattern = escapeRegexSpecialChars(context.username)
    const repositoryPattern = escapeRegexSpecialChars(context.repository)
    const workspacePattern = context.workspaces.map(escapeRegexSpecialChars).join('|')
    const regex = new RegExp(
      `\bhttps://raw\\.githubusercontent\\.com/${usernamePattern}/${repositoryPattern}/(?<tagName>[^/]+)/(?<workspace>${workspacePattern})/(?<packageDirName>[\\w.-]+)`,
      'g',
    )
    return text =>
      text.replace(regex, ([substring, tagName, workspace, packageDirName]) => {
        const nextTagName: string = context.getTagName(workspace, packageDirName) ?? tagName
        return substring.replace(tagName, nextTagName)
      })
  }
}
