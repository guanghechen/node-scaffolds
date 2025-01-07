import type FastGlob from 'fast-glob'

export type IGlobEntry = FastGlob.Entry
export type IGlobTaskOptions = Omit<FastGlob.Options, 'cwd'>
export type IGlobTaskResult = IGlobEntry & string
export type IGlobTaskFilter = (result: IGlobTaskResult) => boolean

export interface GlobTask {
  readonly patterns: string[]
  readonly options: IGlobTaskOptions
}

export type ExpandDirectoriesOption =
  | boolean
  | ReadonlyArray<string>
  | { files?: ReadonlyArray<string>; extensions?: ReadonlyArray<string> }

export type Options = {
  readonly expandDirectories?: ExpandDirectoriesOption
  readonly gitignore?: boolean
  readonly ignoreFiles?: string | ReadonlyArray<string>
  readonly cwd?: string
} & IGlobTaskOptions

export interface IFileItem {
  filePath: string
  content: string
}

export type IFilepathPredicate = (filepath: string) => boolean

export interface IRawIgnoreOptions {
  readonly cwd?: string
  readonly suppressErrors?: boolean
  readonly deep?: number
  readonly ignore?: string[]
}

export interface IIgnoreOptions {
  readonly cwd: string
  readonly suppressErrors: boolean
  readonly deep: number
  readonly ignore: string[]
}
