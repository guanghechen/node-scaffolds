import { BigFileHelper } from '@guanghechen/helper-file'
import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import { AesCipherFactory, FileCipher, FileCipherCatalog, FileCipherPathResolver } from '../src'

describe('FileCipherCatalog', () => {
  const sourceRootDir = locateFixtures('basic')
  const encryptedRootDir = path.join(path.dirname(sourceRootDir), 'src_encrypted')
  const pathResolver = new FileCipherPathResolver({ sourceRootDir, encryptedRootDir })
  const fileHelper = new BigFileHelper({ partSuffix: '.ghc-', encoding: 'utf8' })
  const cipherFactory = new AesCipherFactory()
  const cipher = cipherFactory.initFromPassword(Buffer.from('guanghechen', 'utf8'), {
    salt: 'salt',
    iterations: 100000,
    keylen: 32,
    digest: 'sha256',
  })
  const fileCipher = new FileCipher({ cipher })
  const catalog = new FileCipherCatalog({
    pathResolver,
    fileCipher,
    fileHelper,
    maxTargetFileSize: 1024,
  })

  test('encryptDiff', () => {})
})
