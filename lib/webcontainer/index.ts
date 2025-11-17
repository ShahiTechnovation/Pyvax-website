/**
 * WebContainer Manager - Run Node.js environments in the browser
 * Provides file system, process spawning, and terminal capabilities
 */

import { WebContainer } from '@webcontainer/api'
import { WORK_DIR_NAME } from '@/lib/constants'
import type { FileNode } from '@/types/webcontainer'

let webcontainerInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null
let isBooting = false

export interface WebContainerError extends Error {
  code?: string
  details?: any
}

/**
 * Boot WebContainer instance (singleton pattern)
 */
export async function bootWebContainer(): Promise<WebContainer> {
  // Return existing instance
  if (webcontainerInstance) {
    return webcontainerInstance
  }

  // Wait for ongoing boot
  if (bootPromise) {
    return bootPromise
  }

  // Prevent concurrent boots
  if (isBooting) {
    throw new Error('WebContainer is already booting')
  }

  isBooting = true

  bootPromise = (async () => {
    try {
      console.log('🚀 Booting WebContainer...')
      
      const container = await WebContainer.boot({
        coep: 'credentialless',
        workdirName: WORK_DIR_NAME,
        forwardPreviewErrors: true,
      })

      webcontainerInstance = container
      
      console.log('✅ WebContainer booted successfully')
      
      // Setup error listeners
      setupErrorHandlers(container)
      
      return container
    } catch (error: any) {
      console.error('❌ WebContainer boot failed:', error)
      bootPromise = null
      isBooting = false
      throw new WebContainerBootError(error.message, error)
    } finally {
      isBooting = false
    }
  })()

  return bootPromise
}

/**
 * Get WebContainer instance (boots if needed)
 */
export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance
  }
  return bootWebContainer()
}

/**
 * Check if WebContainer is booted
 */
export function isWebContainerBooted(): boolean {
  return webcontainerInstance !== null
}

/**
 * Setup error handlers for WebContainer
 */
function setupErrorHandlers(container: WebContainer) {
  container.on('preview-message', (message) => {
    console.log('📨 WebContainer preview message:', message)

    // Handle preview errors
    if (
      message.type === 'PREVIEW_UNCAUGHT_EXCEPTION' ||
      message.type === 'PREVIEW_UNHANDLED_REJECTION'
    ) {
      const isPromise = message.type === 'PREVIEW_UNHANDLED_REJECTION'
      
      console.error(`${isPromise ? 'Promise Rejection' : 'Exception'} in preview:`, {
        message: message.message,
        pathname: message.pathname,
        port: message.port,
        stack: message.stack,
      })
      
      // Could emit to store for UI display
      window.dispatchEvent(
        new CustomEvent('webcontainer-error', {
          detail: {
            type: isPromise ? 'unhandled-rejection' : 'uncaught-exception',
            message: message.message,
            pathname: message.pathname,
            port: message.port,
            stack: message.stack,
          },
        })
      )
    }
  })
}

/**
 * Write files to WebContainer file system
 */
export async function writeFiles(
  files: Record<string, FileNode>,
  basePath: string = ''
): Promise<void> {
  const container = await getWebContainer()
  
  for (const [path, node] of Object.entries(files)) {
    const fullPath = basePath ? `${basePath}/${path}` : path
    
    if (node.type === 'file') {
      await container.fs.writeFile(fullPath, node.content || '', 'utf-8')
    } else if (node.type === 'folder' && node.children) {
      await container.fs.mkdir(fullPath, { recursive: true })
      await writeFiles(node.children, fullPath)
    }
  }
}

/**
 * Write a single file
 */
export async function writeFile(
  path: string,
  content: string
): Promise<void> {
  const container = await getWebContainer()
  
  // Create parent directories if needed
  const dirPath = path.split('/').slice(0, -1).join('/')
  if (dirPath) {
    await container.fs.mkdir(dirPath, { recursive: true })
  }
  
  await container.fs.writeFile(path, content, 'utf-8')
}

/**
 * Read a file from WebContainer
 */
export async function readFile(path: string): Promise<string> {
  const container = await getWebContainer()
  return container.fs.readFile(path, 'utf-8')
}

/**
 * Read directory contents
 */
export async function readDirectory(path: string): Promise<string[]> {
  const container = await getWebContainer()
  return container.fs.readdir(path)
}

/**
 * Delete a file or directory
 */
export async function deleteFile(
  path: string,
  options?: { recursive?: boolean }
): Promise<void> {
  const container = await getWebContainer()
  await container.fs.rm(path, options)
}

/**
 * Check if file/directory exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const container = await getWebContainer()
    await container.fs.readFile(path, 'utf-8')
    return true
  } catch {
    return false
  }
}

/**
 * Spawn a process in WebContainer
 */
