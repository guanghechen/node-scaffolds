import fs from 'node:fs/promises'
import { MonorepoContext } from './context'
import { MonorepoDocLinkRewriter } from './rewriter'
import { MonorepoDocScanner } from './scanner'

interface IParams {
  rootDir: string
  encoding?: BufferEncoding
}

export async function resolveMonorepoDocLinkRewrite(params: IParams): Promise<void> {
  const { rootDir, encoding = 'utf8' } = params
  const context = await MonorepoContext.scanAndBuild(rootDir)
  const scanner = new MonorepoDocScanner({ context })
  const rewriter = new MonorepoDocLinkRewriter({ context })
  const filepaths: string[] = await scanner.scan()
  for (const filepath of filepaths) {
    const content: string = await fs.readFile(filepath, encoding)
    const resolvedContent: string = rewriter.rewrite(content)
    await fs.writeFile(filepath, resolvedContent, encoding)
  }
}
