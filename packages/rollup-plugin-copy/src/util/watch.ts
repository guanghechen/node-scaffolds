import chokidar from 'chokidar'
import path from 'path'
import type { IConfigTarget, ICopyTargetItem } from '../types'
import { copySingleItem } from './copy'

export class CopyWatcher {
  public readonly resolvePath: (filepath: string) => string
  protected readonly srcMap: Map<string, ICopyTargetItem>
  protected readonly watchedPatterns: Set<string[]>
  protected readonly watcher: chokidar.FSWatcher
  protected readonly workspace: string
  protected _isClosed: boolean

  constructor(workspace: string) {
    const resolvePath = (filepath: string): string => {
      const srcPath = path.resolve(workspace, filepath)
      return srcPath
    }

    const srcMap: Map<string, ICopyTargetItem> = new Map()

    const watcher: chokidar.FSWatcher = chokidar.watch(workspace, {
      cwd: workspace,
      ignoreInitial: true,
    })

    watcher.on('all', function (_event, filepath) {
      const srcPath = resolvePath(filepath)
      const item = srcMap.get(srcPath)
      if (item) {
        void copySingleItem(item)
      }
    })

    this.resolvePath = resolvePath
    this.workspace = workspace
    this.srcMap = srcMap
    this.watcher = watcher
    this.watchedPatterns = new Set()
    this._isClosed = false
  }

  public watchTargets(targets: ReadonlyArray<IConfigTarget>): this {
    if (this._isClosed) return this

    const { watcher, watchedPatterns } = this
    for (const target of targets) {
      if (!watchedPatterns.has(target.src)) {
        watchedPatterns.add(target.src)
        watcher.add(target.src)
      }
    }
    return this
  }

  public watchCopyTargets(copyTargets: ReadonlyArray<ICopyTargetItem>): this {
    const { srcMap } = this
    for (const target of copyTargets) {
      const srcPath = this.resolvePath(target.srcPath)
      srcMap.set(srcPath, target)
    }
    return this
  }

  public async close(): Promise<void> {
    if (this._isClosed) return

    try {
      this._isClosed = true
      await this.watcher.close()
      this.srcMap.clear()
      this.watchedPatterns.clear()
    } catch (error) {
      this._isClosed = false
      throw error
    }
  }
}
