/**
 * `.filter` method for Iterable structure.
 * @param elements
 * @param filter
 * @returns
 */
export const filterIterable = <T>(
  elements: Iterable<T>,
  filter: (element: T, index: number) => boolean,
): T[] => {
  const list: T[] = []
  let i = 0
  for (const value of elements) {
    if (filter(value, i)) list.push(value)
    i += 1
  }
  return list
}

/**
 * `.map` method for Iterable structure.
 * @param elements
 * @param map
 * @returns
 */
export const mapIterable = <T, R>(
  elements: Iterable<T>,
  map: (element: T, index: number) => R,
): R[] => {
  const list: R[] = []
  let i = 0
  for (const value of elements) {
    const nextValue = map(value, i)
    list.push(nextValue)
    i += 1
  }
  return list
}

/**
 * Converts an iterable to a map, using a key-generating function to create the keys for the map.
 *
 * @typeParam K - The type of keys in the resulting map.
 * @typeParam T - The type of elements in the input iterable.
 *
 * @param elements - The iterable to convert to a map.
 * @param getKey - A function that generates a key for each element in the iterable.
 * The function is called with two arguments: the current element and its index in the iterable.
 *
 * @returns A map whose keys are generated using the `getKey` function and whose
 * values are the elements of the input iterable.
 *
 * @example
 *
 * const arr = ['foo', 'bar', 'baz'];
 * const map = iterable2map(arr, (el, i) => `${el}-${i}`);
 * console.log(map); // Map { 'foo-0' => 'foo', 'bar-1' => 'bar', 'baz-2' => 'baz' }
 */
export const iterable2map = <K, T>(
  elements: Iterable<T>,
  getKey: (element: T, index: number) => K,
): Map<K, T> => {
  const map: Map<K, T> = new Map()
  let i = 0
  for (const value of elements) {
    const key = getKey(value, i)
    map.set(key, value)
    i += 1
  }
  return map
}
