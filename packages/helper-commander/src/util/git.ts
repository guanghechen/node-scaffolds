import commandExists from 'command-exists'

// Check if the git installed.
export const hasGitInstalled = (): boolean => commandExists.sync('git')
