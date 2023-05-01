import { hasGitInstalled } from '@guanghechen/helper-commander'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { logger } from '../../core/logger'
import type { ICatalogCache } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { loadGitCipherContext } from '../../util/context/loadGitCipherContext'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherDecryptContext } from './context'

export class GitCipherDecryptProcessor {
  protected readonly context: IGitCipherDecryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherDecryptContext) {
    logger.debug('context:', context)

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
    const { context: gitCipherContext } = await loadGitCipherContext({
      cryptRootDir: context.cryptRootDir,
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    const plainPathResolver = new FilepathResolver(context.plainRootDir)
    const cryptPathResolver = new FilepathResolver(context.cryptRootDir)

    // decrypt files
    if (context.filesAt || context.filesOnly.length > 0) {
      logger.debug('Trying decryptFilesOnly...')
      await gitCipher.decryptFilesOnly({
        cryptCommitId: context.filesAt ?? 'HEAD',
        cryptPathResolver,
        plainPathResolver,
        filesOnly: context.filesOnly,
      })
    } else {
      logger.debug('Trying decrypt entire repo...')

      const cacheKeeper = new CatalogCacheKeeper({
        storage: new FileStorage({
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
