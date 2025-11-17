/**
 * WebContainer Module - Centralized exports
 */

// WebContainer Core
export {
  bootWebContainer,
  getWebContainer,
  isWebContainerBooted,
  writeFiles,
  writeFile,
  readFile,
  readDirectory,
  deleteFile,
  fileExists,
  spawnProcess,
  installDependencies,
  startDevServer,
  runCommand,
  getFileTree,
  clearWebContainer,
} from './index'

// React Hooks
export {
  useWebContainer,
  useWebContainerStatus,
  useTerminalOutput,
  useFileSync,
} from './use-webcontainer'

export type {
  UseWebContainerOptions,
} from './use-webcontainer'
