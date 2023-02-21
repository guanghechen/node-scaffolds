import { locateFixtures } from 'jest.helper'
import fs from 'node:fs'
import type { ICipher, ICipherFactory } from '../src'
import { AesGcmCipherFactoryBuilder } from '../src'

describe('AesGcmCipher', function () {
  describe('buildFromSecret', function () {
    const cipherFactoryBuilder = new AesGcmCipherFactoryBuilder({ ivSize: 16 })
    const secret = cipherFactoryBuilder.createRandomSecret()
    const cipherFactory = cipherFactoryBuilder.buildFromSecret(secret)
    testCipher(cipherFactory, () => cipherFactoryBuilder.createRandomIv())
  })

  describe('buildFromPassword', function () {
    const cipherFactoryBuilder = new AesGcmCipherFactoryBuilder()
    const password: Buffer = Buffer.from('guanghechen')
    const cipherFactory = cipherFactoryBuilder.buildFromPassword(password, {
      salt: 'salt',
      iterations: 100000,
      digest: 'sha256',
    })
    testCipher(cipherFactory, () => cipherFactoryBuilder.createRandomIv())
  })

  test('destroy', function () {
    const cipherFactoryBuilder = new AesGcmCipherFactoryBuilder({ keySize: 16, ivSize: 12 })
    const cipherFactory = cipherFactoryBuilder.buildFromSecret(
      cipherFactoryBuilder.createRandomSecret(),
    )

    expect(cipherFactory.alive).toEqual(true)
    expect(() => cipherFactory.cipher()).not.toThrow()

    cipherFactory.destroy()
    expect(cipherFactory.alive).toEqual(false)

    expect(() => cipherFactory.cipher()).toThrow('[AesGcmCipherFactory] Factory has been destroyed')
    expect(() => cipherFactory.cipher({ iv: cipherFactoryBuilder.createRandomIv() })).toThrow(
      '[AesGcmCipherFactory] Factory has been destroyed',
    )
  })

  test('complex', function () {
    const cipherFactoryBuilder = new AesGcmCipherFactoryBuilder({ ivSize: 16 })
    const secret = cipherFactoryBuilder.createRandomSecret()
    const cipherFactory = cipherFactoryBuilder.buildFromSecret(secret)

    const originalPlainContent = 'Hello, world!'
    const originalPlainBytes = Buffer.from(originalPlainContent, 'utf8')
    const cipher1 = cipherFactory.cipher()
    const cryptResult1 = cipher1.encrypt(originalPlainBytes)
    expect(cipher1.encrypt(originalPlainBytes)).toEqual(cryptResult1)
    expect(cipher1.decrypt(cryptResult1.cryptBytes, { authTag: cryptResult1.authTag })).toEqual(
      originalPlainBytes,
    )

    const secret2 = cipherFactoryBuilder.createRandomSecret()
    const cipherFactory2 = cipherFactoryBuilder.buildFromSecret(secret2)
    const cipher2 = cipherFactory2.cipher()
    const cryptResult2 = cipher2.encrypt(originalPlainBytes)
    expect(cipher2.decrypt(cryptResult2.cryptBytes, { authTag: cryptResult2.authTag })).toEqual(
      originalPlainBytes,
    )

    expect(cryptResult1.cryptBytes.byteLength).toEqual(cryptResult2.cryptBytes.byteLength)
    expect(cryptResult1.cryptBytes).not.toEqual(cryptResult2.cryptBytes)

    expect(cipher1.encrypt(originalPlainBytes)).toEqual(cryptResult1)
    expect(cipher1.decrypt(cryptResult1.cryptBytes, { authTag: cryptResult1.authTag })).toEqual(
      originalPlainBytes,
    )
    expect(cipher2.encrypt(originalPlainBytes)).toEqual(cryptResult2)
    expect(cipher2.decrypt(cryptResult2.cryptBytes, { authTag: cryptResult2.authTag })).toEqual(
      originalPlainBytes,
    )

    cipher1.destroy()
    cipher2.destroy()

    expect(() => cipher1.encrypt(originalPlainBytes)).toThrow(
      'cannot call `.encipher()` cause the iv and key have been destroyed',
    )
    expect(() => cipher1.decrypt(cryptResult1.cryptBytes)).toThrow(
      'cannot call `.decipher()` cause the iv and key have been destroyed',
    )
    expect(() => cipher2.encrypt(originalPlainBytes)).toThrow(
      'cannot call `.encipher()` cause the iv and key have been destroyed',
    )
    expect(() => cipher2.decrypt(cryptResult2.cryptBytes)).toThrow(
      'cannot call `.decipher()` cause the iv and key have been destroyed',
    )
  })
})

