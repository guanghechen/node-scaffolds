import type { ICipherCatalogMonitor } from '@guanghechen/cipher-catalog'
import {
  CatalogItemChangeType,
  diffFromCatalogItems,
  diffFromPlainFiles,
} from '@guanghechen/cipher-catalog'
import type {
  ICatalogDiffItem,
  ICatalogDiffItemCombine,
  ICatalogItem,
  ICipherCatalog,
  ICipherCatalogContext,
  IDraftCatalogDiffItem,
  IUnMonitorCipherCatalog,
} from '@guanghechen/cipher-catalog.types'
import { BatchDisposable, Disposable } from '@guanghechen/disposable'
import type { IBatchDisposable, IDisposable } from '@guanghechen/disposable'
import { type IMonitor, Monitor } from '@guanghechen/monitor'
import { ReadonlyFileCipherCatalog } from './FileCipherCatalog.readonly'

type IParametersOfOnItemChanged = Parameters<ICipherCatalogMonitor['onItemChanged']>

export class FileCipherCatalog
  extends ReadonlyFileCipherCatalog
  implements ICipherCatalog, IBatchDisposable
{
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
  public override get items(): Iterable<ICatalogItem> {
    return this.#itemMap.values()
  }

  // @override
  public applyDiff(diffItems: ReadonlyArray<ICatalogDiffItem>): void {
    const itemMap = this.#itemMap
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as ICatalogDiffItemCombine
      if (oldItem) {
        const key: string = this.normalizePlainPath(oldItem.plainPath)
        itemMap.delete(key)
      }
      if (newItem) {
        const key: string = this.normalizePlainPath(newItem.plainPath)
        itemMap.set(key, {
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
    this._monitorItemChanged.notify({
      type: CatalogItemChangeType.APPLY_DIFF,
      diffItems,
    })
  }

  // @override
  public diffFromCatalogItems(newItems: Iterable<ICatalogItem>): ICatalogDiffItem[] {
    return diffFromCatalogItems(this.#itemMap, newItems)
  }

  // @override
  public diffFromPlainFiles(
    plainFilepaths: string[],
    strickCheck: boolean,
  ): Promise<IDraftCatalogDiffItem[]> {
    return diffFromPlainFiles(this, this.#itemMap, plainFilepaths, strickCheck)
  }

  // @override
  public override find(filter: (item: ICatalogItem) => boolean): ICatalogItem | undefined {
    for (const item of this.#itemMap.values()) {
      if (filter(item)) return item
    }
    return undefined
  }

  // @override
  public override get(plainPath: string): ICatalogItem | undefined {
    const key: string = this.normalizePlainPath(plainPath)
    return this.#itemMap.get(key)
  }

  // @override
  public override has(plainPath: string): boolean {
    const key: string = this.normalizePlainPath(plainPath)
    return this.#itemMap.has(key)
  }

  // @override
  public override monitor(monitor: Partial<ICipherCatalogMonitor>): IUnMonitorCipherCatalog {
    const { onItemChanged } = monitor
    const unsubscribeOnItemChanged = this._monitorItemChanged.subscribe(onItemChanged)
    return (): void => {
      unsubscribeOnItemChanged()
    }
  }

  // @override
  public reset(items?: Iterable<ICatalogItem>): void {
    const itemMap = this.#itemMap
    itemMap.clear()
    if (items) {
      for (const item of items) {
        const key: string = this.normalizePlainPath(item.plainPath)
        itemMap.set(key, item)
      }
    }
    this._monitorItemChanged.notify({ type: CatalogItemChangeType.RESET })
  }
}
