import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import path from 'node:path'

export interface IFileCipherPathResolverProps {
  /**
   * Root directory of plain source files.
   */
  readonly plainRootDir: string

  /**
   * Root directory of encrypted files.
   */
  readonly cryptRootDir: string
}

export class FileCipherPathResolver {
  public readonly plainRootDir: string
  public readonly cryptRootDir: string

  constructor(props: IFileCipherPathResolverProps) {
    this.plainRootDir = props.plainRootDir
    this.cryptRootDir = props.cryptRootDir
  }

  /**
   * Resolve the absolute path of a plain source file.
   * @param plainFilepath
   */
  public calcAbsolutePlainFilepath(plainFilepath: string): string {
    if (path.isAbsolute(plainFilepath)) {
      invariant(
        !path.relative(this.plainRootDir, plainFilepath).startsWith('..'),
        `[calcAbsolutePlainFilepath] Not under the plainRootDir: ${plainFilepath}`,
      )
      return plainFilepath
    } else {
      const filepath = absoluteOfWorkspace(this.plainRootDir, plainFilepath)
      return filepath
    }
  }

  /**
   * Resolve the absolute path of a encrypted file.
   * @param cryptFilepath
   */
  public calcAbsoluteCryptFilepath(cryptFilepath: string): string {
    if (path.isAbsolute(cryptFilepath)) {
      invariant(
        !path.relative(this.cryptRootDir, cryptFilepath).startsWith('..'),
        `[calcAbsoluteCryptFilepath] Not under the cryptRootDir: ${cryptFilepath}`,
      )
      return cryptFilepath
    } else {
      const filepath = absoluteOfWorkspace(this.cryptRootDir, cryptFilepath)
      return filepath
    }
  }

  /**
   * Resolve the relative path of the plain source file.
   * @param absolutePlainFilepath
   */
  public calcRelativePlainFilepath(absolutePlainFilepath: string): string {
    const filepath = relativeOfWorkspace(this.plainRootDir, absolutePlainFilepath)
    invariant(
      !path.isAbsolute(filepath) && !filepath.startsWith('..'),
      `Not under the plainRootDir: ${absolutePlainFilepath}`,
    )
    return filepath.replace(/[/\\]+/g, '/')
  }

  /**
   * Resolve the relative path of a encrypted file.
   * @param absoluteCryptFilepath
   */
  public calcRelativeCryptFilepath(absoluteCryptFilepath: string): string {
    const filepath = relativeOfWorkspace(this.cryptRootDir, absoluteCryptFilepath)
    invariant(
      !path.isAbsolute(filepath) && !filepath.startsWith('..'),
      `Not under the cryptRootDir: ${absoluteCryptFilepath}`,
    )
    return filepath.replace(/[/\\]+/g, '/')
  }
}
