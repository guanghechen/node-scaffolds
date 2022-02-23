import chalk from 'chalk'
import chokidar from 'chokidar'
import micromatch from 'micromatch'
import type { IConfigTarget, ICopyTargetItem } from '../types'
import { collectCopyTargets } from './common'
import { copySingleItem } from './copy'
import { logger } from './logger'
import { relativePath, resolvePath } from './path'

export class CopyWatcher {
  public readonly isMatch: (filepath: string, patterns: string[]) => boolean
  protected readonly watchedPatterns: Set<string[]>
  protected readonly watcher: chokidar.FSWatcher
  protected readonly workspace: string
  protected targets: ReadonlyArray<IConfigTarget>
  protected copying: boolean
  protected _isClosed: boolean

  constructor(workspace: string) {
    const isMatch = (filepath: string, patterns: string[]): boolean => {
      const srcPath: string = relativePath(workspace, filepath)
      return micromatch.isMatch(srcPath, patterns, { dot: true })
    }

    const watcher: chokidar.FSWatcher = chokidar.watch(workspace, {
      cwd: workspace,
      ignoreInitial: true,
      // See https://stackoverflow.com/a/65044648
      awaitWriteFinish: {
        stabilityThreshold: 500,
      },
    })

    watcher.on('all', (_event, filepath): void => {
      const srcPath = resolvePath(workspace, filepath)
      const items: ICopyTargetItem[] = collectCopyTargets(workspace, srcPath, this.targets, isMatch)
      if (items.length > 0) {
        if (!this.copying) {
          logger.verbose(chalk.green('copied:'))
        }

        this.copying = true
        void Promise.allSettled<void>(items.map(item => copySingleItem(item))).finally(() => {
          this.copying = false
        })
      }
    })

    this.isMatch = isMatch
    this.workspace = workspace
    this.watcher = watcher
    this.watchedPatterns = new Set()
    this.targets = []
    this.copying = false
    this._isClosed = false
  }

  public watchTargets(targets: ReadonlyArray<IConfigTarget>): this {
    if (this._isClosed) return this

    this.targets = targets
    const { watcher, watchedPatterns } = this
    for (const { watchPatterns } of targets) {
      if (!watchedPatterns.has(watchPatterns)) {
        watchedPatterns.add(watchPatterns)
        watcher.add(watchPatterns)
      }
    }
    return this
  }

  public async close(): Promise<void> {
    if (this._isClosed) return

    try {
      this._isClosed = true
      await this.watcher.close()
      this.targets = []
      this.watchedPatterns.clear()
    } catch (error) {
      this._isClosed = false
      throw error
    }
  }
}
