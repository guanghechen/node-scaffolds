import { jest } from '@jest/globals'
import { Observable } from '../src'
import type { ISubscriber } from '../src'

describe('Observable', () => {
  const initialValue = 0
  const newValue = initialValue + 1

  let observable: Observable<number>
  let subscriber: ISubscriber<number>

  beforeEach(() => {
    observable = new Observable(initialValue)
    subscriber = { next: jest.fn(), error: jest.fn(), complete: jest.fn() }
  })

  afterEach(() => {
    observable.dispose()
  })

  it('should notify subscribers when the value changes', () => {
    observable.subscribe(subscriber)
    expect(subscriber.next).toHaveBeenCalledWith(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)

    observable.next(newValue)
    expect(subscriber.next).toHaveBeenCalledWith(newValue)
    expect(subscriber.next).toHaveBeenCalledTimes(2)
    expect(subscriber.error).not.toHaveBeenCalledWith()
    expect(subscriber.complete).not.toHaveBeenCalled()
    expect(observable.disposed).toEqual(false)
  })

  it('should not notify subscribers when the value does not change', () => {
    observable.subscribe(subscriber)
    expect(subscriber.next).toHaveBeenCalledWith(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)

    observable.next(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)
    expect(subscriber.error).not.toHaveBeenCalledWith()
    expect(subscriber.complete).not.toHaveBeenCalled()
    expect(observable.disposed).toEqual(false)
  })

  it('should notify subscribers when an error occurs', () => {
    observable.subscribe(subscriber)
    expect(subscriber.next).toHaveBeenCalledWith(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)

    const error = new Error('Something went wrong')
    observable.error(error)
    expect(subscriber.error).toHaveBeenCalledWith(error)
    expect(subscriber.complete).not.toHaveBeenCalled()
    expect(observable.disposed).toEqual(true)
  })

  it('should notify subscribers when the observable completes', () => {
    observable.subscribe(subscriber)
    expect(subscriber.next).toHaveBeenCalledWith(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)

    observable.complete()
    expect(subscriber.complete).toHaveBeenCalled()
    expect(subscriber.error).not.toHaveBeenCalled()
    expect(observable.disposed).toEqual(true)
  })

  it('should dispose of subscribers when the observable is disposed', () => {
    observable.subscribe(subscriber)
    expect(subscriber.next).toHaveBeenCalledWith(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)

    observable.dispose()
    expect(observable.disposed).toEqual(true)

    observable.next(newValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)
    expect(subscriber.error).not.toHaveBeenCalledWith()
    expect(subscriber.complete).not.toHaveBeenCalled()
  })

  it('should unsubscribe', () => {
    const subscription = observable.subscribe(subscriber)
    expect(subscriber.next).toHaveBeenCalledWith(initialValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)
    expect(observable.subscribers.length).toEqual(1)

    subscription.unsubscribe()
    expect(observable.subscribers.length).toEqual(0)

    observable.next(newValue)
    expect(subscriber.next).toHaveBeenCalledTimes(1)
  })
})
