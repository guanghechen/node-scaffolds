import {
  AsyncActionReducer,
  AsyncActions,
  AsyncStateItem,
  assembleActionReducers,
  createAsyncAction,
  createAsyncStateItem,
} from '@guanghechen/redux-actions'


export enum UserActionTypes {
  FETCH_USER = '@user/fetch_user',
  UPDATE_USER = '@user/update_user',
}


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


export const {
  creator: fetchUserActionCreator,
  reducer: fetchUserActionReducer,
} = createAsyncAction<
  UserState,
  UserActionTypes.FETCH_USER,
  AsyncActions<UserActionTypes.FETCH_USER, { x: number }>
>(UserActionTypes.FETCH_USER)


export const userActionCreators = {
  fetchUser: fetchUserActionCreator,
}


export const userReducer = assembleActionReducers<UserState, UserActionTypes>(
  initialUserState,
  [fetchUserActionReducer] as AsyncActionReducer<UserState, UserActionTypes, any>[]
)


const action1 = userActionCreators.fetchUser.request({ x: 2 })


/**
 * You will get a type error in the next lines like:
 *
 *        This condition will always return 'false' since the types
 *        'UserActionTypes.FETCH_USER' and '"@user/update_user"' have no overlap
 *
 * Because literal string are different type when their value are different
 */
// console.log(action1.type === '@user/update_user')
// console.log(action1.type === UserActionTypes.UPDATE_USER)

/**
 * But it's okay in the next lines because they're identical.
 */
console.log(action1.type === '@user/fetch_user')
console.log(action1.type === UserActionTypes.FETCH_USER)


/**
 * And also will be warned when you try to call the .request func with a
 * different type of payload than the typeof AsyncRequestedAction.payload
 */
// userActionCreators.fetchUser.request('waw')
// userActionCreators.fetchUser.request({ x: '2' })
// userActionCreators.fetchUser.request({ x: 2, y: 1 })


/**
 * on request succeed
 */
userActionCreators.fetchUser.success({ name: 'alice' })

/**
 * on request failed
 */
userActionCreators.fetchUser.failure({ code: 500, message: 'Server Error' })
