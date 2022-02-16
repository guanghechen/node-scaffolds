import chalk from 'chalk'
import path from 'path'
import type rollup from 'rollup'
import type { ICopyTargetItem, IOptions } from './types'
import {
  CopyWatcher,
  collectAndWatchingTargets,
  copySingleItem,
  logger,
  normalizeOptions,
} from './util'

export function copy(options: IOptions = {}): rollup.Plugin {
  const config = normalizeOptions(options)
  const { targets, copyOnce, hook, watchHook } = config

  const watchingFiles: Set<string> = new Set()

  logger.shouldBeVerbose = config.verbose
  let copied = false
  let copyTargets: ReadonlyArray<ICopyTargetItem> | undefined
  let watcher: CopyWatcher | undefined

  async function fullCopy(copyTargets: ReadonlyArray<ICopyTargetItem>): Promise<void> {
    for (const copyTarget of copyTargets) await copySingleItem(copyTarget)
    copied = true
    logger.verbose(copyTargets.length ? chalk.green('copied:') : chalk.yellow('no items to copy'))
  }

  function addWatchFile(context: rollup.PluginContext, filepath: string): void {
    const srcPath = path.resolve(filepath)
    if (watchingFiles.has(srcPath)) return
    watchingFiles.add(srcPath)
    context.addWatchFile(srcPath)
  }

  async function clean(): Promise<void> {
    await watcher?.close()
    watchingFiles.clear()
  }

  async function handleCopy(): Promise<void> {
    // If we have performed the fullCopy once the watcher is created,
    // then we shouldn't to run fullCopy any more.
    if (copied && (copyOnce || watcher)) return

    if (copyTargets === undefined) {
      copyTargets = await collectAndWatchingTargets(targets)
    }
    await fullCopy(copyTargets)
  }

  const plugin: rollup.Plugin = {
    name: 'copy',
    [hook]: handleCopy,
    async [watchHook]() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context: rollup.PluginContext = this as any

      if (!copyOnce) {
        copyTargets = await collectAndWatchingTargets(targets)
        for (const target of copyTargets) addWatchFile(context, target.srcPath)
        watcher?.watchTargets(targets).watchCopyTargets(copyTargets)
      }

      // Merge handleCopy and collectAndWatchingTargets
      if (hook === watchHook) {
        await handleCopy()
      }
    },
    watchChange: () => {
      if (!copyOnce && watcher === undefined) {
        watcher = new CopyWatcher(path.resolve())
      }
    },
    closeWatcher: clean,
  }
  return plugin
}
