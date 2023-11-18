import type { IReporter } from '@guanghechen/reporter.types'
import fs from 'node:fs/promises'
import type { IMonorepoRewriteAbleItem } from '../types'
import { MonorepoContext } from './context'
import { MonorepoDocLinkRewriter } from './rewriter'
import { MonorepoDocScanner } from './scanner'

interface IParams {
  rootDir: string
  encoding?: BufferEncoding
  username?: string
  repository?: string
  logger?: IReporter | undefined
}

export async function resolveMonorepoDocLinkRewrite(params: IParams): Promise<void> {
  const { rootDir, username, repository, logger, encoding = 'utf8' } = params
  const context = await MonorepoContext.scanAndBuild({ rootDir, username, repository, logger })
  const scanner = new MonorepoDocScanner({ context })
  const rewriter = new MonorepoDocLinkRewriter({ context })
  const items: IMonorepoRewriteAbleItem[] = await scanner.scan()
  logger?.debug(
    'filepaths:',
    items.map(item => item.filepath),
  )
  for (const item of items) {
    const content: string = await fs.readFile(item.filepath, encoding)
    const resolvedContent: string = rewriter.rewrite(content, item.packagePath)
    if (content !== resolvedContent) {
      logger?.verbose('rewrite:', item.filepath)
    }
    await fs.writeFile(item.filepath, resolvedContent, encoding)
  }
}
