import type { IDisposable, IEquals, ISubscribable, ISubscriber, IUnsubscribable } from './types'

export class Observable<T> implements IDisposable, ISubscribable<T>, ISubscriber<T> {
  protected readonly _subscribers: Set<ISubscriber<T>>
  protected readonly _equals: IEquals<T>
  protected _value: T
  protected _available: boolean

  constructor(defaultValue: T, equals?: IEquals<T>) {
    this._subscribers = new Set()
    this._equals = equals ?? ((x: T, y: T) => x === y)
    this._value = defaultValue
    this._available = true
  }

  public get subscribers(): Array<ISubscriber<T>> {
    return Array.from(this._subscribers.values())
  }

  public get disposed(): boolean {
    return !this._available
  }

  public dispose(): void {
    this._available = false
    this._subscribers.clear()
  }

  public getSnapshot = (): T => {
    return this._value
  }

  /**
   * 1. Update observable current state.
   * 2. Notify all subscribers if the value is changed.
   */
  public next(value: T): void {
    if (this._available && !this._equals(value, this._value)) {
      this._value = value
      const subscribers = this.subscribers
      for (const subscriber of subscribers) subscriber.next(value)
    }
  }

  public error(error: unknown): void {
    if (this._available) {
      const subscribers = this.subscribers
      for (const subscriber of subscribers) subscriber.error(error)
      this.dispose()
    }
  }

  public complete(): void {
    if (this._available) {
      const subscribers = this.subscribers
      for (const subscriber of subscribers) subscriber.complete()
      this.dispose()
    }
  }

  public subscribe(subscriber: ISubscriber<T>): IUnsubscribable {
    if (!this._subscribers.has(subscriber)) {
      subscriber.next(this.getSnapshot())
      this._subscribers.add(subscriber)
    }

    return {
      unsubscribe: () => {
        this._subscribers.delete(subscriber)
      },
    }
  }
}
