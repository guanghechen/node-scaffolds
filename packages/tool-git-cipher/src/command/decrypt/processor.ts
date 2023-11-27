import { hasGitInstalled } from '@guanghechen/helper-commander'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { TextFileResource } from '@guanghechen/resource'
import type { ICatalogCache } from '../../shared/CatalogCache'
import { CatalogCacheKeeper } from '../../shared/CatalogCache'
import { reporter } from '../../shared/core/reporter'
import { SecretMaster } from '../../shared/SecretMaster'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import type { IGitCipherDecryptContext } from './context'

export class GitCipherDecryptProcessor {
  protected readonly context: IGitCipherDecryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherDecryptContext) {
    reporter.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async decrypt(): Promise<void> {
    const title = 'processor.decrypt'
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { context } = this
    const { cryptPathResolver, plainPathResolver } = context
    const { context: gitCipherContext } = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    // decrypt files
    if (context.filesAt || context.filesOnly.length > 0) {
      reporter.debug('Trying decryptFilesOnly...')
      await gitCipher.decryptFilesOnly({
        cryptCommitId: context.filesAt ?? 'HEAD',
        cryptPathResolver,
        plainPathResolver,
        filesOnly: context.filesOnly,
      })
    } else {
      reporter.debug('Trying decrypt entire repo...')

      const cacheKeeper = new CatalogCacheKeeper({
        resource: new TextFileResource({
          strict: true,
          filepath: context.catalogCacheFilepath,
          encoding: 'utf8',
        }),
      })
      await cacheKeeper.load()
      const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      const { crypt2plainIdMap } = await gitCipher.decrypt({
        cryptPathResolver,
        crypt2plainIdMap: new Map(data.crypt2plainIdMap),
        gpgSign: context.gitGpgSign,
        plainPathResolver,
      })
      await cacheKeeper.update({ crypt2plainIdMap })
      await cacheKeeper.save()
    }
  }
}
