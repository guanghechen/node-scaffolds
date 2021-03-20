import type { StringDesensitizer } from './types'

/**
 * Create a StringDesensitizer to eliminate sensitive filepath data.
 * @param baseDir
 * @param replaceString
 * @returns
 */
export function createFilepathDesensitizer(
  baseDir: string,
  replaceString = '<WORKSPACE>',
): StringDesensitizer {
  const source =
    '(?<=^|[\\b\\s])' +
    baseDir
      .replace(/[\\/]*$/, '') // Remove tailing filepath delimiter
      .replace(/[/\\]+/g, '/') // Remove unused filepath delimiter
      .replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1') // Escape special regexp characters
      .replace(/\\\//g, '[\\\\|/]')
  const regex = new RegExp(source, 'g')
  return text => text.replace(regex, replaceString)
}

/**
 * Create a StringDesensitizer to eliminate volatile package versions.
 * @param replaceVersion
 * @returns
 */
export function createPackageVersionDesensitizer(
  nextVersion: (packageVersion: string, packageName: string) => string,
  testPackageName?: (packageName: string) => boolean,
): StringDesensitizer {
  // /"((?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)"\s*:\s*"([\^><~]=?)?\s*([a-zA-Z\d\-._ ]+)"/g
  const namePattern = /((?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)/
    .source
  const versionPattern = /([\^><~]=?)?\s*([a-zA-Z\d\-._ ]+)/.source

  const versionRegex = new RegExp('^' + versionPattern + '$')
  const regex = new RegExp(
    '"' + namePattern + '"\\s*:\\s*"' + versionPattern + '"',
    'g',
  )

  return (text, key) => {
    if (key != null) {
      if (testPackageName == null || testPackageName(key)) {
        const m = versionRegex.exec(text)
        if (m != null) {
          const version = nextVersion(m[2], key)
          return (m[1] || '') + version
        }
      }
      return text
    }

    const result = text.replace(
      regex,
      (_, packageName, versionFlag = '', packageVersion) => {
        if (testPackageName != null && !testPackageName(packageName)) return _
        const version = nextVersion(packageVersion, packageName)
        return `"${packageName}": "${versionFlag}${version}"`
      },
    )
    return result
  }
}

/**
 * Compose multiple desensitizers into one.
 * @param desensitizers
 * @returns
 */
export function composeStringDesensitizers(
  ...desensitizers: ReadonlyArray<StringDesensitizer>
): StringDesensitizer {
  return (text: string, key?: string): string => {
    let result = text
    for (const desensitize of desensitizers) {
      result = desensitize(result, key)
    }
    return result
  }
}
