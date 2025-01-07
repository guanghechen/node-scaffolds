/* eslint-disable no-param-reassign */
import fastGlob from 'fast-glob'
import gitIgnore from 'ignore'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import type { IFileItem, IFilepathPredicate, IIgnoreOptions, IRawIgnoreOptions } from './types'
import { isNegativePattern, slash, toPath } from './util'

const defaultIgnoredDirectories = ['**/node_modules', '**/flow-typed', '**/coverage', '**/.git']
const ignoreFilesGlobOptions = {
  absolute: true,
  dot: true,
}

export const GITIGNORE_FILES_PATTERN = '**/.gitignore'

const applyBaseToPattern = (pattern: string, base: string): string =>
  isNegativePattern(pattern)
    ? '!' + path.posix.join(base, pattern.slice(1))
    : path.posix.join(base, pattern)

const parseIgnoreFile = (file: IFileItem, cwd: string): string[] => {
  const base = slash(path.relative(cwd, path.dirname(file.filePath)))

  return file.content
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => applyBaseToPattern(pattern, base))
}

const toRelativePath = (fileOrDirectory: string, cwd: string): string | never => {
  cwd = slash(cwd)
  if (path.isAbsolute(fileOrDirectory)) {
    if (slash(fileOrDirectory).startsWith(cwd)) {
      return path.relative(cwd, fileOrDirectory)
    }
    throw new Error(`Path ${fileOrDirectory} is not in cwd ${cwd}`)
  }
  return fileOrDirectory
}

const getIsIgnoredPredicate = (files: IFileItem[], cwd: string): IFilepathPredicate => {
  const patterns = files.flatMap(file => parseIgnoreFile(file, cwd))
  const ignores = gitIgnore().add(patterns)

  return filepath => {
    filepath = toPath(filepath)
    filepath = toRelativePath(filepath, cwd)
    return filepath ? ignores.ignores(slash(filepath)) : false
  }
}

const normalizeOptions = (options: IRawIgnoreOptions = {}): IIgnoreOptions => ({
  cwd: options.cwd ? toPath(options.cwd) : process.cwd(),
  suppressErrors: Boolean(options.suppressErrors),
  deep: typeof options.deep === 'number' ? options.deep : Number.POSITIVE_INFINITY,
  ignore: [...(options.ignore ?? []), ...defaultIgnoredDirectories],
})

export const isIgnoredByIgnoreFiles = async (
  patterns: string | string[],
  options: IRawIgnoreOptions,
): Promise<IFilepathPredicate> => {
  const { cwd, suppressErrors, deep, ignore } = normalizeOptions(options)

  const paths = await fastGlob(patterns, {
    cwd,
    suppressErrors,
    deep,
    ignore,
    ...ignoreFilesGlobOptions,
  })

  const files = await Promise.all(
    paths.map(async filePath => ({
      filePath,
      content: await fsPromises.readFile(filePath, 'utf8'),
    })),
  )

  return getIsIgnoredPredicate(files, cwd)
}

export const isIgnoredByIgnoreFilesSync = (
  patterns: string | string[],
  options: IRawIgnoreOptions,
): IFilepathPredicate => {
  const { cwd, suppressErrors, deep, ignore } = normalizeOptions(options)

  const paths = fastGlob.sync(patterns, {
    cwd,
    suppressErrors,
    deep,
    ignore,
    ...ignoreFilesGlobOptions,
  })

  const files = paths.map(filePath => ({
    filePath,
    content: fs.readFileSync(filePath, 'utf8'),
  }))

  return getIsIgnoredPredicate(files, cwd)
}

export const isGitIgnored = (options: IRawIgnoreOptions): Promise<IFilepathPredicate> =>
  isIgnoredByIgnoreFiles(GITIGNORE_FILES_PATTERN, options)

export const isGitIgnoredSync = (options: IRawIgnoreOptions): IFilepathPredicate =>
  isIgnoredByIgnoreFilesSync(GITIGNORE_FILES_PATTERN, options)
