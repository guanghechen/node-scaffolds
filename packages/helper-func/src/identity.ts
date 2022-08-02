export const identity = <T>(data: T): T => data

export const identityAsync = <T>(data: T | Promise<T>): Promise<T> => Promise.resolve(data)
