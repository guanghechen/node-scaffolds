import { locateFixtures } from 'jest.helper'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import type { ICipher } from '../src'
import { AesCipherFactory } from '../src'

describe('AesCipher', function () {
  describe('init from secret', function () {
    const sourceFilepath = locateFixtures('basic/big-file.md')
    const originalContent = fs.readFileSync(sourceFilepath)

    const cipherFactory = new AesCipherFactory()
    const secret = cipherFactory.createRandomSecret()
    const cipher: ICipher = cipherFactory.initFromSecret(secret)

    test('encrypt / decrypt', () => {
      const cipherData = cipher.encrypt(originalContent)
      expect(cipherData).not.toEqual(originalContent)
      expect(cipherData.byteLength).toEqual(originalContent.byteLength)
      expect(cipher.decrypt(cipherData)).toEqual(originalContent)
    })

    test('cleanup', () => {
      expect(() => cipher.encipher()).not.toThrow()
      expect(() => cipher.decipher()).not.toThrow()
      cipher.cleanup()
      expect(() => cipher.encipher()).toThrow(
        'cannot call `.encipher()` cause the iv and key have been destroyed.',
      )
      expect(() => cipher.decipher()).toThrow(
        'cannot call `.decipher()` cause the iv and key have been destroyed.',
      )
    })
  })

  describe('init from password', function () {
    const sourceFilepath = locateFixtures('basic/big-file.md')
    const originalContent = fs.readFileSync(sourceFilepath)

    const cipherFactory = new AesCipherFactory()
    const sha256 = createHash('sha256')
    sha256.update('@guanghechen/helper-cipher')
    const password = sha256.digest()
    const cipher: ICipher = cipherFactory.initFromPassword(password, {
      salt: 'salt',
      iterations: 100000,
      keylen: 32,
      digest: 'sha256',
    })

    test('encrypt / decrypt', () => {
      const cipherData = cipher.encrypt(originalContent)
      expect(cipherData).not.toEqual(originalContent)
      expect(cipherData.byteLength).toEqual(originalContent.byteLength)
      expect(cipher.decrypt(cipherData)).toEqual(originalContent)
    })

    test('cleanup', () => {
      expect(() => cipher.encipher()).not.toThrow()
      expect(() => cipher.decipher()).not.toThrow()
      cipher.cleanup()
      expect(() => cipher.encipher()).toThrow(
        'cannot call `.encipher()` cause the iv and key have been destroyed.',
      )
      expect(() => cipher.decipher()).toThrow(
        'cannot call `.decipher()` cause the iv and key have been destroyed.',
      )
    })
  })
})
