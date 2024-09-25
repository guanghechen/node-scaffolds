import type { ITextTransformer } from '../types'
import { escapeRegexSpecialChars, tagNamePattern } from '../util'
import type { MonorepoContext } from './context'

interface IMonorepoDocLinkRewriterProps {
  context: Readonly<MonorepoContext>
}

export class MonorepoDocLinkRewriter {
  public readonly context: Readonly<MonorepoContext>
  protected readonly usernamePattern: string
  protected readonly repositoryPattern: string
  protected readonly packagePathPattern: string
  protected readonly staticTransforms: ITextTransformer[] = []

  constructor(props: IMonorepoDocLinkRewriterProps) {
    this.context = props.context
    this.usernamePattern = escapeRegexSpecialChars(this.context.username)
    this.repositoryPattern = escapeRegexSpecialChars(this.context.repository)
    this.packagePathPattern = this.context.packagePaths
      .map(p => escapeRegexSpecialChars(p))
      .join('|')
    this.staticTransforms = [this.getRepoLinkTransform(), this.getRawContentLinkTransform()]
  }

  public rewrite(text: string, packagePath: string): string {
    const transforms: ITextTransformer[] = [
      ...this.staticTransforms,
      this.getRepoUrlTransform(packagePath),
    ]
    return transforms.reduce((acc, transform) => transform(acc), text)
  }

  // "url": "https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x"
  protected getRepoUrlTransform = (packagePath: string): ITextTransformer => {
    const { context, usernamePattern, repositoryPattern } = this
    const regex = new RegExp(
      `"url":\\s*"https://github\\.com/${usernamePattern}/${repositoryPattern}/tree/(?<tagName>${tagNamePattern})"`,
      'g',
    )
    return text =>
      text.replace(regex, (substring, tagName) => {
        /* c8 ignore start */
        const nextTagName: string = context.getTagName(packagePath) ?? tagName
        /* c8 ignore stop */
        return substring.replace(tagName, nextTagName)
      })
  }

  // https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/packages/rollup-plugin-copy#readme
  protected getRepoLinkTransform = (): ITextTransformer => {
    const { context, usernamePattern, repositoryPattern, packagePathPattern } = this
    const regex = new RegExp(
      `\\bhttps://github\\.com/${usernamePattern}/${repositoryPattern}/tree/(?<tagName>${tagNamePattern})/(?<packagePath>${packagePathPattern})`,
      'g',
    )
    return text =>
      text.replace(regex, (substring, tagName, packagePath) => {
        /* c8 ignore start */
        const nextTagName: string = context.getTagName(packagePath) ?? tagName
        /* c8 ignore stop */
        return substring.replace(tagName, nextTagName)
      })
  }

  // https://raw.githubusercontent.com/guanghechen/node-scaffolds/release-6.x.x/packages/chalk-logger/screenshots/demo1.1.png
  protected getRawContentLinkTransform = (): ITextTransformer => {
    const { context, usernamePattern, repositoryPattern, packagePathPattern } = this
    const regex = new RegExp(
      `\\bhttps://raw\\.githubusercontent\\.com/${usernamePattern}/${repositoryPattern}/(?<tagName>${tagNamePattern})/(?<packagePath>${packagePathPattern})`,
      'g',
    )
    return text =>
      text.replace(regex, (substring, tagName, packagePath) => {
        /* c8 ignore start */
        const nextTagName: string = context.getTagName(packagePath) ?? tagName
        /* c8 ignore stop */
        return substring.replace(tagName, nextTagName)
      })
  }
}
