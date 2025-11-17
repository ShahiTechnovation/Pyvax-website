// WebContainer-related type definitions

export interface FileNode {
  type: 'file' | 'folder'
  content?: string
  children?: Record<string, FileNode>
}

export type FileTree = Record<string, FileNode>

export interface TerminalOutput {
  type: 'stdout' | 'stderr' | 'command'
  content: string
  timestamp: number
}

export interface ProcessInfo {
  pid: number
  command: string
  args: string[]
  status: 'running' | 'stopped' | 'error'
  exitCode?: number
}

export interface PreviewServer {
  port: number
  url: string
  ready: boolean
}

export interface ActionMessage {
  type: 'file' | 'shell' | 'start'
  action: string
  filePath?: string
  content?: string
  command?: string
}

export interface ActionResult {
  success: boolean
  message?: string
  error?: string
  data?: any
}
