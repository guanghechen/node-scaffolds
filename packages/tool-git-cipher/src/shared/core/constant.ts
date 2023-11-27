// eslint-disable-next-line import/no-extraneous-dependencies
import { name, version } from '../../../package.json' assert { type: 'json' }

export const COMMAND_NAME: string = 'ghc-git-cipher'
export const COMMAND_VERSION: string = version
export const PACKAGE_NAME: string = name

// Status code of custom error.
export enum ErrorCode {
  // Invalid password.
  BAD_PASSWORD = 'BAD_PASSWORD',
  // Entered passwords differ.
  ENTERED_PASSWORD_DIFFER = 'ENTERED_PASSWORD_DIFFER',
  // Incorrect password entered.
  WRONG_PASSWORD = 'WRONG_PASSWORD',
}

// Types of the event dispatched in the event bus.
export enum EventTypes {
  /**
   * Cancelled, exit program.
   */
  CANCELED = 'CANCELED',
  /**
   * Exiting, exiting program.
   */
  EXITING = 'EXITING',
}
