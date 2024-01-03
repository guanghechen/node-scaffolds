import { bytes2text } from '@guanghechen/byte'
import { calcCryptFilepathsWithParts } from '@guanghechen/cipher-catalog'
import { FileCipher } from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommandProcessor } from '../_base'
import type { IGitCipherCatContext } from './context'
import type { IGitCipherCatOptions } from './option'

type O = IGitCipherCatOptions
type C = IGitCipherCatContext

const clazz = 'GitCipherCat'

export class GitCipherCat
  extends GitCipherSubCommandProcessor<O, C>
  implements IGitCipherSubCommandProcessor<O, C>
{
  public override async process(): Promise<void> {
    const title = `${clazz}.process`
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { context, reporter } = this
    const { cryptPathResolver, plainPathResolver } = context

    invariant(
      existsSync(cryptPathResolver.root),
      `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.root}`,
    )
    invariant(
      isGitRepo(cryptPathResolver.root),
      `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.root}`,
    )

    const { cipherFactory } = this.secretMaster
    const gitCipherContext: IGitCipherContext = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })

    const { catalog, configKeeper } = gitCipherContext
    await configKeeper.load()

    // Print catalog config.
    if (!context.plainFilepath) {
      console.log(
        JSON.stringify(
          configKeeper.data,
          (key, value) => {
            if (key === 'authTag') {
              if (value?.type === 'Buffer') return Buffer.from(value).toString('hex')
              if (value instanceof Uint8Array) return bytes2text(value, 'hex')
            }
            return value
          },
          2,
        ),
      )
      return
    }

    // Print plain file content.
    const plainFilepath = plainPathResolver.relative(context.plainFilepath)
    const item = configKeeper.data?.catalog.items.find(item => item.plainFilepath === plainFilepath)
    invariant(!!item, `[${title}] Cannot find plainFilepath ${context.plainFilepath}.`)

    const cryptFilepath: string = catalog.calcCryptPath(plainPathResolver.relative(plainFilepath))
    const cryptFilepaths: string[] = calcCryptFilepathsWithParts(
      cryptPathResolver.resolve(cryptFilepath),
      item.cryptFilepathParts,
    )

    const iv: Readonly<Uint8Array | undefined> = await catalog.calcIv(item)
    const fileCipher = new FileCipher({
      cipher: cipherFactory!.cipher({ iv }),
      reporter,
    })
    const plainContentBuffer: Uint8Array = await fileCipher.decryptFromFiles(cryptFilepaths, {
      authTag: item.authTag,
    })
    const plainContent: string = bytes2text(plainContentBuffer, 'utf8')
    console.log(plainContent)
  }
}
