import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import minimist from 'minimist'
import path from 'node:path'
import { resolveMonorepoDocLinkRewrite } from '.'

async function run(argv: string[]): Promise<void> {
  const reporter = new ChalkLogger(
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
  reporter.debug('repoType:', repoType)

  switch (repoType) {
    case 'monorepo': {
      const rootDir: string = args.rootDir ?? path.resolve()
      reporter.debug('rootDir:', rootDir)
      reporter.debug('username:', args.username)
      reporter.debug('repository:', args.repository)
      await resolveMonorepoDocLinkRewrite({
        rootDir: args.rootDir ?? path.resolve(),
        username: args.username,
        repository: args.repository,
        reporter,
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
