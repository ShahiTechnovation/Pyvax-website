/**
 * Workbench Store - File system, editor, terminal, and preview management
 * Replaces Bolt's workbench nanostores with Zustand
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { FileNode } from '@/types/webcontainer'
import { projectDB } from '@/lib/db'

export type ViewType = 'code' | 'preview' | 'split'

export interface EditorDocument {
  filePath: string
  content: string
  language: string
  scroll?: { line: number; column: number }
}

export interface TerminalSession {
  id: string
  title: string
  output: string[]
  isActive: boolean
}

export interface WorkbenchState {
  // File System
  files: Record<string, FileNode>
  selectedFile: string | null
  unsavedFiles: Set<string>
  
  // Editor
  documents: Map<string, EditorDocument>
  activeDocument: string | null
  cursorPosition: { line: number; column: number }
  
  // Terminal
  terminals: TerminalSession[]
  activeTerminalId: string | null
  terminalOpen: boolean
  
  // Preview
  previewUrl: string | null
  previewPort: number | null
  previewOpen: boolean
  
  // View State
  currentView: ViewType
  showWorkbench: boolean
  sidebarWidth: number
  editorWidth: number
  
  // Project
  currentProjectId: string | null
  projectName: string

  // Actions - File Management
  setFiles: (files: Record<string, FileNode>) => void
  addFile: (path: string, content: string) => void
  updateFile: (path: string, content: string) => void
  deleteFile: (path: string) => void
  renameFile: (oldPath: string, newPath: string) => void
  selectFile: (path: string) => void
  
  // Actions - Editor
  openDocument: (path: string, content: string, language: string) => void
  closeDocument: (path: string) => void
  updateDocumentContent: (path: string, content: string) => void
  setActiveDocument: (path: string) => void
  setCursorPosition: (line: number, column: number) => void
  markFileDirty: (path: string) => void
  markFileClean: (path: string) => void
  
  // Actions - Terminal
  addTerminal: (title?: string) => string
  removeTerminal: (id: string) => void
  setActiveTerminal: (id: string) => void
  appendTerminalOutput: (id: string, output: string) => void
  clearTerminal: (id: string) => void
  toggleTerminal: () => void
  
  // Actions - Preview
  setPreviewUrl: (url: string, port?: number) => void
  clearPreview: () => void
  togglePreview: () => void
  
  // Actions - View
  setView: (view: ViewType) => void
  toggleWorkbench: () => void
  setSidebarWidth: (width: number) => void
  setEditorWidth: (width: number) => void
  
  // Actions - Project
  loadProject: (projectId: string) => Promise<void>
  saveProject: () => Promise<void>
  createNewProject: (name: string) => void
  
  // Actions - Utility
  reset: () => void
}

const initialState = {
  files: {},
  selectedFile: null,
  unsavedFiles: new Set<string>(),
  documents: new Map<string, EditorDocument>(),
  activeDocument: null,
  cursorPosition: { line: 0, column: 0 },
  terminals: [],
  activeTerminalId: null,
  terminalOpen: false,
  previewUrl: null,
  previewPort: null,
  previewOpen: false,
  currentView: 'code' as ViewType,
  showWorkbench: false,
  sidebarWidth: 280,
  editorWidth: 50,
  currentProjectId: null,
  projectName: 'Untitled Project',
}

export const useWorkbenchStore = create<WorkbenchState>()(
  immer((set, get) => ({
    ...initialState,

    // File Management
    setFiles: (files) => {
      set((state) => {
        state.files = files
      })
    },

    addFile: (path, content) => {
      set((state) => {
        state.files[path] = { type: 'file', content }
        state.unsavedFiles.add(path)
      })
    },

    updateFile: (path, content) => {
      set((state) => {
        const file = state.files[path]
        if (file && file.type === 'file') {
          file.content = content
          state.unsavedFiles.add(path)
        }
      })
    },

    deleteFile: (path) => {
      set((state) => {
        delete state.files[path]
        state.unsavedFiles.delete(path)
        state.documents.delete(path)
        
        if (state.selectedFile === path) {
          state.selectedFile = null
        }
        if (state.activeDocument === path) {
          state.activeDocument = null
        }
      })
    },

    renameFile: (oldPath, newPath) => {
      set((state) => {
        const file = state.files[oldPath]
        if (file) {
          state.files[newPath] = file
          delete state.files[oldPath]
          
          if (state.unsavedFiles.has(oldPath)) {
            state.unsavedFiles.delete(oldPath)
            state.unsavedFiles.add(newPath)
          }
          
          const doc = state.documents.get(oldPath)
          if (doc) {
            state.documents.delete(oldPath)
            state.documents.set(newPath, { ...doc, filePath: newPath })
          }
          
          if (state.selectedFile === oldPath) {
            state.selectedFile = newPath
          }
          if (state.activeDocument === oldPath) {
            state.activeDocument = newPath
          }
        }
      })
    },

    selectFile: (path) => {
      set((state) => {
        state.selectedFile = path
        const file = state.files[path]
        
        if (file && file.type === 'file') {
          // Auto-open document
          const doc = state.documents.get(path)
          if (!doc) {
            const language = getLanguageFromPath(path)
            state.documents.set(path, {
              filePath: path,
              content: file.content || '',
              language,
            })
          }
          state.activeDocument = path
        }
      })
    },

    // Editor Management
    openDocument: (path, content, language) => {
      set((state) => {
        state.documents.set(path, {
          filePath: path,
          content,
          language,
        })
        state.activeDocument = path
        state.selectedFile = path
      })
    },

    closeDocument: (path) => {
      set((state) => {
        state.documents.delete(path)
        
        if (state.activeDocument === path) {
          // Switch to another open document
          const docs = Array.from(state.documents.keys())
          state.activeDocument = docs.length > 0 ? docs[0] : null
        }
      })
    },

    updateDocumentContent: (path, content) => {
      set((state) => {
        const doc = state.documents.get(path)
        if (doc) {
          doc.content = content
          state.unsavedFiles.add(path)
        }
      })
    },

    setActiveDocument: (path) => {
      set((state) => {
        if (state.documents.has(path)) {
          state.activeDocument = path
          state.selectedFile = path
        }
      })
    },

    setCursorPosition: (line, column) => {
      set((state) => {
        state.cursorPosition = { line, column }
      })
    },

    markFileDirty: (path) => {
      set((state) => {
        state.unsavedFiles.add(path)
      })
    },

    markFileClean: (path) => {
      set((state) => {
        state.unsavedFiles.delete(path)
      })
    },

    // Terminal Management
    addTerminal: (title) => {
      const id = crypto.randomUUID()
      set((state) => {
        state.terminals.push({
          id,
          title: title || `Terminal ${state.terminals.length + 1}`,
          output: [],
          isActive: false,
        })
        state.activeTerminalId = id
        state.terminalOpen = true
        
        // Set all other terminals as inactive
        state.terminals.forEach((t) => {
          t.isActive = t.id === id
        })
      })
      return id
    },

    removeTerminal: (id) => {
      set((state) => {
        state.terminals = state.terminals.filter((t) => t.id !== id)
        
        if (state.activeTerminalId === id) {
          state.activeTerminalId = state.terminals[0]?.id || null
        }
      })
    },

    setActiveTerminal: (id) => {
      set((state) => {
        state.activeTerminalId = id
        state.terminals.forEach((t) => {
          t.isActive = t.id === id
        })
      })
    },

    appendTerminalOutput: (id, output) => {
      set((state) => {
        const terminal = state.terminals.find((t) => t.id === id)
        if (terminal) {
          terminal.output.push(output)
          
          // Limit output to last 1000 lines
          if (terminal.output.length > 1000) {
            terminal.output = terminal.output.slice(-1000)
          }
        }
      })
    },

    clearTerminal: (id) => {
      set((state) => {
        const terminal = state.terminals.find((t) => t.id === id)
        if (terminal) {
          terminal.output = []
        }
      })
    },

    toggleTerminal: () => {
      set((state) => {
        state.terminalOpen = !state.terminalOpen
        
        // Create default terminal if none exist
        if (state.terminalOpen && state.terminals.length === 0) {
          const id = crypto.randomUUID()
          state.terminals.push({
            id,
            title: 'Terminal 1',
            output: [],
            isActive: true,
          })
          state.activeTerminalId = id
        }
      })
    },

    // Preview Management
    setPreviewUrl: (url, port) => {
      set((state) => {
        state.previewUrl = url
        state.previewPort = port || null
        state.previewOpen = true
      })
    },

    clearPreview: () => {
      set((state) => {
        state.previewUrl = null
        state.previewPort = null
      })
    },

    togglePreview: () => {
      set((state) => {
        state.previewOpen = !state.previewOpen
      })
    },

    // View Management
    setView: (view) => {
      set((state) => {
        state.currentView = view
        
        // Auto-adjust panels based on view
        if (view === 'code') {
          state.previewOpen = false
        } else if (view === 'preview') {
          state.previewOpen = true
        } else if (view === 'split') {
          state.previewOpen = true
          state.editorWidth = 50
        }
      })
    },

    toggleWorkbench: () => {
      set((state) => {
        state.showWorkbench = !state.showWorkbench
      })
    },

    setSidebarWidth: (width) => {
      set((state) => {
        state.sidebarWidth = Math.max(200, Math.min(600, width))
      })
    },

    setEditorWidth: (width) => {
      set((state) => {
        state.editorWidth = Math.max(20, Math.min(80, width))
      })
    },

    // Project Management
    loadProject: async (projectId) => {
      try {
        const project = await projectDB.get(projectId)
        if (!project) {
          throw new Error('Project not found')
        }

        set((state) => {
          state.currentProjectId = projectId
          state.projectName = project.name
          
          // Convert flat files to FileNode structure
          const files: Record<string, FileNode> = {}
          Object.entries(project.files).forEach(([path, content]) => {
            files[path] = { type: 'file', content }
          })
          state.files = files
          
          state.previewUrl = project.previewUrl || null
          state.unsavedFiles.clear()
          state.documents.clear()
          state.activeDocument = null
        })
      } catch (error) {
        console.error('Failed to load project:', error)
        throw error
      }
    },

    saveProject: async () => {
      const { currentProjectId, projectName, files } = get()
      
      // Convert FileNode to flat structure
      const flatFiles: Record<string, string> = {}
      Object.entries(files).forEach(([path, node]) => {
        if (node.type === 'file') {
          flatFiles[path] = node.content || ''
        }
      })

      try {
        if (currentProjectId) {
          await projectDB.update(currentProjectId, {
            name: projectName,
            files: flatFiles,
          })
        } else {
          const id = await projectDB.create({
            name: projectName,
            files: flatFiles,
          })
          
          set((state) => {
            state.currentProjectId = id
          })
        }
        
        // Mark all files as saved
        set((state) => {
          state.unsavedFiles.clear()
        })
      } catch (error) {
        console.error('Failed to save project:', error)
        throw error
      }
    },

    createNewProject: (name) => {
      set((state) => {
        Object.assign(state, {
          ...initialState,
          projectName: name,
          showWorkbench: true,
        })
      })
    },

    // Utility
    reset: () => {
      set((state) => {
        Object.assign(state, initialState)
      })
    },
  }))
)

// Helper function to determine language from file path
function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    sol: 'solidity',
    json: 'json',
    md: 'markdown',
    html: 'html',
    css: 'css',
    scss: 'scss',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    sh: 'shell',
    rs: 'rust',
    go: 'go',
  }
  
  return languageMap[ext || ''] || 'plaintext'
}

// Selector hooks
export const useFiles = () => useWorkbenchStore((state) => state.files)
export const useActiveFile = () => useWorkbenchStore((state) => {
  const { activeDocument, documents } = state
  return activeDocument ? documents.get(activeDocument) : null
})
export const useTerminals = () => useWorkbenchStore((state) => state.terminals)
export const usePreview = () => useWorkbenchStore((state) => ({
  url: state.previewUrl,
  port: state.previewPort,
  isOpen: state.previewOpen,
}))