function testCipher(cipherFactory: ICipherFactory, getRandomIv: () => Buffer): void {
  test('lazy', () => {
    const cipher1 = cipherFactory.cipher()
    const cipher2 = cipherFactory.cipher()
    expect(cipher2).toBe(cipher1)

    const randomIv = getRandomIv()
    const cipher3 = cipherFactory.cipher({ iv: randomIv })
    expect(cipher3).not.toBe(cipher1)
    expect(cipher3).not.toBe(cipher2)

    const cipher4 = cipherFactory.cipher({ iv: randomIv })
    expect(cipher4).not.toBe(cipher1)
    expect(cipher4).not.toBe(cipher2)
    expect(cipher4).not.toBe(cipher3)

    const cipher5 = cipherFactory.cipher()
    expect(cipher5).toBe(cipher1)
    expect(cipher5).toBe(cipher2)
    expect(cipher5).not.toBe(cipher3)
    expect(cipher5).not.toBe(cipher4)
  })

  describe('encrypt / decrypt', () => {
    const sourceFilepath: string = locateFixtures('basic/big-file.md')
    const originalPlainBytes: Buffer = fs.readFileSync(sourceFilepath)

    test('default iv', () => {
      const cipher: ICipher = cipherFactory.cipher()
      const { cryptBytes, authTag } = cipher.encrypt(originalPlainBytes)
      expect(cryptBytes).not.toEqual(originalPlainBytes)
      expect(cryptBytes.byteLength).toEqual(originalPlainBytes.byteLength)
      expect(authTag?.byteLength).toEqual(16)

      {
        const plainBytes = cipher.decrypt(cryptBytes, { authTag })
        expect(plainBytes).toEqual(originalPlainBytes)
      }

      // Without authTag.
      {
        const plainBytes = cipher.decrypt(cryptBytes)
        expect(plainBytes).toEqual(originalPlainBytes)
      }
    })

    test('random iv', () => {
      const iv: Buffer = getRandomIv()
      const cipher: ICipher = cipherFactory.cipher({ iv })
      const { cryptBytes, authTag } = cipher.encrypt(originalPlainBytes)
      expect(cryptBytes).not.toEqual(originalPlainBytes)
      expect(cryptBytes.byteLength).toEqual(originalPlainBytes.byteLength)
      expect(authTag?.byteLength).toEqual(16)

      {
        const plainBytes = cipher.decrypt(cryptBytes, { authTag })
        expect(plainBytes).toEqual(originalPlainBytes)
      }

      // Without authTag.
      {
        const plainBytes = cipher.decrypt(cryptBytes)
        expect(plainBytes).toEqual(originalPlainBytes)
      }
    })
  })

  describe('encryptJson / decryptJson', () => {
    const originalPlainData = {
      name: 'alice',
      gender: 'female',
      age: 33,
    }
    const originalPlainContent: string = JSON.stringify(originalPlainData)
    const originalPlainBytes: Buffer = Buffer.from(originalPlainContent, 'utf8')

    test('customize iv', () => {
      const cipher: ICipher = cipherFactory.cipher()
      const { cryptBytes, authTag } = cipher.encryptJson(originalPlainData)
      expect(cryptBytes).not.toEqual(originalPlainBytes)
      expect(cryptBytes.byteLength).toEqual(originalPlainBytes.byteLength)
      expect(authTag?.byteLength).toEqual(16)

      {
        const plainData = cipher.decryptJson(cryptBytes, { authTag })
        expect(plainData).toEqual(originalPlainData)
      }

      // Without authTag.
      {
        const plainData = cipher.decryptJson(cryptBytes)
        expect(plainData).toEqual(originalPlainData)
      }
    })

    test('random iv', () => {
      const iv: Buffer = getRandomIv()
      const cipher: ICipher = cipherFactory.cipher({ iv })
      const { cryptBytes, authTag } = cipher.encryptJson(originalPlainData)
      expect(cryptBytes).not.toEqual(originalPlainBytes)
      expect(cryptBytes.byteLength).toEqual(originalPlainBytes.byteLength)
      expect(authTag?.byteLength).toEqual(16)

      {
        const plainData = cipher.decryptJson(cryptBytes, { authTag })
        expect(plainData).toEqual(originalPlainData)
      }

      // Without authTag.
      {
        const plainData = cipher.decryptJson(cryptBytes)
        expect(plainData).toEqual(originalPlainData)
      }
    })
  })

  test('cleanup', () => {
    {
      const cipher = cipherFactory.cipher()
      expect(() => cipher.encipher()).not.toThrow()
      expect(() => cipher.decipher({ authTag: undefined })).not.toThrow()
      cipher.destroy()
      expect(() => cipher.encipher()).toThrow(
        'cannot call `.encipher()` cause the iv and key have been destroyed.',
      )
      expect(() => cipher.decipher({ authTag: undefined })).toThrow(
        'cannot call `.decipher()` cause the iv and key have been destroyed.',
      )
    }

    {
      const cipher = cipherFactory.cipher({ iv: getRandomIv() })
      expect(() => cipher.encipher()).not.toThrow()
      expect(() => cipher.decipher({ authTag: undefined })).not.toThrow()
      cipher.destroy()
      expect(() => cipher.encipher()).toThrow(
        'cannot call `.encipher()` cause the iv and key have been destroyed.',
      )
      expect(() => cipher.decipher({ authTag: undefined })).toThrow(
        'cannot call `.decipher()` cause the iv and key have been destroyed.',
      )
    }
  })
}
