import { PlainCipherJsonConfigKeeper } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { IGitCipherConfigData } from './types'

export class GitCipherConfig
  extends PlainCipherJsonConfigKeeper<IGitCipherConfigData>
  implements IConfigKeeper<IGitCipherConfigData>
{
  public override readonly __version__ = '1.0.0'
  public override readonly __compatible_version__ = '^1.0.0'
}
