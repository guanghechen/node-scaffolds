import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import type { IBatchMonitor } from '../src'
import { batchMonitor } from '../src'

interface IListenerMock {
  onClick(): void
  onFocus(): void
}

class ListenerMock implements IListenerMock {
  public readonly title: string

  constructor(title: string) {
    this.title = title
  }

  public onClick(): void {
    console.log(`${this.title} -- clicked`)
  }

  public onFocus(): void {
    console.log(`${this.title} -- focused`)
  }
}

describe('Monitor', () => {
  let consoleMock: IConsoleMock
  let batchMonitorMock: IBatchMonitor<IListenerMock>

  beforeEach(() => {
    consoleMock = createConsoleMock()
    batchMonitorMock = batchMonitor<IListenerMock>()
  })

  test('basic', () => {
    expect(Reflect.has(batchMonitorMock, 'subscribe')).toEqual(true)
    expect(Reflect.has(batchMonitorMock, 'onClick')).toEqual(true)
    expect(Reflect.has(batchMonitorMock, 'onFocus')).toEqual(true)
  })

  test('zero monitors', () => {
    batchMonitorMock.onClick()
    batchMonitorMock.onFocus()
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`[]`)
  })

  test('single monitor', () => {
    batchMonitorMock.subscribe(new ListenerMock('A'))
    batchMonitorMock.onClick()
    batchMonitorMock.onFocus()
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "A -- clicked",
        "A -- focused",
      ]
    `)
  })

  test('multiple monitor', () => {
    const a = new ListenerMock('A')
    const b = new ListenerMock('B')
    const c = new ListenerMock('C')
    const unsubscribeA = batchMonitorMock.subscribe(a)
    const unsubscribeB = batchMonitorMock.subscribe(b)
    const unsubscribeC = batchMonitorMock.subscribe(c)
    batchMonitorMock.onClick()
    batchMonitorMock.onFocus()
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "A -- clicked",
        "B -- clicked",
        "C -- clicked",
        "A -- focused",
        "B -- focused",
        "C -- focused",
      ]
    `)

    consoleMock.reset()
    unsubscribeA()
    batchMonitorMock.onClick()
    batchMonitorMock.onFocus()
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "B -- clicked",
        "C -- clicked",
        "B -- focused",
        "C -- focused",
      ]
    `)

    consoleMock.reset()
    unsubscribeB()
    batchMonitorMock.onClick()
    batchMonitorMock.onFocus()
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "C -- clicked",
        "C -- focused",
      ]
    `)

    consoleMock.reset()
    unsubscribeC()
    batchMonitorMock.onClick()
    batchMonitorMock.onFocus()
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`[]`)
  })
})
