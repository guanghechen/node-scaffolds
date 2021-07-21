import { createActionCreator } from '../src'

describe('optional payload', function () {
  test('literal string type', function () {
    const createTogglingMenuAction = createActionCreator<
      'toggle-menu',
      { id: string }
    >('toggle-menu', false)
    const type: 'toggle-menu' = createTogglingMenuAction().type

    expect(createTogglingMenuAction()).toEqual({
      type,
      payload: undefined,
    })

    expect(createTogglingMenuAction({ id: 'waw' })).toEqual({
      type,
      payload: { id: 'waw' },
    })

    expect(
      createTogglingMenuAction({
        id: 'waw',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // Extra properties will cause the Type Checking Error by ts
        extra: 1,
      }),
    ).toEqual({
      type,
      payload: { id: 'waw', extra: 1 },
    })
  })

  test('symbol type', function () {
    const type: unique symbol = Symbol('toggle-menu')
    const createTogglingMenuAction = createActionCreator<
      typeof type,
      { id: string }
    >(type, false)

    expect(createTogglingMenuAction()).toEqual({
      type,
      payload: undefined,
    })

    expect(createTogglingMenuAction({ id: 'waw' })).toEqual({
      type,
      payload: { id: 'waw' },
    })

    expect(
      createTogglingMenuAction({
        id: 'waw',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // Extra properties will cause the Type Checking Error by ts
        extra: 1,
      }),
    ).toEqual({
      type,
      payload: { id: 'waw', extra: 1 },
    })
  })
})

describe('required payload', function () {
  test('literal string type', function () {
    const createTogglingMenuAction = createActionCreator<
      'toggle-menu',
      { id: string }
    >('toggle-menu', true)
    const type: 'toggle-menu' = createTogglingMenuAction({ id: '' }).type

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // Payload is required, otherwise will cause the Type Checking Error by ts
    expect(createTogglingMenuAction()).toEqual({
      type,
      payload: undefined,
    })

    expect(createTogglingMenuAction({ id: 'waw' })).toEqual({
      type,
      payload: { id: 'waw' },
    })

    expect(
      createTogglingMenuAction({
        id: 'waw',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // Extra properties will cause the Type Checking Error by ts
        extra: 1,
      }),
    ).toEqual({
      type,
      payload: { id: 'waw', extra: 1 },
    })
  })

  test('symbol type', function () {
    const type: unique symbol = Symbol('toggle-menu')
    const createTogglingMenuAction = createActionCreator<typeof type, string>(
      type,
      false,
    )

    expect(createTogglingMenuAction()).toEqual({
      type,
      payload: undefined,
    })

    expect(createTogglingMenuAction('waw')).toEqual({
      type,
      payload: 'waw',
    })
  })
})
