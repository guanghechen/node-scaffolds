import { locateFixtures } from 'jest.helper'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import type { ICipher, ICipherFactory } from '../src'
import { AesGcmCipherFactory } from '../src'

describe('AesGcmCipher', function () {
  describe('init from secret', function () {
    const cipherFactory = new AesGcmCipherFactory({ ivSize: 16 })
    const secret = cipherFactory.createRandomSecret()
    cipherFactory.initFromSecret(secret)
    testCipher(cipherFactory)
  })

  describe('init from password', function () {
    const cipherFactory = new AesGcmCipherFactory()
    const sha256 = createHash('sha256')
    sha256.update('@guanghechen/helper-cipher')
    const password = sha256.digest()
    cipherFactory.initFromPassword(password, {
      salt: 'salt',
      iterations: 100000,
      digest: 'sha256',
    })
    testCipher(cipherFactory)
  })

  test('uninitialized.', function () {
    const cipherFactory = new AesGcmCipherFactory({ keySize: 16, ivSize: 12 })
    expect(() => cipherFactory.cipher()).toThrow(
      'cannot call `.cipher()` cause the iv and key have been destroyed',
    )
    expect(() => cipherFactory.cipher({ iv: cipherFactory.createRandomIv() })).toThrow(
      'cannot call `.cipher()` cause the iv and key have been destroyed',
    )
  })

  test('reinitialized.', function () {
    const cipherFactory = new AesGcmCipherFactory({ ivSize: 16 })
    const secret = cipherFactory.createRandomSecret()
    cipherFactory.initFromSecret(secret)

    const originalPlainContent = 'Hello, world!'
    const originalPlainBytes = Buffer.from(originalPlainContent, 'utf8')
    const cipher1 = cipherFactory.cipher()
    const cryptResult1 = cipher1.encrypt(originalPlainBytes)
    expect(cipher1.encrypt(originalPlainBytes)).toEqual(cryptResult1)
    expect(cipher1.decrypt(cryptResult1.cryptBytes, { authTag: cryptResult1.authTag })).toEqual(
      originalPlainBytes,
    )

    const secret2 = cipherFactory.createRandomSecret()
    cipherFactory.initFromSecret(secret2)
    const cipher2 = cipherFactory.cipher()
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

    cipher1.cleanup()
    cipher2.cleanup()

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

function testCipher(cipherFactory: ICipherFactory): void {
  test('lazy', () => {
    const cipher1 = cipherFactory.cipher()
    const cipher2 = cipherFactory.cipher()
    expect(cipher2).toBe(cipher1)

    const randomIv = cipherFactory.createRandomIv()
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
      const iv: Buffer = cipherFactory.createRandomIv()
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
      const iv: Buffer = cipherFactory.createRandomIv()
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
      cipher.cleanup()
      expect(() => cipher.encipher()).toThrow(
        'cannot call `.encipher()` cause the iv and key have been destroyed.',
      )
      expect(() => cipher.decipher({ authTag: undefined })).toThrow(
        'cannot call `.decipher()` cause the iv and key have been destroyed.',
      )
    }

    {
      const cipher = cipherFactory.cipher({ iv: cipherFactory.createRandomIv() })
      expect(() => cipher.encipher()).not.toThrow()
      expect(() => cipher.decipher({ authTag: undefined })).not.toThrow()
      cipher.cleanup()
      expect(() => cipher.encipher()).toThrow(
        'cannot call `.encipher()` cause the iv and key have been destroyed.',
      )
      expect(() => cipher.decipher({ authTag: undefined })).toThrow(
        'cannot call `.decipher()` cause the iv and key have been destroyed.',
      )
    }
  })
}
