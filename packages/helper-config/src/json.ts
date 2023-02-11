import type { PromiseOr } from '@guanghechen/utility-types'
import type { IBaseConfigKeeperProps } from './base'
import { BaseConfigKeeper } from './base'
import type { IConfig, IConfigKeeper } from './types'

export interface IJsonConfigKeeperProps extends IBaseConfigKeeperProps {
  filepath: string
}

export abstract class JsonConfigKeeper<Instance, Data>
  extends BaseConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  constructor(props: IJsonConfigKeeperProps) {
    super(props)
  }

  protected override encode(config: IConfig<Data>): PromiseOr<Buffer> {
    const jsonContent: string = JSON.stringify(config)
    return Buffer.from(jsonContent, 'utf8')
  }

  protected override decode(buffer: Buffer): PromiseOr<IConfig<Data>> {
    const jsonContent: string = buffer.toString('utf8')
    const jsonData = JSON.parse(jsonContent) as IConfig<Data>
    return jsonData
  }
}

export class PlainJsonConfigKeeper<Data>
  extends JsonConfigKeeper<Data, Data>
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
