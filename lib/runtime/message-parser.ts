/**
 * Message Parser - Extract file modifications and actions from AI responses
 * Parses <diff> tags and shell commands from LLM output
 */

import { MODIFICATIONS_TAG_NAME } from '@/lib/constants'

export interface FileModification {
  type: 'file'
  path: string
  content: string
  language?: string
}

export interface ShellAction {
  type: 'shell'
  command: string
}

export interface Action {
  type: 'file' | 'shell'
  data: FileModification | ShellAction
}

export interface ParsedMessage {
  actions: Action[]
  hasModifications: boolean
  rawContent: string
}

/**
 * Parse AI message for file modifications and shell commands
 */
export function parseAIMessage(content: string): ParsedMessage {
  const actions: Action[] = []
  
  // Extract file modifications from <bolt_file_modifications> tags
  const fileActions = extractFileModifications(content)
  actions.push(...fileActions)
  
  // Extract shell commands (optional, if AI uses specific format)
  const shellActions = extractShellCommands(content)
  actions.push(...shellActions)
  
  return {
    actions,
    hasModifications: actions.length > 0,
    rawContent: content,
  }
}

/**
 * Extract file modifications from <diff> tags
 * Format: <diff path="/path/to/file">```language\ncode\n```</diff>
 */
function extractFileModifications(content: string): Action[] {
  const actions: Action[] = []
  
  // Match modifications wrapper
  const modificationsRegex = new RegExp(
    `<${MODIFICATIONS_TAG_NAME}>(.*?)</${MODIFICATIONS_TAG_NAME}>`,
    'gs'
  )
  
  const modificationsMatch = modificationsRegex.exec(content)
  
  if (!modificationsMatch) {
    return actions
  }
  
  const modificationsContent = modificationsMatch[1]
  
  // Extract individual diff blocks
  const diffRegex = /<diff\s+path="([^"]+)">\s*```(\w+)?\n([\s\S]*?)```\s*<\/diff>/g
  
  let match
  while ((match = diffRegex.exec(modificationsContent)) !== null) {
    const path = match[1].trim()
    const language = match[2]?.trim()
    const content = match[3].trim()
    
    actions.push({
      type: 'file',
      data: {
        type: 'file',
        path: normalizePath(path),
        content,
        language,
      },
    })
  }
  
  return actions
}

/**
 * Extract shell commands from AI response
 * Looks for commands marked with specific indicators
 */
function extractShellCommands(content: string): Action[] {
  const actions: Action[] = []
  
  // Match shell command blocks (various formats)
  const patterns = [
    // Format: <shell>command</shell>
    /<shell>(.*?)<\/shell>/gs,
    // Format: ```bash or ```sh
    /```(?:bash|sh|shell)\n(.*?)```/gs,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const command = match[1].trim()
      
      // Skip empty or commented commands
      if (command && !command.startsWith('#')) {
        actions.push({
          type: 'shell',
          data: {
            type: 'shell',
            command,
          },
        })
      }
    }
  }
  
  return actions
}

/**
 * Normalize file path (remove leading slashes, work dir prefix)
 */
function normalizePath(path: string): string {
  // Remove leading slash
  let normalized = path.replace(/^\/+/, '')
  
  // Remove work directory prefix if present
  normalized = normalized.replace(/^home\/project\//, '')
  normalized = normalized.replace(/^project\//, '')
  
  return normalized
}

/**
 * Extract code blocks from markdown (alternative to diff tags)
 */
export function extractCodeBlocks(markdown: string): Array<{
  language: string
  code: string
  path?: string
}> {
  const blocks: Array<{ language: string; code: string; path?: string }> = []
  
  // Match code blocks with optional path annotation
  // Format: ```typescript:path/to/file.ts
  const codeBlockRegex = /```(\w+)(?::(.+?))?\n([\s\S]*?)```/g
  
  let match
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1]
    const path = match[2]?.trim()
    const code = match[3].trim()
    
    blocks.push({
      language,
      code,
      path,
    })
  }
  
  return blocks
}

/**
 * Detect project type from files
 */
export function detectProjectType(files: Record<string, any>): string {
  const filePaths = Object.keys(files)
  
  if (filePaths.includes('package.json')) {
    // Check for specific frameworks
    if (filePaths.includes('next.config.js') || filePaths.includes('next.config.mjs')) {
      return 'nextjs'
    }
    if (filePaths.includes('vite.config.ts') || filePaths.includes('vite.config.js')) {
      return 'vite'
    }
    if (filePaths.some(p => p.includes('remix'))) {
      return 'remix'
    }
    if (filePaths.includes('angular.json')) {
      return 'angular'
    }
    return 'node'
  }
  
  if (filePaths.includes('Cargo.toml')) {
    return 'rust'
  }
  
  if (filePaths.includes('go.mod')) {
    return 'go'
  }
  
  if (filePaths.some(p => p.endsWith('.sol'))) {
    return 'solidity'
  }
  
  return 'unknown'
}

