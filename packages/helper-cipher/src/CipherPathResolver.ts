import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'

export interface ICipherPathResolverProps {
  /**
   * Root directory of source files.
   */
  readonly sourceRootDir: string

  /**
   * Root directory of target files.
   */
  readonly targetRootDir: string
}

export class CipherPathResolver {
  /**
   * Root directory of source files.
   */
  public readonly sourceRootDir: string

  /**
   * Root directory of target files.
   */
  public readonly targetRootDir: string

  constructor(props: ICipherPathResolverProps) {
    this.sourceRootDir = props.sourceRootDir
    this.targetRootDir = props.targetRootDir
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
   * Resolve the absolute path of a target file.
   * @param targetFilepath
   */
  public calcAbsoluteTargetFilepath(targetFilepath: string): string {
    const filepath = absoluteOfWorkspace(this.targetRootDir, targetFilepath)
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
   * Resolve the relative path of a target file.
   * @param absoluteTargetFilepath
   */
  public calcRelativeTargetFilepath(absoluteTargetFilepath: string): string {
    const filepath = relativeOfWorkspace(this.targetRootDir, absoluteTargetFilepath)
    return filepath.replace(/[/\\]+/g, '/')
  }
}
