/**
 * useWebContainer Hook - React integration for WebContainer
 * Provides easy access to WebContainer features in components
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  bootWebContainer,
  getWebContainer,
  isWebContainerBooted,
  writeFile,
  readFile,
  installDependencies,
  startDevServer,
  runCommand,
} from './index'
import { useWorkbenchStore } from '@/lib/stores/workbench-store'
import { applyAIResponse, type RunnerOptions } from '@/lib/runtime/action-runner'

export interface UseWebContainerOptions {
  autoboot?: boolean
  onBoot?: () => void
  onError?: (error: Error) => void
}

export function useWebContainer(options: UseWebContainerOptions = {}) {
  const [isBooted, setIsBooted] = useState(false)
  const [isBooting, setIsBooting] = useState(false)
  const [bootError, setBootError] = useState<Error | null>(null)
  const bootAttempted = useRef(false)

  // Boot WebContainer on mount
  useEffect(() => {
    if (options.autoboot && !bootAttempted.current) {
      bootAttempted.current = true
      boot()
    }
  }, [options.autoboot])

  /**
   * Boot WebContainer
   */
  const boot = useCallback(async () => {
    if (isWebContainerBooted()) {
      setIsBooted(true)
      return
    }

    setIsBooting(true)
    setBootError(null)

    try {
      await bootWebContainer()
      setIsBooted(true)
      options.onBoot?.()
    } catch (error: any) {
      setBootError(error)
      options.onError?.(error)
    } finally {
      setIsBooting(false)
    }
  }, [options])

  /**
   * Write file to WebContainer
   */
  const writeFileToContainer = useCallback(
    async (path: string, content: string) => {
      if (!isBooted) {
        throw new Error('WebContainer not booted')
      }

      await writeFile(path, content)

      // Update workbench store
      const store = useWorkbenchStore.getState()
      store.addFile(path, content)
      store.markFileClean(path)
    },
    [isBooted]
  )

  /**
   * Read file from WebContainer
   */
  const readFileFromContainer = useCallback(
    async (path: string): Promise<string> => {
      if (!isBooted) {
        throw new Error('WebContainer not booted')
      }

      return readFile(path)
    },
    [isBooted]
  )

  /**
   * Install dependencies
   */
  const install = useCallback(async () => {
    if (!isBooted) {
      throw new Error('WebContainer not booted')
    }

    const store = useWorkbenchStore.getState()
    const terminalId = store.activeTerminalId || store.addTerminal('Install')

    return installDependencies((output) => {
      store.appendTerminalOutput(terminalId, output)
    })
  }, [isBooted])

  /**
   * Start dev server
   */
  const startServer = useCallback(async () => {
    if (!isBooted) {
      throw new Error('WebContainer not booted')
    }

    const store = useWorkbenchStore.getState()
    const terminalId = store.activeTerminalId || store.addTerminal('Dev Server')

    const result = await startDevServer(
      (output) => {
        store.appendTerminalOutput(terminalId, output)
      },
      (url) => {
        store.setPreviewUrl(url)
      }
    )

    return result
  }, [isBooted])

  /**
   * Run command in WebContainer
   */
  const run = useCallback(
    async (command: string) => {
      if (!isBooted) {
        throw new Error('WebContainer not booted')
      }

      const store = useWorkbenchStore.getState()
      const terminalId = store.activeTerminalId || store.addTerminal('Command')

      return runCommand(command, (output) => {
        store.appendTerminalOutput(terminalId, output)
      })
    },
    [isBooted]
  )

  /**
   * Apply AI-generated changes
   */
  const applyAI = useCallback(
    async (content: string, runnerOptions?: Partial<RunnerOptions>) => {
      if (!isBooted) {
        throw new Error('WebContainer not booted')
      }

      return applyAIResponse(content, runnerOptions)
    },
    [isBooted]
  )

  return {
    // State
    isBooted,
    isBooting,
    bootError,

    // Actions
    boot,
    writeFile: writeFileToContainer,
    readFile: readFileFromContainer,
    install,
    startServer,
    run,
    applyAI,
  }
}

/**
 * useWebContainerStatus Hook - Monitor WebContainer status
 */
export function useWebContainerStatus() {
  const [status, setStatus] = useState<{
    isBooted: boolean
    hasFiles: boolean
    hasDevServer: boolean
  }>({
    isBooted: false,
    hasFiles: false,
    hasDevServer: false,
  })

  const files = useWorkbenchStore((state) => state.files)
  const previewUrl = useWorkbenchStore((state) => state.previewUrl)

  useEffect(() => {
    setStatus({
      isBooted: isWebContainerBooted(),
      hasFiles: Object.keys(files).length > 0,
      hasDevServer: previewUrl !== null,
    })
  }, [files, previewUrl])

  return status
}

/**
 * useTerminalOutput Hook - Subscribe to terminal output
 */
export function useTerminalOutput(terminalId: string) {
  const terminal = useWorkbenchStore((state) =>
    state.terminals.find((t) => t.id === terminalId)
  )

  return {
    output: terminal?.output || [],
    isActive: terminal?.isActive || false,
  }
}

/**
 * useFileSync Hook - Sync file between editor and WebContainer
 */
export function useFileSync(path: string) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)

  const { isBooted, writeFile, readFile } = useWebContainer()

  /**
   * Save file to WebContainer
   */
  const save = useCallback(
    async (content: string) => {
      if (!isBooted) return

      setIsSyncing(true)
      setSyncError(null)

      try {
        await writeFile(path, content)
      } catch (error: any) {
        setSyncError(error)
      } finally {
        setIsSyncing(false)
      }
    },
    [isBooted, path, writeFile]
  )

  /**
   * Load file from WebContainer
   */
  const load = useCallback(async () => {
    if (!isBooted) return ''

    setIsSyncing(true)
    setSyncError(null)

    try {
      const content = await readFile(path)
      return content
    } catch (error: any) {
      setSyncError(error)
      return ''
    } finally {
      setIsSyncing(false)
    }
  }, [isBooted, path, readFile])

  return {
    save,
    load,
    isSyncing,
    syncError,
  }
}
