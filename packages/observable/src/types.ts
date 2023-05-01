export interface IDisposable {
  readonly disposed: boolean
  dispose(): void
}

export type IEquals<T> = (x: T, y: T) => boolean

export interface IUnsubscribable {
  unsubscribe(): void
}

export interface ISubscribable<T> {
  subscribe(subscriber: ISubscriber<T>): IUnsubscribable
}

export interface ISubscriber<T> {
  next(value: T): void
  error(err: any): void
  complete(): void
}
