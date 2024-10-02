export type ILoggerMessage = string | (() => string)

export class Logger {
  public shouldBeVerbose: boolean

  constructor(shouldBeVerbose: boolean) {
    this.shouldBeVerbose = shouldBeVerbose
  }

  public verbose(message: ILoggerMessage, shouldBeVerbose = this.shouldBeVerbose): void {
    if (!shouldBeVerbose) return
    const details: string = typeof message === 'function' ? message() : message
    console.log(details)
  }
}

export const reporter = new Logger(false)
