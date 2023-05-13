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
}

export async function resolveMonorepoDocLinkRewrite(params: IParams): Promise<void> {
  const { rootDir, username, repository, encoding = 'utf8' } = params
  const context = await MonorepoContext.scanAndBuild({ rootDir, username, repository })
  const scanner = new MonorepoDocScanner({ context })
  const rewriter = new MonorepoDocLinkRewriter({ context })
  const items: IMonorepoRewriteAbleItem[] = await scanner.scan()
  for (const item of items) {
    const content: string = await fs.readFile(item.filepath, encoding)
    const resolvedContent: string = rewriter.rewrite(content, item.packagePath)
    await fs.writeFile(item.filepath, resolvedContent, encoding)
  }
}