export async function spawnProcess(
  command: string,
  args: string[] = [],
  options?: {
    onOutput?: (output: string) => void
    onError?: (error: string) => void
    onExit?: (exitCode: number) => void
  }
): Promise<{ exitCode: number; output: string }> {
  const container = await getWebContainer()
  
  let output = ''
  
  const process = await container.spawn(command, args)
  
  // Handle stdout
  if (process.output) {
    const reader = process.output.getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const text = new TextDecoder().decode(value)
      output += text
      options?.onOutput?.(text)
    }
  }
  
  const exitCode = await process.exit
  options?.onExit?.(exitCode)
  
  return { exitCode, output }
}

/**
 * Install dependencies using npm
 */
export async function installDependencies(
  onOutput?: (output: string) => void
): Promise<{ success: boolean; output: string }> {
  console.log('📦 Installing dependencies...')
  
  try {
    const result = await spawnProcess('npm', ['install'], {
      onOutput,
    })
    
    const success = result.exitCode === 0
    
    if (success) {
      console.log('✅ Dependencies installed successfully')
    } else {
      console.error('❌ Dependency installation failed')
    }
    
    return { success, output: result.output }
  } catch (error: any) {
    console.error('❌ Install error:', error)
    return { success: false, output: error.message }
  }
}

/**
 * Start development server
 */
export async function startDevServer(
  onOutput?: (output: string) => void,
  onUrl?: (url: string) => void
): Promise<{ url: string | null }> {
  console.log('🚀 Starting dev server...')
  
  try {
    const container = await getWebContainer()
    
    // Spawn dev server process
    const process = await container.spawn('npm', ['run', 'dev'])
    
    // Listen for server ready
    let serverUrl: string | null = null
    
    if (process.output) {
      const reader = process.output.getReader()
      
      // Read output in background
      ;(async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = new TextDecoder().decode(value)
          onOutput?.(text)
          
          // Detect server URL (various frameworks)
          const urlMatch =
            text.match(/Local:\s+(http:\/\/[^\s]+)/) ||
            text.match(/server running at\s+(http:\/\/[^\s]+)/) ||
            text.match(/ready on\s+(http:\/\/[^\s]+)/)
          
          if (urlMatch && !serverUrl) {
            serverUrl = urlMatch[1]
            console.log('✅ Dev server ready:', serverUrl)
            onUrl?.(serverUrl)
          }
        }
      })()
    }
    
    // Wait a bit for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // If no URL detected, try default ports
    if (!serverUrl) {
      const defaultPorts = [3000, 5173, 8080, 4200]
      for (const port of defaultPorts) {
        try {
          const url = await container.waitForPort(port)
          if (url) {
            serverUrl = url
            console.log(`✅ Dev server detected on port ${port}:`, url)
            onUrl?.(url)
            break
          }
        } catch {
          // Port not ready yet
        }
      }
    }
    
    return { url: serverUrl }
  } catch (error: any) {
    console.error('❌ Dev server error:', error)
    return { url: null }
  }
}

/**
 * Run a shell command
 */
export async function runCommand(
  command: string,
  onOutput?: (output: string) => void
): Promise<{ exitCode: number; output: string }> {
  console.log(`💻 Running: ${command}`)
  
  const [cmd, ...args] = command.split(' ')
  
  try {
    const result = await spawnProcess(cmd, args, { onOutput })
    return result
  } catch (error: any) {
    console.error(`❌ Command failed: ${command}`, error)
    return { exitCode: 1, output: error.message }
  }
}

/**
 * Get file tree structure
 */
export async function getFileTree(
  path: string = '.'
): Promise<Record<string, FileNode>> {
  const container = await getWebContainer()
  const tree: Record<string, FileNode> = {}
  
  async function traverse(currentPath: string): Promise<void> {
    const entries = await container.fs.readdir(currentPath, {
      withFileTypes: true,
    })
    
    for (const entry of entries) {
      const fullPath = `${currentPath}/${entry.name}`.replace(/^\.\//, '')
      
      if (entry.isDirectory()) {
        tree[fullPath] = { type: 'folder', children: {} }
        await traverse(fullPath)
      } else if (entry.isFile()) {
        const content = await container.fs.readFile(fullPath, 'utf-8')
        tree[fullPath] = { type: 'file', content }
      }
    }
  }
  
  await traverse(path)
  return tree
}

/**
 * Clear WebContainer instance (for testing/reset)
 */
export function clearWebContainer() {
  webcontainerInstance = null
  bootPromise = null
  isBooting = false
}

/**
 * Custom error classes
 */
class WebContainerBootError extends Error implements WebContainerError {
  code = 'BOOT_ERROR'
  details: any
  
  constructor(message: string, details?: any) {
    super(`WebContainer boot failed: ${message}`)
    this.name = 'WebContainerBootError'
    this.details = details
  }
}

// Export all functions and types
export default {
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
}
