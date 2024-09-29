import { exec, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const constants = fs.constants || fs
const isUsingWindows = process.platform === 'win32'

// Helper function to check if a file exists asynchronously
const fileNotExists = async (commandName: string): Promise<boolean> => {
  return new Promise<boolean>(resolve =>
    fs.access(commandName, constants.F_OK, error => resolve(!error)),
  )
}

// Helper function to check if a file exists synchronously
const fileNotExistsSync = (commandName: string): boolean => {
  try {
    fs.accessSync(commandName, constants.F_OK)
    return false
  } catch (_) {
    return true
  }
}

// Helper function to check if a file is executable asynchronously
const localExecutable = (commandName: string): Promise<boolean> => {
  return new Promise<boolean>(resolve =>
    fs.access(commandName, constants.F_OK | constants.X_OK, error => resolve(!error)),
  )
}

// Helper function to check if a file is executable synchronously
const localExecutableSync = (commandName: string): boolean => {
  try {
    fs.accessSync(commandName, constants.F_OK | constants.X_OK)
    return true
  } catch (_) {
    return false
  }
}

// Check if a command exists on Unix asynchronously
const commandExistsUnix = async (
  commandName: string,
  cleanedCommandName: string,
): Promise<boolean> => {
  const isFile: boolean = await fileNotExists(commandName)
  if (isFile) return localExecutable(commandName)
  return new Promise<boolean>(resolve => {
    exec(
      `command -v ${cleanedCommandName} 2>/dev/null && { echo >&1 ${cleanedCommandName}; exit 0; }`,
      (error, stdout) => {
        resolve(!error && !!stdout)
      },
    )
  })
}

// Check if a command exists on Windows asynchronously
const commandExistsWindows = async (
  commandName: string,
  cleanedCommandName: string,
): Promise<boolean> => {
  const isValidPath =
    /^(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"|[?][*]\n])+(?:\/\/|\/|\\\\|\\)?)+$/m.test(
      commandName,
    )

  if (!isValidPath) {
    return false
  }

  return new Promise<boolean>(resolve => {
    exec(`where ${cleanedCommandName}`, error => {
      resolve(!error)
    })
  })
}

// Synchronous Unix command existence check
const commandExistsUnixSync = (commandName: string, cleanedCommandName: string): boolean => {
  if (fileNotExistsSync(commandName)) {
    try {
      const stdout = execSync(
        `command -v ${cleanedCommandName} 2>/dev/null && { echo >&1 ${cleanedCommandName}; exit 0; }`,
      )
      return !!stdout
    } catch (_) {
      return false
    }
  }
  return localExecutableSync(commandName)
}

// Synchronous Windows command existence check
const commandExistsWindowsSync = (commandName: string, cleanedCommandName: string): boolean => {
  const isValidPath =
    /^(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"|[?][*]\n])+(?:\/\/|\/|\\\\|\\)?)+$/m.test(
      commandName,
    )
  if (!isValidPath) {
    return false
  }

  try {
    const stdout = execSync(`where ${cleanedCommandName}`, { stdio: 'ignore' })
    return !!stdout
  } catch (_) {
    return false
  }
}

// Clean input based on the platform
let cleanInput = (s: string): string => {
  if (/[^A-Za-z0-9_/:=-]/.test(s)) {
    return `'${s.replace(/'/g, "'\\''")}'`
      .replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
      .replace(/\\'''/g, "\\'") // remove non-escaped single-quote if enclosed between 2 escaped ones
  }
  return s
}

if (isUsingWindows) {
  cleanInput = (s: string): string => {
    const isPathName = /[\\]/.test(s)
    if (isPathName) {
      const dirname = `"${path.dirname(s)}"`
      const basename = `"${path.basename(s)}"`
      return `${dirname}:${basename}`
    }
    return `"${s}"`
  }
}

// Main function to check if a command exists asynchronously
export const commandExists = (commandName: string): Promise<boolean> | void => {
  const cleanedCommandName = cleanInput(commandName)
  if (isUsingWindows) {
    return commandExistsWindows(commandName, cleanedCommandName)
  } else {
    return commandExistsUnix(commandName, cleanedCommandName)
  }
}

// Synchronous version of the main function
export const commandExistsSync = (commandName: string): boolean => {
  const cleanedCommandName = cleanInput(commandName)
  if (isUsingWindows) {
    return commandExistsWindowsSync(commandName, cleanedCommandName)
  } else {
    return commandExistsUnixSync(commandName, cleanedCommandName)
  }
}
