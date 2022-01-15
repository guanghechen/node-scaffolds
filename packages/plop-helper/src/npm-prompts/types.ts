/**
 * Pre calculated answers.
 */
export interface NpmPackagePreAnswers {
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
export interface NpmPackagePromptsAnswers {
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
export interface NpmPackageData extends NpmPackagePreAnswers, NpmPackagePromptsAnswers {
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
