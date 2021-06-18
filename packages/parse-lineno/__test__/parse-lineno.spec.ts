import { collectIntervals, collectNumbers } from '../src'

test('collectNumbers', function () {
  expect(collectNumbers('')).toEqual([])
  expect(collectNumbers('1')).toEqual([1])
  expect(collectNumbers('1-3')).toEqual([1, 2, 3])
  expect(collectNumbers('3,1-2,2,2')).toEqual([1, 2, 3])
  expect(collectNumbers('3,7-5,2,2')).toEqual([2, 3, 5, 6, 7])
  expect(collectNumbers('2,1-3')).toEqual([1, 2, 3])
  expect(collectNumbers('4,1-3')).toEqual([1, 2, 3, 4])
  expect(collectNumbers('2-4,1-3,5-9')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  expect(collectNumbers('2-4,1-3,6-9')).toEqual([1, 2, 3, 4, 6, 7, 8, 9])
})

test('collectIntervals', function () {
  expect(collectNumbers('')).toEqual([])
  expect(collectIntervals('1')).toEqual([[1, 1]])
  expect(collectIntervals('1-3')).toEqual([[1, 3]])
  expect(collectIntervals('3,1-2,2,2')).toEqual([[1, 3]])
  expect(collectIntervals('3,7-5,2,2')).toEqual([
    [2, 3],
    [5, 7],
  ])
  expect(collectIntervals('2,1-3')).toEqual([[1, 3]])
  expect(collectIntervals('4,1-3')).toEqual([[1, 4]])
  expect(collectIntervals('2-4,1-3,5-9')).toEqual([[1, 9]])
  expect(collectIntervals('2-4,1-3,6-9')).toEqual([
    [1, 4],
    [6, 9],
  ])
})

test('custom separator', function () {
  expect(collectNumbers('2#4-5#5-8', /#/)).toEqual([2, 4, 5, 6, 7, 8])

  expect(collectIntervals('2#4-5#5-8', /#/)).toEqual([
    [2, 2],
    [4, 8],
  ])
})