/**
 * Generate package.json from detected dependencies
 */
export function generatePackageJson(
  projectName: string,
  dependencies: string[] = []
): string {
  const depObject: Record<string, string> = {}
  
  // Add common dependencies with latest versions
  dependencies.forEach((dep) => {
    depObject[dep] = 'latest'
  })
  
  // Detect framework-specific dependencies
  const hasReact = dependencies.some(d => d.includes('react'))
  const hasNext = dependencies.some(d => d.includes('next'))
  const hasVite = dependencies.some(d => d.includes('vite'))
  
  let scripts: Record<string, string> = {}
  
  if (hasNext) {
    scripts = {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    }
  } else if (hasVite) {
    scripts = {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    }
  } else if (hasReact) {
    scripts = {
      dev: 'react-scripts start',
      build: 'react-scripts build',
    }
  } else {
    scripts = {
      start: 'node index.js',
    }
  }
  
  const packageJson = {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts,
    dependencies: depObject,
  }
  
  return JSON.stringify(packageJson, null, 2)
}

/**
 * Validate file content before writing
 */
export function validateFileContent(
  path: string,
  content: string
): { valid: boolean; error?: string } {
  // Check for common issues
  
  // Empty content
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'File content is empty' }
  }
  
  // Malformed JSON
  if (path.endsWith('.json')) {
    try {
      JSON.parse(content)
    } catch (error) {
      return { valid: false, error: 'Invalid JSON syntax' }
    }
  }
  
  // Check for incomplete code (common LLM error)
  if (content.includes('...') || content.includes('// TODO')) {
    console.warn(`File ${path} may contain placeholder content`)
  }
  
  // Check for dangerous content (eval, system calls)
  const dangerousPatterns = [
    /eval\(/,
    /Function\(/,
    /child_process/,
    /exec\(/,
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      console.warn(`File ${path} contains potentially dangerous code`)
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize command before execution
 */
export function sanitizeCommand(command: string): {
  safe: boolean
  sanitized: string
  warning?: string
} {
  const dangerous = [
    'rm -rf /',
    'sudo',
    'chmod 777',
    '> /dev/',
    'dd if=',
    'mkfs',
    'format',
  ]
  
  for (const pattern of dangerous) {
    if (command.toLowerCase().includes(pattern)) {
      return {
        safe: false,
        sanitized: '',
        warning: `Dangerous command detected: ${pattern}`,
      }
    }
  }
  
  // Allow safe commands
  const safeCommands = ['npm', 'pnpm', 'yarn', 'node', 'git', 'ls', 'cat', 'echo']
  const firstWord = command.split(' ')[0]
  
  if (!safeCommands.includes(firstWord)) {
    return {
      safe: false,
      sanitized: command,
      warning: `Command not in allowlist: ${firstWord}`,
    }
  }
  
  return {
    safe: true,
    sanitized: command,
  }
}

/**
 * Group file modifications by directory
 */
export function groupFilesByDirectory(
  files: FileModification[]
): Map<string, FileModification[]> {
  const grouped = new Map<string, FileModification[]>()
  
  files.forEach((file) => {
    const dir = file.path.split('/').slice(0, -1).join('/') || '.'
    
    if (!grouped.has(dir)) {
      grouped.set(dir, [])
    }
    
    grouped.get(dir)!.push(file)
  })
  
  return grouped
}

/**
 * Estimate complexity of modifications (for progress indication)
 */
export function estimateComplexity(actions: Action[]): {
  score: number
  description: string
} {
  let score = 0
  
  actions.forEach((action) => {
    if (action.type === 'file') {
      const file = action.data as FileModification
      // More lines = more complex
      const lines = file.content.split('\n').length
      score += Math.min(lines / 10, 10) // Cap at 10 points per file
    } else if (action.type === 'shell') {
      score += 5 // Shell commands are moderately complex
    }
  })
  
  if (score === 0) return { score: 0, description: 'No modifications' }
  if (score < 10) return { score, description: 'Simple modifications' }
  if (score < 50) return { score, description: 'Moderate changes' }
  return { score, description: 'Complex modifications' }
}

export default {
  parseAIMessage,
  extractCodeBlocks,
  detectProjectType,
  generatePackageJson,
  validateFileContent,
  sanitizeCommand,
  groupFilesByDirectory,
  estimateComplexity,
}
