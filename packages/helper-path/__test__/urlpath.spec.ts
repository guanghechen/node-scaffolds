import { normalizeUrlPath } from '../src'

describe('normalizeUrlPath', () => {
  test('relative', () => {
    expect(normalizeUrlPath('')).toEqual('.')
    expect(normalizeUrlPath('.')).toEqual('.')
    expect(normalizeUrlPath('.//../a.txt')).toEqual('../a.txt')
    expect(normalizeUrlPath('./a.txt')).toEqual('a.txt')
    expect(normalizeUrlPath('./b/../a.txt')).toEqual('a.txt')
    expect(normalizeUrlPath('./b/c/../a.txt')).toEqual('b/a.txt')
    expect(normalizeUrlPath('./b/c/.././d/././e/a.txt')).toEqual('b/d/e/a.txt')
    expect(normalizeUrlPath('./b/c/.././d/././e/a.txt/..')).toEqual('b/d/e')
    expect(normalizeUrlPath('./b/c/.././d/././e/a.txt/.')).toEqual('b/d/e/a.txt')
  })

  test('absolute', () => {
    expect(normalizeUrlPath('/')).toEqual('/')
    expect(normalizeUrlPath('/a.txt')).toEqual('/a.txt')
    expect(normalizeUrlPath('/../../../b/a.txt')).toEqual('/b/a.txt')
    expect(normalizeUrlPath('/../b/.././c/../d/./a.txt')).toEqual('/d/a.txt')
    expect(normalizeUrlPath('/./b/c/d/.//./e/a.txt')).toEqual('/b/c/d/e/a.txt')
  })
})
