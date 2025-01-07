/* eslint-disable no-param-reassign */
import fastGlob from 'fast-glob'
import fs from 'node:fs'
import nodePath from 'node:path'
import process from 'node:process'
import {
  GITIGNORE_FILES_PATTERN,
  isIgnoredByIgnoreFiles,
  isIgnoredByIgnoreFilesSync,
} from './ignore'
import type {
  ExpandDirectoriesOption,
  GlobTask,
  IFilepathPredicate,
  IGlobTaskFilter,
  IGlobTaskOptions,
  IGlobTaskResult,
  Options,
} from './types'
import { isDirectory, isDirectorySync, isNegativePattern, toPath } from './util'

const assertPatternsInput = (patterns: ReadonlyArray<string>): void | never => {
  if (patterns.some(pattern => typeof pattern !== 'string')) {
    throw new TypeError('Patterns must be a string or an array of strings')
  }
}

const normalizePathForDirectoryGlob = (filepath: string, cwd: string): string => {
  const path = isNegativePattern(filepath) ? filepath.slice(1) : filepath
  return nodePath.isAbsolute(path) ? path : nodePath.join(cwd, path)
}

const getDirectoryGlob = ({
  directoryPath,
  files,
  extensions,
}: {
  directoryPath: string
  files?: ReadonlyArray<string>
  extensions?: ReadonlyArray<string>
}): string[] => {
  const extensionGlob: string =
    extensions && extensions.length > 0
      ? `.${extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0]}`
      : ''
  return files
    ? files.map(file =>
        nodePath.posix.join(
          directoryPath,
          `**/${nodePath.extname(file) ? file : `${file}${extensionGlob}`}`,
        ),
      )
    : [nodePath.posix.join(directoryPath, `**${extensionGlob ? `/*${extensionGlob}` : ''}`)]
}

const directoryToGlob = async (
  directoryPaths: string[],
  {
    cwd = process.cwd(),
    files,
    extensions,
  }: { cwd?: string; files?: ReadonlyArray<string>; extensions?: ReadonlyArray<string> } = {},
): Promise<string[]> => {
  const globs = await Promise.all(
    directoryPaths.map(async directoryPath =>
      (await isDirectory(normalizePathForDirectoryGlob(directoryPath, cwd)))
        ? getDirectoryGlob({ directoryPath, files, extensions })
        : directoryPath,
    ),
  )

  return globs.flat()
}

const directoryToGlobSync = (
  directoryPaths: string[],
  {
    cwd = process.cwd(),
    files,
    extensions,
  }: { cwd?: string; files?: ReadonlyArray<string>; extensions?: ReadonlyArray<string> } = {},
): string[] =>
  directoryPaths.flatMap(directoryPath =>
    isDirectorySync(normalizePathForDirectoryGlob(directoryPath, cwd))
      ? getDirectoryGlob({ directoryPath, files, extensions })
      : directoryPath,
  )

const toPatternsArray = (patterns: string | ReadonlyArray<string>): string[] => {
  const resolvedPatterns: string[] = [...new Set([patterns].flat())]
  assertPatternsInput(resolvedPatterns)
  return resolvedPatterns
}

const checkCwdOption = (cwd: string | undefined): void | never => {
  if (!cwd) {
    return
  }

  let stat
  try {
    stat = fs.statSync(cwd)
  } catch {
    return
  }

  if (!stat.isDirectory()) {
    throw new Error('The `cwd` option must be a path to a directory')
  }
}

const normalizeOptions = (options: Partial<Options> = {}): Options => {
  const cwd = toPath(options.cwd ?? process.cwd())
  const resolvedOptions: Options = {
    ...options,
    ignore: options.ignore ?? [],
    expandDirectories: options.expandDirectories ?? true,
    cwd: toPath(cwd),
  }
  checkCwdOption(cwd)
  return resolvedOptions
}

const createFilterFunction = (isIgnored?: IFilepathPredicate | false): IGlobTaskFilter => {
  const seen = new Set()

  return (fastGlobResult: IGlobTaskResult): boolean => {
    const pathKey = nodePath.normalize(fastGlobResult.path ?? fastGlobResult)
    if (seen.has(pathKey) || (isIgnored && isIgnored(pathKey))) return false
    seen.add(pathKey)
    return true
  }
}

const getIgnoreFilesPatterns = (options: Options): string[] => {
  const { ignoreFiles = [], gitignore } = options

  const patterns = ignoreFiles ? toPatternsArray(ignoreFiles) : []
  if (gitignore) {
    patterns.push(GITIGNORE_FILES_PATTERN)
  }

  return patterns
}

const getFilter = async (options: Options): Promise<IGlobTaskFilter> => {
  const ignoreFilesPatterns = getIgnoreFilesPatterns(options)
  return createFilterFunction(
    ignoreFilesPatterns.length > 0 && (await isIgnoredByIgnoreFiles(ignoreFilesPatterns, options)),
  )
}

const getFilterSync = (options: Options): IGlobTaskFilter => {
  const ignoreFilesPatterns = getIgnoreFilesPatterns(options)
  return createFilterFunction(
    ignoreFilesPatterns.length > 0 && isIgnoredByIgnoreFilesSync(ignoreFilesPatterns, options),
  )
}

const convertNegativePatterns = (patterns: string[], options: IGlobTaskOptions): GlobTask[] => {
  const tasks: GlobTask[] = []

  while (patterns.length > 0) {
    const index = patterns.findIndex(pattern => isNegativePattern(pattern))

    if (index === -1) {
      tasks.push({ patterns, options })
      break
    }

    const ignorePattern = patterns[index].slice(1)

    for (const task of tasks) {
      if (task.options.ignore) {
        task.options.ignore.push(ignorePattern)
      }
    }

    if (index !== 0) {
      tasks.push({
        patterns: patterns.slice(0, index),
        options: {
          ...options,
          ignore: [...(options.ignore ?? []), ignorePattern],
        },
      })
    }

    patterns = patterns.slice(index + 1)
  }
  return tasks
}

const normalizeExpandDirectoriesOption = (
  expandDirectories?: ExpandDirectoriesOption,
  cwd?: string,
): { files?: ReadonlyArray<string>; extensions?: ReadonlyArray<string> } => ({
  ...(cwd ? { cwd } : {}),
  ...((Array.isArray(expandDirectories) ? { files: expandDirectories } : expandDirectories) as any),
})

const generateTasks = async (patterns: string[], options: Options): Promise<GlobTask[]> => {
  const globTasks = convertNegativePatterns(patterns, options)

  const { cwd, expandDirectories } = options

  if (!expandDirectories) {
    return globTasks
  }

  const directoryToGlobOptions = normalizeExpandDirectoriesOption(expandDirectories, cwd)

  return Promise.all(
    globTasks.map(async task => {
      let { patterns } = task
      const { options: taskOptions } = task

      ;[patterns, taskOptions.ignore] = await Promise.all([
        directoryToGlob(patterns, directoryToGlobOptions),
        directoryToGlob(taskOptions.ignore ?? [], { cwd }),
      ])

      return { patterns, options: taskOptions }
    }),
  )
}

const generateTasksSync = (patterns: string[], options: Options): GlobTask[] => {
  const globTasks = convertNegativePatterns(patterns, options)
  const { cwd, expandDirectories } = options

  if (!expandDirectories) {
    return globTasks
  }

  const directoryToGlobSyncOptions = normalizeExpandDirectoriesOption(expandDirectories, cwd)

  return globTasks.map(task => {
    let { patterns } = task
    const { options: taskOptions } = task

    patterns = directoryToGlobSync(patterns, directoryToGlobSyncOptions)
    taskOptions.ignore = directoryToGlobSync(taskOptions.ignore ?? [], { cwd })
    return { patterns, options: taskOptions }
  })
}

export const globby = async (patterns: string[], options: Partial<Options>): Promise<string[]> => {
  patterns = toPatternsArray(patterns)
  options = normalizeOptions(options)
  const [tasks, filter] = await Promise.all([generateTasks(patterns, options), getFilter(options)])

  const results: IGlobTaskResult[][] = await Promise.all(
    tasks.map(task => fastGlob(task.patterns, task.options) as Promise<IGlobTaskResult[]>),
  )
  return results.flat().filter(filter)
}

export const globbySync = (patterns: string[], options: Partial<Options>): string[] => {
  patterns = toPatternsArray(patterns)
  options = normalizeOptions(options)
  const tasks = generateTasksSync(patterns, options)
  const filter: IGlobTaskFilter = getFilterSync(options)
  const results: IGlobTaskResult[][] = tasks.map(
    task => fastGlob.sync(task.patterns, task.options) as IGlobTaskResult[],
  )
  return results.flat().filter(result => filter(result))
}
