import { EventTypes, eventBus } from '../events'

/**
 *
 */
export interface Cipher {
  /**
   * Create a secret with key
   */
  createSecret(): Buffer
  /**
   * Load key of cipher from secret
   * @param secret
   */
  initKeyFromSecret(secret: Readonly<Buffer>): void | never
  /**
   * Load key of cipher from password
   * @param password
   */
  initKeyFromPassword(password: Readonly<Buffer>): void | never
  /**
   * Encrypt plainData
   */
  encrypt(plainData: Readonly<Buffer>): Buffer
  /**
   * Decrypt cipherData
   */
  decrypt(cipherData: Readonly<Buffer>): Buffer
  /**
   * Encrypt contents from plainFilepath,
   * and save the result into cipherFilepath
   */
  encryptFile(plainFilepath: string, cipherFilepath: string): Promise<void>
  /**
   * Decrypt contents from cipherFilepath,
   * and save the result into plainFilepath
   */
  decryptFile(cipherFilepath: string, plainFilepath: string): Promise<void>
  /**
   * Destroy secret and sensitive data
   */
  cleanup(): void
}

/**
 * Factory class that produces Cipher
 */
export interface CipherFactory {
  create(): Cipher
}

/**
 *
 */
export abstract class BaseCipher implements Cipher {
  constructor() {
    eventBus.on(EventTypes.EXITING, () => this.cleanup())
  }

  /**
   * @override
   */
  public abstract createSecret(): Buffer

  /**
   * @override
   */
  public abstract initKeyFromSecret(secret: Readonly<Buffer>): void | never

  /**
   * @override
   */
  public abstract initKeyFromPassword(password: Readonly<Buffer>): void | never

  /**
   * @override
   */
  public abstract encrypt(plainData: Buffer): Buffer

  /**
   * @override
   */
  public abstract decrypt(cipherData: Buffer): Buffer

  /**
   * @override
   */
  public abstract encryptFile(
    plainFilepath: string,
    cipherFilepath: string,
  ): Promise<void>

  /**
   * @override
   */
  public abstract decryptFile(
    cipherFilepath: string,
    plainFilepath: string,
  ): Promise<void>

  /**
   * @override
   */
  public abstract cleanup(): void
}
