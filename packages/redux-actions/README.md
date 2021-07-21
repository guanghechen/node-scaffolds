<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/redux-actions#readme">@guanghechen/redux-actions</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/redux-actions">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/redux-actions.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/redux-actions">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/redux-actions.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/redux-actions">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/redux-actions.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs, esm"
        src="https://img.shields.io/badge/module_formats-cjs%2C%20esm-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/redux-actions"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


`@guanghechen/redux-actions` provides utility funcs for creating async actions,
async state item and reducer.

## Install

* npm

  ```bash
  npm install --save @guanghechen/redux-actions
  ```

* yarn

  ```bash
  yarn add @guanghechen/redux-actions
  ```

## Usage

### Types

* `Action`

  ```typescript
  /**
   * Action passed in redux Flow
    */
  export interface Action<T extends symbol | string, P extends unknown> {
    /**
     * Action type
      */
    type: T
    /**
     * Action payload
      */
    payload?: P
  }
  ```

* `AsyncActions`

  ```typescript
  /**
   * Async action passed in redux Flow
    */
  export interface AsyncAction<
    T extends symbol | string,
    P extends unknown,
    S extends AsyncActionStatus
    > extends Action<T, P> {
    /**
     * Action type
      */
    type: T
    /**
     * Status of request of async action
      */
    status: S
    /**
     * Action payload
      */
    payload?: P
  }
  ```

  - <details><summary>Referenced types</summary>

    ```typescript
    /**
     * Status of async action
      */
    export enum AsyncActionStatus {
      /**
       * Requested
        */
      REQUESTED = 'REQUESTED',
      /**
       * Request succeed
        */
      SUCCEED = 'SUCCEED',
      /**
       * Request failed
        */
      FAILED = 'FAILED',
    }

    /**
     * Response of failed request
      */
    export interface AsyncFailureResponse {
      /**
       * Error code
        */
      code: number
      /**
       * Error message
        */
      message: string
      /**
       * Debugging information
        */
      debug?: string
    }
    ```
    </details>

* `AsyncStateItem`

  ```typescript
  /**
  * State item with data fetch/updated through async funcs
  */
  export interface AsyncStateItem<D> {
    /**
    * Whether is loading
    */
    loading: boolean
    /**
    * Data
    */
    data: D | null
    /**
    * Error message object
    */
    error: AsyncFailureResponse | null
  }
  ```

### Utils

* `createActionCreator`
  - <details><summary>Function signature</summary>

    ```typescript
    /**
     * Create action creator
      * @param type              Action type
      * @param payloadRequired   Whether payload is required
      */
    export function createActionCreator<
      T extends symbol | string,
      P extends unknown
    >(type: T, payloadRequired: false)
      : (payload?: P) => Action<T, P>
    export function createActionCreator<
      T extends symbol | string,
      P extends unknown
    >(type: T, payloadRequired: true)
      : (payload: P) => Required<Action<T, P>>
    export function createActionCreator<
      A extends Action<symbol | string, unknown>
    >(
      type: A['type'], payloadRequired: false)
      : (payload?: A['payload']) =>
    export function createActionCreator<
      A extends Action<symbol | string, unknown>
    >(
      type: A['type'], payloadRequired: true)
      : (payload: A['payload']) => A
    ```

  - <details><summary>Example</summary>

    ```typescript
    const UserCreator = createActionCreator<'@user/me', { name: string }>('@user/me', true)
    // => (payload: { name: string }) => ({ type: '@user/me', name })
    ```

* `createAsyncActionCreator`
  - <details><summary>Function signature</summary>

    ```typescript
    /**
     * Create async action types and async action creators
      * @param actionType
      */
    export function createAsyncActionCreator<
      T extends string | symbol,
      As extends AsyncActions<T>
    >(actionType: T): AsyncActionCreators<T, As>
    ```

  - <details><summary>Example</summary>

    ```typescript
    // action for fetching user
    const FetchUserActionType = '@user/fetch'
    type FetchUserActionType = typeof FetchUserActionType
    type FetchUserActionRequestVo = { name: string }
    type FetchUserActionSucceedVo = { name: string, gender: 'male' | 'female' }
    type FetchUserActionFailedVo = AsyncFailureResponse

    const fetchUserActionCreators = createAsyncActionCreator<
      FetchUserActionType,
      AsyncActions<
        FetchUserActionType,
        FetchUserActionRequestVo,
        FetchUserActionSucceedVo,
        FetchUserActionFailedVo
      >(FetchUserActionType)

    // => fetchUserActionCreators = {
    //      request: (payload?: FetchUserActionRequestVo) => ({ type: '@user/fetch_user', status: 'REQUESTED', payload }),
    //      success: (payloadF: FetchUserActionSucceedVo) => ({ type: '@user/fetch_user', status: 'SUCCEED', payload }),
    //      failure: (payload?: FetchUserActionFailedVo) => ({ type: '@user/fetch_user', status: 'FAILED', payload }),
    //    }
    ```

