/**
 * Remove properties that exist in `U` from `T`
 */
export type Diff<T extends object, U extends object> = Pick<T, Exclude<keyof T, keyof U>>

/**
 * Make all properties in `T` mutable.
 * @see https://stackoverflow.com/a/46634877
 */
export type Mutable<T extends object> = { -readonly [P in keyof T]: T[P] }

/**
 * Make a set of properties by key `K` become optional from `T`.
 */
export type PickPartial<T extends object, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
