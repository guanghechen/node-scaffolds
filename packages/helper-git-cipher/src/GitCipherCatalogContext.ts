import { randomBytes } from '@guanghechen/byte'
import { calcFingerprintFromFile } from '@guanghechen/cipher-catalog'
import type {
  ICipherCatalogContext,
  ICipherCatalogStat,
  IHashAlgorithm,
  IItemForGenNonce,
} from '@guanghechen/cipher-catalog.types'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import micromatch from 'micromatch'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'

interface IGitCipherCatalogContextParams {
  readonly CONTENT_HASH_ALGORITHM: IHashAlgorithm
  readonly CRYPT_FILES_DIR: string
  readonly CRYPT_PATH_SALT: string
  readonly MAX_CRYPT_FILE_SIZE: number
  readonly NONCE_SIZE: number
  readonly PART_CODE_PREFIX: string
  readonly PATH_HASH_ALGORITHM: IHashAlgorithm
  readonly integrityPatterns: string[]
  readonly keepPlainPatterns: string[]
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export class GitCipherCatalogContext implements ICipherCatalogContext {
  public readonly CONTENT_HASH_ALGORITHM: IHashAlgorithm
  public readonly CRYPT_FILES_DIR: string
  public readonly CRYPT_PATH_SALT: string
  public readonly MAX_CRYPT_FILE_SIZE: number
  public readonly NONCE_SIZE: number
  public readonly PART_CODE_PREFIX: string
  public readonly PATH_HASH_ALGORITHM: IHashAlgorithm
  public readonly cryptPathResolver: IWorkspacePathResolver
  public readonly plainPathResolver: IWorkspacePathResolver
  public readonly integrityPatterns: string[]
  public readonly keepPlainPatterns: string[]

  constructor(params: IGitCipherCatalogContextParams) {
    const {
      CONTENT_HASH_ALGORITHM,
      CRYPT_FILES_DIR,
      CRYPT_PATH_SALT,
      MAX_CRYPT_FILE_SIZE,
      NONCE_SIZE,
      PART_CODE_PREFIX,
      PATH_HASH_ALGORITHM,
      cryptPathResolver,
      plainPathResolver,
      integrityPatterns,
      keepPlainPatterns,
    } = params

    this.CONTENT_HASH_ALGORITHM = CONTENT_HASH_ALGORITHM
    this.CRYPT_FILES_DIR = CRYPT_FILES_DIR
    this.CRYPT_PATH_SALT = CRYPT_PATH_SALT
    this.MAX_CRYPT_FILE_SIZE = MAX_CRYPT_FILE_SIZE
    this.NONCE_SIZE = NONCE_SIZE
    this.PART_CODE_PREFIX = PART_CODE_PREFIX
    this.PATH_HASH_ALGORITHM = PATH_HASH_ALGORITHM
    this.cryptPathResolver = cryptPathResolver
    this.plainPathResolver = plainPathResolver
    this.integrityPatterns = integrityPatterns.slice()
    this.keepPlainPatterns = keepPlainPatterns.slice()
  }

  public async genNonce(_item: IItemForGenNonce): Promise<Uint8Array> {
    const { NONCE_SIZE } = this
    return randomBytes(NONCE_SIZE)
  }

  public async hashPlainFile(plainPath: string): Promise<string> {
    const absolutePlainPath: string = this.plainPathResolver.resolve(plainPath)
    return calcFingerprintFromFile(absolutePlainPath, this.CONTENT_HASH_ALGORITHM)
  }

  public async isCryptPathExist(cryptPath: string): Promise<boolean> {
    const absoluteCryptPath: string = this.cryptPathResolver.resolve(cryptPath)
    return existsSync(absoluteCryptPath)
  }

  public isGoodPath(cryptOrPlainPath: string): boolean {
    if (cryptOrPlainPath.length <= 0) return true
    const first: string = cryptOrPlainPath[0]

    if (first === '/') return false
    if (cryptOrPlainPath.includes('\\')) return false
    if (cryptOrPlainPath.length > 1 && cryptOrPlainPath[1] === ':') {
      if ('A' <= first && first <= 'Z') return false
      if ('a' <= first && first <= 'z') return false
    }

    return true
  }

  public async isKeepIntegrity(plainPath: string): Promise<boolean> {
    const { integrityPatterns } = this
    if (integrityPatterns.length > 0) {
      return micromatch.isMatch(plainPath, integrityPatterns, { dot: true })
    }
    return false
  }

  public async isKeepPlain(plainPath: string): Promise<boolean> {
    const { keepPlainPatterns } = this
    if (keepPlainPatterns.length > 0) {
      return micromatch.isMatch(plainPath, keepPlainPatterns, { dot: true })
    }
    return false
  }

  public async isPlainPathExist(plainPath: string): Promise<boolean> {
    const absolutePlainPath: string = this.plainPathResolver.resolve(plainPath)
    return existsSync(absolutePlainPath)
  }

  public normalizeCryptPath(filepath: string): string {
    return this.cryptPathResolver.relative(filepath, true)
  }

  public normalizePlainPath(filepath: string): string {
    return this.plainPathResolver.relative(filepath, true)
  }

  public async statCryptFile(cryptPath: string): Promise<ICipherCatalogStat | undefined> {
    const absoluteCryptPath: string = this.cryptPathResolver.resolve(cryptPath)
    if (!existsSync(absoluteCryptPath)) return undefined

    const stat = await fs.stat(absoluteCryptPath)
    if (!stat.isFile()) return undefined

    return { size: stat.size }
  }

  public async statPlainFile(plainPath: string): Promise<ICipherCatalogStat | undefined> {
    const absolutePlainPath: string = this.plainPathResolver.resolve(plainPath)
    if (!existsSync(absolutePlainPath)) return undefined

    const stat = await fs.stat(absolutePlainPath)
    if (!stat.isFile()) return undefined

    return { size: stat.size }
  }
}
