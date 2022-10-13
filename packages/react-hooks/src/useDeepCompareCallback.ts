import isEqual from 'fast-deep-equal/react'
import React from 'react'

/**
 * Deep compare version of React.useCallback
 * @param fn
 * @param deps
 */
export function useDeepCompareCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList,
): T {
  const signal = React.useRef<number>(0)
  const prevDeps = React.useRef<React.DependencyList>(deps)

  if (!isEqual(prevDeps.current, deps)) {
    signal.current += 1
  }
  prevDeps.current = deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(fn, [signal.current])
}
