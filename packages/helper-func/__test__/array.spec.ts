import { filterInPlace } from '../src'

describe('filterInPlace', () => {
  it('filters an array in place', () => {
    const arr: number[] = [1, 2, 3, 4, 5]
    filterInPlace(arr, x => x % 2 === 0)
    expect(arr).toEqual([2, 4])
  })

  it('handles an empty array', () => {
    const arr: number[] = []
    filterInPlace(arr, x => x % 2 === 0)
    expect(arr).toEqual([])
  })

  it('handles an array with no matching elements', () => {
    const arr: number[] = [1, 3, 5]
    filterInPlace(arr, x => x % 2 === 0)
    expect(arr).toEqual([])
  })

  it('handles an array with all matching elements', () => {
    const arr: number[] = [2, 4, 6]
    filterInPlace(arr, x => x % 2 === 0)
    expect(arr).toEqual([2, 4, 6])
  })
})
