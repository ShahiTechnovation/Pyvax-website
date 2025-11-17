/**
 * Centralized export for all Zustand stores
 * Makes importing stores easier throughout the application
 */

// Store exports
export { useAIStore, useMessages, useIsStreaming, useCurrentProvider, useChatHistory } from './ai-store'
export type { AIState } from './ai-store'

export { 
  useWorkbenchStore, 
  useFiles, 
  useActiveFile, 
  useTerminals, 
  usePreview 
} from './workbench-store'
export type { WorkbenchState, EditorDocument, TerminalSession, ViewType } from './workbench-store'

export { 
  useWeb3Store, 
  useWallet, 
  useContracts, 
  useSelectedContract, 
  usePendingTransactions,
  useCompilation
} from './web3-store'
export type { Web3State, WalletState, Contract, Transaction } from './web3-store'

export { 
  useSettingsStore, 
  useAPIKeys, 
  useTheme, 
  useEditorSettings,
  useFeatureFlags
} from './settings-store'
export type { SettingsState, ProviderSettings } from './settings-store'

// Database exports
export { db, chatDB, projectDB, apiKeyDB, settingsDB } from '../db'
export type { Chat, Project, APIKey, UserSettings } from '../db'

// Helper: Initialize all stores on app startup
export async function initializeStores() {
  const { useSettingsStore } = await import('./settings-store')
  const { useAIStore } = await import('./ai-store')
  
  // Load settings from IndexedDB
  await useSettingsStore.getState().loadSettings()
  
  // Load chat history
  await useAIStore.getState().loadChatHistory()
  
  // Apply theme
  const theme = useSettingsStore.getState().theme
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }
}

// Helper: Reset all stores (useful for testing)
export function resetAllStores() {
  useAIStore.getState().clearMessages()
  useWorkbenchStore.getState().reset()
  useSettingsStore.getState().resetSettings()
}
