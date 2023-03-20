import { relativeOfWorkspace } from '../filepath'
import type { IFilepathTreeNode } from './types'

export interface IFileTreeNodeParams {
  files: string[]
  rootDir: string
}

export function buildFilepathTree(params: IFileTreeNodeParams): IFilepathTreeNode {
  const relativeFiles: string[][] = calcRelativeFilepaths(params.files, params.rootDir)
  const children: IFilepathTreeNode[] = internalBuildFilepathTree(
    relativeFiles,
    0,
    relativeFiles.length,
    0,
  )
  const tree: IFilepathTreeNode = { prefix: params.rootDir, children }
  return tree
}

export function calcRelativeFilepaths(files: string[], rootDir: string): string[][] {
  const relativeFiles: string[][] = files
    .map(file =>
      relativeOfWorkspace(rootDir, file)
        .split(/[/\\]+/g)
        .filter(p => !!p),
    )
    .sort((x: string[], y: string[]): -1 | 0 | 1 => {
      const N = Math.min(x.length, y.length)
      for (let i = 0; i < N; ++i) {
        if (x[i] === y[i]) continue
        return x[i] < y[i] ? -1 : 1
      }
      /* c8 ignore start */
      if (x.length === y.length) return 0
      /* c8 ignore end */
      return x.length < y.length ? -1 : 1
    })
  return relativeFiles
}

function internalBuildFilepathTree(
  orderedRelativeFiles: string[][],
  start: number,
  end: number,
  depth: number,
): IFilepathTreeNode[] {
  const dirNodes: IFilepathTreeNode[] = []
  const fileNodes: IFilepathTreeNode[] = []
  for (let i = start, j: number; i < end; i = j) {
    const current: string = orderedRelativeFiles[i][depth]
    for (j = i + 1; j < end; ++j) {
      const nextPieces: string[] = orderedRelativeFiles[j]
      if (nextPieces[depth] !== current) break
    }

    if (depth + 1 < orderedRelativeFiles[i].length || i + 1 < j) {
      const node: IFilepathTreeNode = {
        prefix: current,
        children: internalBuildFilepathTree(
          orderedRelativeFiles,
          depth + 1 < orderedRelativeFiles[i].length ? i : i + 1,
          j,
          depth + 1,
        ),
      }
      dirNodes.push(node)
    } else {
      const node: IFilepathTreeNode = {
        prefix: current,
        children: [],
      }
      fileNodes.push(node)
    }
  }
  return [...dirNodes, ...fileNodes]
}
