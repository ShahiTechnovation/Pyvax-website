/**
 * Action Runner - Execute file modifications and shell commands
 * Applies AI-generated changes to WebContainer file system
 */

import { writeFile, runCommand, installDependencies, startDevServer } from '../webcontainer'
import {
  parseAIMessage,
  validateFileContent,
  sanitizeCommand,
  groupFilesByDirectory,
  type Action,
  type FileModification,
  type ShellAction,
} from './message-parser'
import { useWorkbenchStore } from '@/lib/stores/workbench-store'

export interface ActionResult {
  success: boolean
  action: Action
  error?: string
  output?: string
}

export interface RunnerProgress {
  currentAction: number
  totalActions: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  message: string
}

export interface RunnerOptions {
  onProgress?: (progress: RunnerProgress) => void
  onOutput?: (output: string) => void
  onError?: (error: string) => void
  autoInstall?: boolean
  autoStart?: boolean
}

/**
 * Execute all actions from parsed AI message
 */
export async function executeActions(
  content: string,
  options: RunnerOptions = {}
): Promise<ActionResult[]> {
  const { actions } = parseAIMessage(content)
  
  if (actions.length === 0) {
    console.log('No actions to execute')
    return []
  }
  
  console.log(`🎯 Executing ${actions.length} actions...`)
  
  const results: ActionResult[] = []
  const totalActions = actions.length
  
  // Execute actions sequentially
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    
    // Report progress
    options.onProgress?.({
      currentAction: i + 1,
      totalActions,
      status: 'running',
      message: `Processing action ${i + 1}/${totalActions}`,
    })
    
    try {
      const result = await executeSingleAction(action, options)
      results.push(result)
      
      if (!result.success) {
        console.error(`❌ Action ${i + 1} failed:`, result.error)
        
        // Optionally stop on first error
        // break
      } else {
        console.log(`✅ Action ${i + 1} completed`)
      }
    } catch (error: any) {
      console.error(`❌ Action ${i + 1} exception:`, error)
      
      results.push({
        success: false,
        action,
        error: error.message,
      })
    }
  }
  
  // Final progress update
  const allSuccessful = results.every((r) => r.success)
  options.onProgress?.({
    currentAction: totalActions,
    totalActions,
    status: allSuccessful ? 'completed' : 'failed',
    message: allSuccessful
      ? 'All actions completed successfully'
      : 'Some actions failed',
  })
  
  // Auto install dependencies if package.json was modified
  if (
    options.autoInstall &&
    results.some(
      (r) =>
        r.success &&
        r.action.type === 'file' &&
        (r.action.data as FileModification).path === 'package.json'
    )
  ) {
    await installDependencies(options.onOutput)
  }
  
  // Auto start dev server if project was set up
  if (options.autoStart && allSuccessful && results.length > 3) {
    await startDevServer(options.onOutput, (url) => {
      useWorkbenchStore.getState().setPreviewUrl(url)
      console.log('✅ Dev server started:', url)
    })
  }
  
  return results
}

/**
 * Execute a single action
 */
async function executeSingleAction(
  action: Action,
  options: RunnerOptions
): Promise<ActionResult> {
  if (action.type === 'file') {
    return executeFileAction(action.data as FileModification, options)
  } else if (action.type === 'shell') {
    return executeShellAction(action.data as ShellAction, options)
  }
  
  return {
    success: false,
    action,
    error: `Unknown action type: ${action.type}`,
  }
}

/**
 * Execute file modification
 */
async function executeFileAction(
  file: FileModification,
  options: RunnerOptions
): Promise<ActionResult> {
  console.log(`📝 Writing file: ${file.path}`)
  
  // Validate content
  const validation = validateFileContent(file.path, file.content)
  if (!validation.valid) {
    return {
      success: false,
      action: { type: 'file', data: file },
      error: validation.error,
    }
  }
  
  try {
    // Write to WebContainer
    await writeFile(file.path, file.content)
    
    // Update Workbench store
    const store = useWorkbenchStore.getState()
    store.addFile(file.path, file.content)
    
    // Mark as unsaved initially (will be saved to WebContainer)
    store.markFileClean(file.path)
    
    options.onOutput?.(`✅ Created: ${file.path}\n`)
    
    return {
      success: true,
      action: { type: 'file', data: file },
      output: `File created: ${file.path}`,
    }
  } catch (error: any) {
    options.onError?.(`Failed to write ${file.path}: ${error.message}\n`)
    
    return {
      success: false,
      action: { type: 'file', data: file },
      error: error.message,
    }
  }
}

/**
 * Execute shell command
 */
