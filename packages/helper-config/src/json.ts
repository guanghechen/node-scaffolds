import type { PromiseOr } from '@guanghechen/utility-types'
import type { IBaseConfigKeeperProps } from './base'
import { BaseConfigKeeper } from './base'
import type { IConfig, IConfigKeeper } from './types'

export interface IJsonConfigKeeperProps extends IBaseConfigKeeperProps {}

export abstract class JsonConfigKeeper<Instance, Data>
  extends BaseConfigKeeper<Instance, Data>
  implements IConfigKeeper<Instance>
{
  protected override stringify(data: Data): string {
    return JSON.stringify(data)
  }

  protected override encode(config: IConfig<Data>): PromiseOr<string> {
    return JSON.stringify(config, null, 2)
  }

  protected override decode(stringifiedConfig: string): PromiseOr<IConfig<Data>> {
    return JSON.parse(stringifiedConfig)
  }
}

export class PlainJsonConfigKeeper<Data>
  extends JsonConfigKeeper<Data, Data>
  implements IConfigKeeper<Data>
{
  public override readonly __version__: string = '2.0.0'
  public override readonly __compatible_version__: string = '~2.0.0'

  protected serialize(instance: Data): PromiseOr<Data> {
    return instance
  }

  protected deserialize(data: Data): PromiseOr<Data> {
    return data
  }
}
