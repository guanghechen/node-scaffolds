import type { IEntryItem, IManifestEntryFields, IRawEntryItem } from './types'

export function resolveEntryItems(manifest: IManifestEntryFields): IEntryItem[] {
  const defaultEntry: IEntryItem = {
    import: manifest.module,
    require: manifest.main,
    source: [manifest.source || []].flat(),
    types: manifest.types,
  }

  const exportsEntries: IEntryItem[] = []
  const addEntryItem = (item: IRawEntryItem): void => {
    if (item.import || item.require) {
      exportsEntries.push({
        import: item.import,
        require: item.require,
        source: [item.source || []].flat(),
        types: item.types,
      })
    }
  }

  if (manifest.exports) {
    if (typeof manifest.exports === 'string') {
      exportsEntries.push({
        ...defaultEntry,
        import: manifest.exports,
      })
    } else if (typeof manifest.exports === 'object') {
      if (manifest.exports.import || manifest.exports.require) {
        addEntryItem(manifest.exports)
      } else {
        for (const key of Object.keys(manifest.exports) as Array<keyof typeof manifest.exports>) {
          addEntryItem(manifest.exports[key] as IRawEntryItem)
        }
      }
    }
  }

  const candidateEntries: IEntryItem[] = [defaultEntry, ...exportsEntries].filter(
    item => (item.import || item.require) && item.source.length > 0,
  )

  const results: IEntryItem[] = []
  const outSet: Set<string> = new Set()
  for (const item of candidateEntries) {
    let duplicated = false
    if (item.import) {
      duplicated ||= outSet.has(item.import)
      outSet.add(item.import)
    }
    if (item.require) {
      duplicated ||= outSet.has(item.require)
      outSet.add(item.require)
    }
    if (item.types) {
      duplicated ||= outSet.has(item.types)
      outSet.add(item.types)
    }
    if (!duplicated) results.push(item)
  }

  outSet.clear()
  return results
}
