import { hasGitInstalled } from '@guanghechen/helper-commander'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { logger } from '../../env/logger'
import type { ICatalogCache } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { loadGitCipherContext } from '../../util/context/loadGitCipherContext'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherEncryptContext } from './context'

export class GitCipherEncryptProcessor {
  protected readonly context: IGitCipherEncryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherEncryptContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async encrypt(): Promise<void> {
    const title = 'processor.encrypt'
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

    // encrypt files
    const cacheKeeper = new CatalogCacheKeeper({
      storage: new FileStorage({
        strict: true,
        filepath: context.catalogCacheFilepath,
        encoding: 'utf8',
      }),
    })
    await cacheKeeper.load()
    const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
    const { crypt2plainIdMap } = await gitCipher.encrypt({
      cryptPathResolver,
      crypt2plainIdMap: new Map(data.crypt2plainIdMap),
      plainPathResolver,
    })
    await cacheKeeper.update({ crypt2plainIdMap })
    await cacheKeeper.save()
  }
}
