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

  protected override async encode(config: IConfig<Data>): Promise<Buffer> {
    const { cryptBytes } = this.cipher.encryptJson(config.data)
    const savingData: IConfig<string> = {
      __version__: config.__version__,
      data: cryptBytes.toString('hex'),
    }
    const jsonContent: string = JSON.stringify(savingData)
    return Buffer.from(jsonContent, 'utf8')
  }

  protected override async decode(buffer: Buffer): Promise<IConfig<Data>> {
    const jsonContent: string = buffer.toString('utf8')
    const jsonData: IConfig<string> = JSON.parse(jsonContent)
    const cryptBytes: Buffer = Buffer.from(jsonData.data, 'hex')
    const plainData = this.cipher.decryptJson(cryptBytes) as Data
    return { __version__: jsonData.__version__, data: plainData }
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
