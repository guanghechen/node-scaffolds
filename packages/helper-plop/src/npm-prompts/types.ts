/**
 * Pre calculated answers.
 */
export interface INpmPackagePreAnswers {
  /**
   * Current workspace directory.
   */
  cwd: string
  /**
   * Whether if this package under a monorepo.
   */
  isMonorepo: boolean
}

/**
 * Answers of prompts.
 */
export interface INpmPackagePromptsAnswers {
  /**
   * Npm package name.
   */
  packageName: string
  /**
   * Package author.
   */
  packageAuthor: string
  /**
   * Package version.
   */
  packageVersion: string
  /**
   * Package description.
   */
  packageDescription: string
  /**
   * Package location (path relative to the current directory).
   */
  packageLocation: string
}

/**
 * Answers for prompts defined in this file.
 */
export interface INpmPackageData extends INpmPackagePreAnswers, INpmPackagePromptsAnswers {
  /**
   * Package usage.
   */
  packageUsage: string
  /**
   * Git repository name.
   */
  repositoryName: string
  /**
   * Git repository homepage.
   */
  repositoryHomepage: string
}
