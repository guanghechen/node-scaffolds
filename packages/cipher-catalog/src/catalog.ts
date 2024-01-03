import { CatalogItemChangeType } from '@guanghechen/cipher-catalog.types'
import type {
  ICatalogDiffItem,
  ICatalogDiffItemCombine,
  ICatalogItem,
  ICipherCatalog,
  ICipherCatalogContext,
  ICipherCatalogMonitor,
  IUnMonitorCipherCatalog,
} from '@guanghechen/cipher-catalog.types'
import { BatchDisposable, Disposable } from '@guanghechen/disposable'
import type { IBatchDisposable, IDisposable } from '@guanghechen/disposable'
import type { IMonitor } from '@guanghechen/monitor'
import { Monitor } from '@guanghechen/monitor'
import { ReadonlyCipherCatalog } from './catalog.readonly'

type IParametersOfOnItemChanged = Parameters<ICipherCatalogMonitor['onItemChanged']>

export class CipherCatalog extends ReadonlyCipherCatalog implements ICipherCatalog {
  readonly #itemMap: Map<string, ICatalogItem>
  protected readonly _batchDisposable: IBatchDisposable
  protected readonly _monitorItemChanged: IMonitor<IParametersOfOnItemChanged>

  constructor(context: ICipherCatalogContext) {
    super(context)

    const batchDisposable: IBatchDisposable = new BatchDisposable()
    const monitorItemChanged: IMonitor<IParametersOfOnItemChanged> =
      new Monitor<IParametersOfOnItemChanged>('onItemChanged')
    batchDisposable.registerDisposable(Disposable.fromCallback(() => monitorItemChanged.destroy()))

    this.#itemMap = new Map()
    this._batchDisposable = batchDisposable
    this._monitorItemChanged = monitorItemChanged
  }

  protected override get itemMap(): ReadonlyMap<string, ICatalogItem> {
    return this.#itemMap
  }

  // @override
  public get disposed(): boolean {
    return this._batchDisposable.disposed
  }

  // @override
  public dispose(): void {
    this._batchDisposable.dispose()
  }

  public registerDisposable<T extends IDisposable>(disposable: T): void {
    this._batchDisposable.registerDisposable(disposable)
  }

  // @override
  public applyDiff(diffItems: ReadonlyArray<ICatalogDiffItem>): void {
    const itemMap = this.#itemMap
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as ICatalogDiffItemCombine
      if (oldItem) {
        itemMap.delete(oldItem.plainPath)
      }
      if (newItem) {
        itemMap.set(newItem.plainPath, {
          plainPath: newItem.plainPath,
          cryptPath: newItem.cryptPath,
          cryptPathParts: newItem.cryptPathParts,
          fingerprint: newItem.fingerprint,
          keepIntegrity: newItem.keepIntegrity,
          keepPlain: newItem.keepPlain,
          nonce: newItem.nonce,
          authTag: newItem.authTag,
          ctime: newItem.ctime,
          mtime: newItem.mtime,
          size: newItem.size,
        })
      }
    }
    this._monitorItemChanged.notify({ type: CatalogItemChangeType.APPLY_DIFF, diffItems })
  }

  // @override
  public monitor(monitor: Partial<ICipherCatalogMonitor>): IUnMonitorCipherCatalog {
    const { onItemChanged } = monitor
    const unsubscribeOnItemChanged = this._monitorItemChanged.subscribe(onItemChanged)
    return unsubscribeOnItemChanged
  }

  // @override
  public reset(items?: Iterable<ICatalogItem>): void {
    const itemMap = this.#itemMap
    itemMap.clear()
    if (items) {
      for (const item of items) itemMap.set(item.plainPath, item)
    }
    this._monitorItemChanged.notify({ type: CatalogItemChangeType.RESET })
  }
}