* `createAsyncActionReducer`
  - <details><summary>Function signature</summary>

    ```typescript
    /**
     * Create reducer of async actions
      * @param actionType
      */
    export function createAsyncActionReducer<
      S extends AsyncStateItem<unknown>,
      T extends string | symbol,
      As extends AsyncActions<T>,
    >(
      actionType: T,
      handlers: {
        onRequestedAction?: AsyncActionHandler<S, T, As['request']>,
        onSucceedAction?: AsyncActionHandler<S, T, As['success']>,
        onFailedAction?: AsyncActionHandler<S, T, As['failure']>,
      } = {},
    ): AsyncActionReducer<S, T, As>
    ```

  - <details><summary>Example</summary>

    ```typescript
    type UserStateData { name: string; gender: string }
    type UserState = AsyncStateItem<UserStateData>

    // fetch user action
    const FetchUserActionType = '@user/fetch'
    type FetchUserActionType = typeof FetchUserActionType
    type FetchUserActionRequestVo = { name: string }
    type FetchUserActionSucceedVo = { name: string, gender: 'male' | 'female' }
    type FetchUserActionFailedVo = AsyncFailureResponse

    const fetchUserActionReducer = createAsyncActionReducer<
      UserState,
      FetchUserActionType,
      AsyncActions<
        FetchUserActionType,
        FetchUserActionRequestVo,
        FetchUserActionSucceedVo,
        FetchUserActionFailedVo
      >(FetchUserActionType)

    // login action
    type LoginActionType = '@user/login'
    type LoginAction = Action<LoginActionType, { username: string }>

    // action for fetching user
    type UserActionTypes = FetchUserActionType | LoginActionType
    export const userReducer = assembleActionReducers<UserState, UserActionTypes>([
      fetchUserActionReducer,
      {
        actionType: '@user/login',
        process: (state: UserState, action: LoginAction) => ({
          ...state,
          name: action.payload.username,
        }),
      },
      // other action handlers
    ])

    // use userReducer in redux
    import { combineReducers } from 'redux'
    export const rootReducer = combineReducers({
      user: userReducer,
    })
    ```

* `createInitAsyncStateItem`
  - <details><summary>Function signature</summary>

    ```typescript
    /**
     * Create initial state item
      * @param data
      */
    export function createInitAsyncStateItem<D>(data?: D | null): AsyncStateItem<D>
    ```

  - <details><summary>Example</summary>

    ```typescript
    export type UserStateData { name: string; gender: string }
    export type UserState = AsyncStateItem<UserStateData>
    export const initialUserState = createInitAsyncStateItem<UserStateData>({
      name: 'alice',
      gender: 'female',
    })

    // => initialUserState = {
    //      loading: false,
    //      data: { name: 'alice', gender: 'female' },
    //      error: null,
    //    }
    ```

* `assembleActionReducers`
  - <details><summary>Function signature</summary>

    ```typescript
    export function assembleActionReducers<
      S extends AsyncStateItem<unknown>,
      T extends string | symbol,
      R extends AsyncActionReducer<S, T, AsyncActions<T>>
        = AsyncActionReducer<S, T, AsyncActions<T>>
    >(
      initialState: S,
      actionReducers: R[],
    ): Reducer<S, AsyncActions<T, unknown>>
    ```

* `createAsyncAction`
  - <details><summary>Function signature</summary>

    ```typescript
    /**
     * Shorthand for create both AsyncActionCreator and AsyncActionReducer
      * @param actionType
      * @param handlers
      */
    export function createAsyncAction<
      S extends AsyncStateItem<unknown>,
      T extends string | symbol,
      As extends AsyncActions<T>,
    >(
      actionType: T,
      handlers?: {
        onRequestedAction?: AsyncActionHandler<S, T, As['request']>,
        onSucceedAction?: AsyncActionHandler<S, T, As['success']>,
        onFailedAction?: AsyncActionHandler<S, T, As['failure']>,
      },
    ): {
      creator: AsyncActionCreators<T, As>,
      reducer: AsyncActionReducer<S, T, As>
    }
    ```

[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/redux-actions#readme
