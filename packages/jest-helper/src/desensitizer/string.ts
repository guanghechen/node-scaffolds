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
  replaceVersion: (packageName: string, packageVersion: string) => string,
): StringDesensitizer {
  const regex = /"((?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)"\s*:\s*"([\^><~]=?)?\s*([a-zA-Z\d\-._ ]+)"/g
  return text => {
    const result = text.replace(
      regex,
      (_, packageName, versionFlag = '', packageVersion) => {
        const version = replaceVersion(packageName, packageVersion)
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
  return text => {
    let result = text
    for (const desensitize of desensitizers) {
      result = desensitize(result)
    }
    return result
  }
}
