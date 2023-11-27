import type { ErrorCode } from './constant'

export interface ICustomError {
  code: ErrorCode
  message: string
}
