import type { ICipher } from '@guanghechen/helper-cipher'
import type { IConfig, IConfigKeeper, IJsonConfigKeeperProps } from '@guanghechen/helper-config'
import { JsonConfigKeeper } from '@guanghechen/helper-config'
import type { PromiseOr } from '@guanghechen/utility-types'

export interface ICipherJsonConfigKeeperProps extends IJsonConfigKeeperProps {
  readonly cipher: ICipher
}

export abstract class CipherJsonConfigKeeper<Instance, Data>
  extends JsonConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  public readonly cipher: ICipher

  constructor(props: ICipherJsonConfigKeeperProps) {
    super(props)
    this.cipher = props.cipher
  }

  protected override async stringify(data: Data): Promise<string> {
    const { cryptBytes } = this.cipher.encryptJson(data)
    return cryptBytes.toString('hex')
  }

  protected override async parse(content: string): Promise<Data> {
    const cryptBytes: Buffer = Buffer.from(content, 'hex')
    return this.cipher.decryptJson(cryptBytes) as Data
  }
}

export class PlainCipherJsonConfigKeeper<Data>
  extends CipherJsonConfigKeeper<Data, Data>
  implements IConfigKeeper<Data>
{
  public override readonly __version__ = '1.0.0'
  public override readonly __compatible_version__ = '^1.0.0'

  protected serialize(instance: Data): PromiseOr<Data> {
    return instance
  }
  protected deserialize(data: Data): PromiseOr<Data> {
    return data
  }
}
