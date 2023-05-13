import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import minimist from 'minimist'
import path from 'node:path'
import { resolveMonorepoDocLinkRewrite } from '.'

async function run(argv: string[]): Promise<void> {
  const logger = new ChalkLogger(
    {
      name: 'doc-link-rewrite',
      level: Level.INFO,
      flights: {
        date: false,
        colorful: true,
      },
    },
    argv,
  )

  const args = minimist(argv)
  const repoType = (args.repoType ?? 'monorepo').toLowerCase()
  logger.debug('repoType:', repoType)

  switch (repoType) {
    case 'monorepo': {
      const rootDir: string = args.rootDir ?? path.resolve()
      logger.debug('rootDir:', rootDir)
      logger.debug('username:', args.username)
      logger.debug('repository:', args.repository)
      await resolveMonorepoDocLinkRewrite({
        rootDir: args.rootDir ?? path.resolve(),
        username: args.username,
        repository: args.repository,
        logger,
      })
      break
    }
    default:
      throw new Error(`Unknown repoType ${repoType}.`)
  }
}

run(process.argv.slice(2)).catch(error => {
  console.error(error)
  process.exit(1)
})
