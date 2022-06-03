import React from 'react'

/**
 * Reinitialize the state if the related props changed..
 * @param initialState
 * @returns
 */
export function useSyncState<S>(initialState: S): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = React.useState(initialState)
  React.useEffect(() => setState(initialState), [initialState])
  return [state, setState]
}
