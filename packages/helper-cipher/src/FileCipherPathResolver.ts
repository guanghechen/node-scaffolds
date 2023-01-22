import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'

export interface IFileCipherPathResolverProps {
  /**
   * Root directory of source files.
   */
  readonly sourceRootDir: string

  /**
   * Root directory of encrypted files.
   */
  readonly encryptedRootDir: string
}

export class FileCipherPathResolver {
  /**
   * Root directory of source files.
   */
  public readonly sourceRootDir: string

  /**
   * Root directory of encrypted files.
   */
  public readonly encryptedRootDir: string

  constructor(props: IFileCipherPathResolverProps) {
    this.sourceRootDir = props.sourceRootDir
    this.encryptedRootDir = props.encryptedRootDir
  }

  /**
   * Resolve the absolute path of a source file.
   * @param sourceFilepath
   */
  public calcAbsoluteSourceFilepath(sourceFilepath: string): string {
    const filepath = absoluteOfWorkspace(this.sourceRootDir, sourceFilepath)
    return filepath
  }

  /**
   * Resolve the absolute path of a encrypted file.
   * @param encryptedFilepath
   */
  public calcAbsoluteEncryptedFilepath(encryptedFilepath: string): string {
    const filepath = absoluteOfWorkspace(this.encryptedRootDir, encryptedFilepath)
    return filepath
  }

  /**
   * Resolve the relative path of the source file.
   * @param absoluteSourceFilepath
   */
  public calcRelativeSourceFilepath(absoluteSourceFilepath: string): string {
    const filepath = relativeOfWorkspace(this.sourceRootDir, absoluteSourceFilepath)
    return filepath.replace(/[/\\]+/g, '/')
  }

  /**
   * Resolve the relative path of a encrypted file.
   * @param absoluteEncryptedFilepath
   */
  public calcRelativeEncryptedFilepath(absoluteEncryptedFilepath: string): string {
    const filepath = relativeOfWorkspace(this.encryptedRootDir, absoluteEncryptedFilepath)
    return filepath.replace(/[/\\]+/g, '/')
  }
}
