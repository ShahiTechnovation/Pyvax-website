/**
 * Runtime Module - Centralized exports for action execution and parsing
 */

// Message Parser
export {
  parseAIMessage,
  extractCodeBlocks,
  detectProjectType,
  generatePackageJson,
  validateFileContent,
  sanitizeCommand,
  groupFilesByDirectory,
  estimateComplexity,
} from './message-parser'

export type {
  FileModification,
  ShellAction,
  Action,
  ParsedMessage,
} from './message-parser'

// Action Runner
export {
  executeActions,
  applyAIResponse,
  applyFileModifications,
  batchWriteFiles,
  rollbackAction,
} from './action-runner'

export type {
  ActionResult,
  RunnerProgress,
  RunnerOptions,
} from './action-runner'
