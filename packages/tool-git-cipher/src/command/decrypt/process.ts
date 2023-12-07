import { hasGitInstalled } from '@guanghechen/helper-commander'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { TextFileResource } from '@guanghechen/resource'
import type { ICatalogCache } from '../../shared/CatalogCache'
import { CatalogCacheKeeper } from '../../shared/CatalogCache'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommandProcessor } from '../_base'
import type { IGitCipherDecryptContext } from './context'
import type { IGitCipherDecryptOption } from './option'

type O = IGitCipherDecryptOption
type C = IGitCipherDecryptContext

const clazz = 'GitCipherDecrypt'

export class GitCipherDecrypt
  extends GitCipherSubCommandProcessor<O, C>
  implements IGitCipherSubCommandProcessor<O, C>
{
  public override async process(): Promise<void> {
    const title = `${clazz}.process`
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { context, reporter } = this
    const { cryptPathResolver, plainPathResolver } = context
    const gitCipherContext = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    // decrypt files
    if (context.filesAt || context.filesOnly.length > 0) {
      reporter.debug('Trying decryptFilesOnly...')
      await gitCipher.decryptFilesOnly({
        cryptCommitId: context.filesAt ?? 'HEAD',
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
        reporter,
      })
      await cacheKeeper.load()
      const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      const { crypt2plainIdMap } = await gitCipher.decrypt({
        crypt2plainIdMap: new Map(data.crypt2plainIdMap),
        gpgSign: context.gitGpgSign,
      })
      await cacheKeeper.update({ crypt2plainIdMap })
      await cacheKeeper.save()
    }
  }
}
