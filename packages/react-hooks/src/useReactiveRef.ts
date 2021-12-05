import type React from 'react'
import { useEffect, useRef } from 'react'

/**
 * Create a reactive ref which will follow the changes of the given data.
 * @param data
 * @returns
 */
export function useReactiveRef<T>(data: T): React.MutableRefObject<T> {
  const ref = useRef(data)
  useEffect(() => {
    ref.current = data
  }, [data])
  return ref
}
