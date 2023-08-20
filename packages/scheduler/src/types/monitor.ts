export type ICallbackName = `on${Capitalize<string>}`

export type IListeners<K extends `on${Capitalize<string>}`> = {
  [key in K]: ((...args: any[]) => void) | undefined
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type IBatchMonitor<T> = T extends IListeners<infer K>
  ? T & {
      subscribe(monitor: T): () => void
    }
  : never
