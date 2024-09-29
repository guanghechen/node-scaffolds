import { locateFixtures } from 'jest.helper'
import { commandExists, commandExistsSync } from '../src'

const isUsingWindows: boolean = process.platform === 'win32'

describe('commandExists', () => {
  describe('async', () => {
    it('it should find a command named ls or xcopy', async () => {
      let commandToUse = 'ls'
      if (isUsingWindows) {
        commandToUse = 'xcopy'
      }

      expect(await commandExists(commandToUse)).toEqual(true)
    })

    it('it should not find a command named fdsafdsafdsafdsafdsa', async () => {
      expect(await commandExists('fdsafdsafdsafdsafdsa')).toEqual(false)
    })
  })

  describe('sync', () => {
    it('it should find a command named ls or xcopy', () => {
      let commandToUse = 'ls'
      if (isUsingWindows) {
        commandToUse = 'xcopy'
      }
      expect(commandExistsSync(commandToUse)).toEqual(true)
    })

    it('it should not find a command named fdsafdsafdsafdsafdsa', () => {
      expect(commandExistsSync('fdsafdsafdsafdsafdsa')).toEqual(false)
    })

    it('it should not find a command named ls or xcopy prefixed with some nonsense', () => {
      let commandToUse = 'fdsafdsa ls'
      if (isUsingWindows) {
        commandToUse = 'fdsafdsaf xcopy'
      }
      expect(commandExistsSync(commandToUse)).toEqual(false)
    })

    it('it should not execute some nefarious code', () => {
      expect(commandExistsSync('ls; touch /tmp/foo0')).toEqual(false)
    })

    it('it should not execute some nefarious code', () => {
      expect(commandExistsSync('ls touch /tmp/foo0')).toEqual(false)
    })
  })

  describe('local file', () => {
    it('it should report false if there is a non-executable file with that name', async () => {
      const commandToUse = locateFixtures('command-exists/non-executable-script.js')
      expect(await commandExists(commandToUse)).toEqual(false)
    })

    if (!isUsingWindows) {
      it('it should report true if there is an executable file with that name', async () => {
        const commandToUse = locateFixtures('command-exists/executable-script.js')
        expect(await commandExists(commandToUse)).toEqual(true)
      })
    }

    if (isUsingWindows) {
      it('it should report true if there is an executable file with that name', async () => {
        const commandToUse = locateFixtures('command-exists\\executable-script.cmd')
        expect(await commandExists(commandToUse)).toEqual(true)
      })

      it('it should report false if there is a double quotation mark in the file path', () => {
        const commandToUse = locateFixtures('command-exists\\executable-script.cmd')
        expect(commandExistsSync(commandToUse)).toEqual(false)
      })
    }
  })

  describe('absolute path', () => {
    it('it should report true if there is a command with that name in absolute path', async () => {
      const commandToUse = locateFixtures('command-exists/executable-script.js')
      expect(await commandExists(commandToUse)).toEqual(true)
    })

    it('it should report false if there is not a command with that name in absolute path', () => {
      const commandToUse = locateFixtures('executable-script.js')
      expect(commandExistsSync(commandToUse)).toEqual(false)
    })
  })
})
