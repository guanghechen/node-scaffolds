import type { IFilepathTreeNode } from './types'

export interface IPrintFilepathTreeParams {
  tree: IFilepathTreeNode
  indent?: string | undefined
  printLine?(line: string): void
}

export function printFilepathTree(params: IPrintFilepathTreeParams): void {
  const { tree, indent = '', printLine = defaultPrintLine } = params
  printLine(tree.prefix)
  internalPrintFilepathTree(tree, indent, printLine)
}

function internalPrintFilepathTree(
  tree: IFilepathTreeNode,
  indent: string,
  printLine: (line: string) => void,
): void {
  for (let i = 0; i < tree.children.length; ++i) {
    const node = tree.children[i]
    const isLast: boolean = i + 1 === tree.children.length
    const prefix: string = isLast ? '└── ' : '├── '
    printLine(indent + prefix + node.prefix.replace(/[/]$/, ''))

    const nextIndent: string = indent + (isLast ? '    ' : '│   ')
    internalPrintFilepathTree(node, nextIndent, printLine)
  }
}

function defaultPrintLine(line: string): void {
  console.log(line)
}
