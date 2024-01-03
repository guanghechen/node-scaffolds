import type { IBatchDisposable } from '@guanghechen/disposable.types'
import type { IReadonlyCipherCatalog } from './catalog.readonly'
import type { ICatalogDiffItem } from './diff-item'
import type { ICatalogItem } from './item'
import type { ICipherCatalogMonitor, IUnMonitorCipherCatalog } from './monitor'

export interface ICipherCatalog extends IReadonlyCipherCatalog, IBatchDisposable {
  /**
   * Apply catalog diffs.
   */
  applyDiff(diffItems: ReadonlyArray<ICatalogDiffItem>): void

  /**
   * Monitor the catalog change.
   * @param monitor
   */
  monitor(monitor: Partial<ICipherCatalogMonitor>): IUnMonitorCipherCatalog

  /**
   * Clear the catalog items and init with the new given items.
   */
  reset(items?: Iterable<ICatalogItem>): void
}
