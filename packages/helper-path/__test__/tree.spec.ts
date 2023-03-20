import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import type { IFilepathTreeNode } from '../src'
import { buildFilepathTree, calcRelativeFilepaths, printFilepathTree } from '../src'

const data1: string[] = [
  '/a/b/c/d/e/',
  '/a/b/c/f.txt',
  '/a/b/c',
  '/a/b/c/d.txt',
  '/a/b/c_d.txt',
  '/a/b/c#d.txt',
  '/a/b/d',
  '/a/b/e',
  '/a/b/e/f.txt',
  '/a/b/e/g/h.txt',
  '/a/b/e/g/i.txt',
  '/a/b/f',
]

describe('calcRelativeFilepaths', () => {
  test('data1', () => {
    expect(calcRelativeFilepaths(data1, '/').map(item => item.join('/'))).toMatchInlineSnapshot(`
      [
        "a/b/c",
        "a/b/c/d/e",
        "a/b/c/d.txt",
        "a/b/c/f.txt",
        "a/b/c#d.txt",
        "a/b/c_d.txt",
        "a/b/d",
        "a/b/e",
        "a/b/e/f.txt",
        "a/b/e/g/h.txt",
        "a/b/e/g/i.txt",
        "a/b/f",
      ]
    `)
  })
})

describe('buildFilepathTree', () => {
  test('data1', () => {
    expect(buildFilepathTree({ files: data1, rootDir: '/' })).toMatchSnapshot()
  })
})

describe('printFilepathTree', () => {
  let consoleMock: IConsoleMock
  beforeEach(() => {
    consoleMock = createConsoleMock(['log'])
  })
  afterEach(() => {
    consoleMock.restore()
  })

  describe('data1', () => {
    test('custom printer', () => {
      const tree: IFilepathTreeNode = buildFilepathTree({ files: data1, rootDir: '/' })
      const liens: string[] = []
      printFilepathTree({ tree, indent: '', printLine: line => liens.push(line) })
      expect(liens).toMatchInlineSnapshot(`
        [
          "/",
          "└── a",
          "    └── b",
          "        ├── c",
          "        │   ├── d",
          "        │   │   └── e",
          "        │   ├── d.txt",
          "        │   └── f.txt",
          "        ├── e",
          "        │   ├── g",
          "        │   │   ├── h.txt",
          "        │   │   └── i.txt",
          "        │   └── f.txt",
          "        ├── c#d.txt",
          "        ├── c_d.txt",
          "        ├── d",
          "        └── f",
        ]
      `)
      expect(consoleMock.getIndiscriminateAll()).toEqual([])
    })

    test('default printer', () => {
      const tree: IFilepathTreeNode = buildFilepathTree({ files: data1, rootDir: '/' })
      printFilepathTree({ tree })
      expect(consoleMock.getIndiscriminateAll().map(arr => arr.join(''))).toMatchInlineSnapshot(`
        [
          "/",
          "└── a",
          "    └── b",
          "        ├── c",
          "        │   ├── d",
          "        │   │   └── e",
          "        │   ├── d.txt",
          "        │   └── f.txt",
          "        ├── e",
          "        │   ├── g",
          "        │   │   ├── h.txt",
          "        │   │   └── i.txt",
          "        │   └── f.txt",
          "        ├── c#d.txt",
          "        ├── c_d.txt",
          "        ├── d",
          "        └── f",
        ]
      `)
    })
  })
})
