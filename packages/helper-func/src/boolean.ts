export const truthy = (..._args: any[]): boolean => true
export const truthyAsync = (..._args: any[]): Promise<boolean> => Promise.resolve(true)

export const falsy = (..._args: any[]): boolean => false
export const falsyAsync = (..._args: any[]): Promise<boolean> => Promise.resolve(false)
