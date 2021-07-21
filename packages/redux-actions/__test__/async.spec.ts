import type {
  AsyncActionCreators,
  AsyncActionReducer,
  AsyncActions,
  AsyncFailureResponse,
  AsyncStateItem,
} from '../src'
import {
  AsyncActionStatus,
  assembleActionReducers,
  createAsyncAction,
  createAsyncActionCreator,
  createAsyncActionReducer,
  createAsyncStateItem,
} from '../src'

describe('state', function () {
  test('createAsyncStateItem', function () {
    const emptyState: AsyncStateItem<{
      username: string
    }> = createAsyncStateItem()
    const state: AsyncStateItem<{ username: string }> = createAsyncStateItem({
      username: 'waw',
    })

    expect(emptyState).toEqual({
      loading: false,
      data: null,
      error: null,
    })

    expect(state).toEqual({
      loading: false,
      data: { username: 'waw' },
      error: null,
    })
  })
})

describe('creator', function () {
  test('createAsyncActionCreator', function () {
    type T = 'fetch-user'
    interface RP {
      username: string
    }
    interface SP {
      username: string
      age: number
    }
    type FP = AsyncFailureResponse
    type As = AsyncActions<T, RP, SP, FP>

    const creatorsList: Array<AsyncActionCreators<T, As>> = [
      createAsyncActionCreator('fetch-user'),
      createAsyncAction<any, T, As>('fetch-user').creator,
    ]

    for (const fetchUserActionCreators of creatorsList) {
      expect(fetchUserActionCreators.request({ username: 'alice' })).toEqual({
        type: 'fetch-user',
        status: AsyncActionStatus.REQUESTED,
        payload: { username: 'alice' },
      })

      expect(
        fetchUserActionCreators.success({ username: 'alice', age: 32 }),
      ).toEqual({
        type: 'fetch-user',
        status: AsyncActionStatus.SUCCEED,
        payload: { username: 'alice', age: 32 },
      })

      expect(
        fetchUserActionCreators.failure({
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // Extra argument will cause the Type Checking Error by ts
          extra: 'no',
        }),
      ).toEqual({
        type: 'fetch-user',
        status: AsyncActionStatus.FAILED,
        payload: {
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
          extra: 'no',
        },
      })
    }
  })
})

describe('reducer', function () {
  test('createAsyncActionReducer', function () {
    const actionType: unique symbol = Symbol('waw')
    const state = createAsyncStateItem<string>('hello')

    type S = typeof state
    type T = typeof actionType
    type RP = string
    type SP = string
    type FP = AsyncFailureResponse
    type As = AsyncActions<T, RP, SP, FP>

    const creators = createAsyncActionCreator<T, As>(actionType)
    const reducers: Array<AsyncActionReducer<S, T, As>> = [
      createAsyncActionReducer<S, T, As>(actionType),
      createAsyncAction<S, T, As>(actionType).reducer,
    ]

    for (const reducer of reducers) {
      expect(reducer.process(state, creators.request('world!'))).toEqual({
        loading: true,
        data: 'hello',
        error: null,
      })

      expect(reducer.process(state, creators.success('world!'))).toEqual({
        loading: false,
        data: 'world!',
        error: null,
      })

      expect(
        reducer.process(
          state,
          creators.failure({
            code: 500,
            message: 'Internal Server Error',
            debug: '`alice` cannot be accessible',
          }),
        ),
      ).toEqual({
        loading: false,
        data: 'hello',
        error: {
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
        },
      })

      expect(reducer.process(state, { type: 'waw' } as any)).toEqual(state)

      expect(
        reducer.process(state, { type: actionType, status: 'waw' } as any),
      ).toEqual(state)
    }
  })

  test('assembleActionReducers', function () {
    const actionType: unique symbol = Symbol('waw')
    const creators = createAsyncActionCreator(actionType)
    const initialState = createAsyncStateItem<string>('hello')

    type T = typeof actionType
    type S = typeof initialState
    const actionReducer = createAsyncActionReducer<S, T, AsyncActions<T>>(
      actionType,
    )
    const reducer = assembleActionReducers<S, T>(initialState, [actionReducer])

    for (const state of [undefined, initialState]) {
      expect(reducer(state, creators.request('world!'))).toEqual({
        loading: true,
        data: 'hello',
        error: null,
      })

      expect(reducer(state, creators.success('world!'))).toEqual({
        loading: false,
        data: 'world!',
        error: null,
      })

      expect(
        reducer(
          state,
          creators.failure({
            code: 500,
            message: 'Internal Server Error',
            debug: '`alice` cannot be accessible',
          }),
        ),
      ).toEqual({
        loading: false,
        data: 'hello',
        error: {
          code: 500,
          message: 'Internal Server Error',
          debug: '`alice` cannot be accessible',
        },
      })

      expect(reducer(state, { type: 'waw' } as any)).toEqual(initialState)

      expect(
        reducer(state, { type: actionType, status: 'waw' } as any),
      ).toEqual(initialState)
    }
  })
})
