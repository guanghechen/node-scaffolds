import {
  AsyncActionReducer,
  AsyncActions,
  AsyncStateItem,
  assembleActionReducers,
  createAsyncAction,
  createAsyncStateItem,
} from '@guanghechen/redux-actions'


export interface UserStateData {
  name: string
  gender: string
}


export type UserState = AsyncStateItem<UserStateData>


export const initialUserState: UserState
  = createAsyncStateItem<UserStateData>({
    name: 'alice',
    gender: 'female',
  })


const FETCH_USER_ACTION_TYPE: unique symbol = Symbol('@user/fetch_user')
const UPDATE_USER_ACTION_TYPE: unique symbol = Symbol('@user/update_user')
export type UserActionTypes =
  | typeof FETCH_USER_ACTION_TYPE
  | typeof UPDATE_USER_ACTION_TYPE


export const {
  creator: fetchUserActionCreator,
  reducer: fetchUserActionReducer,
} = createAsyncAction<
  UserState,
  typeof FETCH_USER_ACTION_TYPE,
  AsyncActions<typeof FETCH_USER_ACTION_TYPE, { x: number }>
>(FETCH_USER_ACTION_TYPE)


export const userActionCreators = {
  fetchUser: fetchUserActionCreator,
}


export const userReducer = assembleActionReducers<UserState, UserActionTypes>(
  initialUserState,
  [fetchUserActionReducer] as AsyncActionReducer<UserState, UserActionTypes, any>[]
)


const action1 = userActionCreators.fetchUser.request({ x: 2 })


/**
 * You will get a warning in the next line like:
 *
 *      This condition will always return 'false' since the types
 *      'typeof requestedType' and 'typeof failedType' have no overlap.
 *
 * Because unique symbol are different type each other in TypeScript
 */
// console.log(action1.type === UPDATE_USER_ACTION_TYPE)


/**
 * But it's okay in the next lines because they're identical.
 */
console.log(action1.type === FETCH_USER_ACTION_TYPE)


/**
 * And also will be warned when you try to call the .request func with a
 * different type of payload than the typeof AsyncRequestedAction.payload
 */
// userActionCreators.fetchUser.request({ x: '2' })
// userActionCreators.fetchUser.request({ x: 2, y: 1})


/**
 * on request succeed
 */
userActionCreators.fetchUser.success({ name: 'alice' })

/**
 * on request failed
 */
userActionCreators.fetchUser.failure({ code: 500, message: 'Server Error' })
