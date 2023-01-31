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