async function executeShellAction(
  shell: ShellAction,
  options: RunnerOptions
): Promise<ActionResult> {
  console.log(`💻 Executing: ${shell.command}`)
  
  // Sanitize command
  const sanitized = sanitizeCommand(shell.command)
  
  if (!sanitized.safe) {
    options.onError?.(`⚠️ Blocked unsafe command: ${sanitized.warning}\n`)
    
    return {
      success: false,
      action: { type: 'shell', data: shell },
      error: sanitized.warning,
    }
  }
  
  try {
    const result = await runCommand(shell.command, options.onOutput)
    
    const success = result.exitCode === 0
    
    if (success) {
      options.onOutput?.(`✅ Command completed: ${shell.command}\n`)
    } else {
      options.onError?.(
        `❌ Command failed (exit ${result.exitCode}): ${shell.command}\n`
      )
    }
    
    return {
      success,
      action: { type: 'shell', data: shell },
      output: result.output,
    }
  } catch (error: any) {
    options.onError?.(`❌ Command error: ${error.message}\n`)
    
    return {
      success: false,
      action: { type: 'shell', data: shell },
      error: error.message,
    }
  }
}

/**
 * Apply AI response to workbench (high-level wrapper)
 */
export async function applyAIResponse(
  content: string,
  options: Omit<RunnerOptions, 'onOutput'> & {
    onTerminalOutput?: (output: string) => void
  } = {}
): Promise<{
  success: boolean
  results: ActionResult[]
  filesCreated: number
  commandsRun: number
}> {
  const store = useWorkbenchStore.getState()
  
  // Show workbench if not visible
  if (!store.showWorkbench) {
    store.toggleWorkbench()
  }
  
  // Open terminal if not open
  if (!store.terminalOpen) {
    store.toggleTerminal()
  }
  
  const activeTerminalId =
    store.activeTerminalId || store.addTerminal('AI Actions')
  
  // Execute actions with terminal output
  const results = await executeActions(content, {
    ...options,
    onOutput: (output) => {
      store.appendTerminalOutput(activeTerminalId, output)
      options.onTerminalOutput?.(output)
    },
    onError: (error) => {
      store.appendTerminalOutput(activeTerminalId, `\x1b[31m${error}\x1b[0m`)
      options.onTerminalOutput?.(error)
    },
    autoInstall: options.autoInstall ?? true,
    autoStart: options.autoStart ?? true,
  })
  
  const success = results.every((r) => r.success)
  const filesCreated = results.filter((r) => r.action.type === 'file').length
  const commandsRun = results.filter((r) => r.action.type === 'shell').length
  
  // Summary output
  const summary = `
📊 Summary:
   Files created: ${filesCreated}
   Commands run: ${commandsRun}
   Status: ${success ? '✅ All actions completed' : '⚠️ Some actions failed'}
  `
  
  store.appendTerminalOutput(activeTerminalId, summary)
  
  return {
    success,
    results,
    filesCreated,
    commandsRun,
  }
}

/**
 * Execute specific file modifications (useful for editor)
 */
export async function applyFileModifications(
  files: Array<{ path: string; content: string }>
): Promise<ActionResult[]> {
  const actions: Action[] = files.map((file) => ({
    type: 'file',
    data: {
      type: 'file',
      path: file.path,
      content: file.content,
    },
  }))
  
  const results: ActionResult[] = []
  
  for (const action of actions) {
    const result = await executeSingleAction(action, {})
    results.push(result)
  }
  
  return results
}

/**
 * Batch file writer (optimized for multiple files)
 */
export async function batchWriteFiles(
  files: Record<string, string>
): Promise<{ success: boolean; written: number; failed: number }> {
  const results = await Promise.allSettled(
    Object.entries(files).map(async ([path, content]) => {
      await writeFile(path, content)
      
      // Update store
      const store = useWorkbenchStore.getState()
      store.addFile(path, content)
      store.markFileClean(path)
    })
  )
  
  const written = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  
  console.log(
    `📦 Batch write: ${written} succeeded, ${failed} failed`
  )
  
  return {
    success: failed === 0,
    written,
    failed,
  }
}

/**
 * Rollback action (undo file modification)
 */
export async function rollbackAction(
  action: Action,
  previousContent?: string
): Promise<boolean> {
  if (action.type === 'file') {
    const file = action.data as FileModification
    
    if (previousContent) {
      await writeFile(file.path, previousContent)
      return true
    }
  }
  
  return false
}

export default {
  executeActions,
  applyAIResponse,
  applyFileModifications,
  batchWriteFiles,
  rollbackAction,
}
