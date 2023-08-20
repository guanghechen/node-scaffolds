export interface IPromiseDispatch {
  resolve(): void
  reject(error: unknown): void
}

export interface IReporter {
  reportError(error: unknown): void
}
