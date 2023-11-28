// eslint-disable-next-line import/no-extraneous-dependencies
import { name, version } from '../../../package.json' assert { type: 'json' }

export const COMMAND_NAME: string = 'ghc-git-cipher'
export const COMMAND_VERSION: string = version
export const PACKAGE_NAME: string = name

// Status code of custom error.
export enum CustomErrorCode {
  // Invalid password.
  BAD_PASSWORD = 'BAD_PASSWORD',

  // Cancelled the operation.
  CANCELLED = 'CANCELED',

  // Entered passwords differ.
  ENTERED_PASSWORD_DIFFER = 'ENTERED_PASSWORD_DIFFER',

  // Exit the program softly.
  SOFT_EXITING = 'EXIT',

  // Incorrect password entered.
  WRONG_PASSWORD = 'WRONG_PASSWORD',
}

export const CustomErrorCodeList: CustomErrorCode[] = [
  CustomErrorCode.BAD_PASSWORD,
  CustomErrorCode.CANCELLED,
  CustomErrorCode.ENTERED_PASSWORD_DIFFER,
  CustomErrorCode.SOFT_EXITING,
  CustomErrorCode.WRONG_PASSWORD,
]

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
