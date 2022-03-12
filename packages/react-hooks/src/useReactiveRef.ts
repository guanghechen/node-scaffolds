import React from 'react'

/**
 * Create a reactive ref which will follow the changes of the given data.
 * @param data
 * @returns
 */
export function useReactiveRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef<T>(value)
  ref.current = value
  return ref
}
