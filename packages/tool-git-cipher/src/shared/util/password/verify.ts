import { destroyBytes } from '@guanghechen/byte'
import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import { decodeAuthTag, decodeCryptBytes } from '../../SecretConfig'
import type { ISecretConfigData } from '../../SecretConfig.types'

export async function verifyWorkspacePassword(
  cryptSecretConfig: Readonly<ISecretConfigData>,
  password: Uint8Array,
): Promise<boolean> {
  let mainCipherFactory: ICipherFactory | undefined
  let passwordCipher: ICipher | undefined
  let secret: Uint8Array | undefined
  let verified: boolean = false
  try {
    mainCipherFactory = new AesGcmCipherFactoryBuilder({
      keySize: cryptSecretConfig.mainKeySize,
      ivSize: cryptSecretConfig.mainIvSize,
    }).buildFromPassword(password, cryptSecretConfig.pbkdf2Options)
    passwordCipher = mainCipherFactory.cipher()

    // Decrypt secret.
    const cryptSecretBytes: Uint8Array | undefined = decodeCryptBytes(cryptSecretConfig.secret)
    const authTag: Uint8Array | undefined = decodeAuthTag(cryptSecretConfig.secretAuthTag)
    secret = passwordCipher.decrypt(cryptSecretBytes, { authTag })

    verified = true
  } catch (error) {
    if (/Unsupported state or unable to authenticate data/.test((error as any)?.message ?? '')) {
      verified = false
    } else {
      throw error
    }
  } finally {
    mainCipherFactory?.destroy()
    passwordCipher?.destroy()
    if (secret) {
      destroyBytes(secret)
      secret = undefined
    }
  }
  return verified
}
