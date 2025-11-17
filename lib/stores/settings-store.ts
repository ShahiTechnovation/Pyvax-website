/**
 * Settings Store - API keys, user preferences, and application settings
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { apiKeyDB, settingsDB } from '@/lib/db'
import { PROVIDER_LIST } from '@/lib/constants'

export interface ProviderSettings {
  enabled: boolean
  baseURL?: string
  model?: string
}

export interface SettingsState {
  // API Keys (encrypted in production)
  apiKeys: Record<string, string>
  
  // Provider Configuration
  providerSettings: Record<string, ProviderSettings>
  
  // UI Preferences
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  editorTheme: string
  fontFamily: string
  
  // Editor Settings
  autoSave: boolean
  autoSaveDelay: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  
  // Feature Flags
  enableWebContainer: boolean
  enableTerminal: boolean
  enableAIAssistant: boolean
  enableCodeCompletion: boolean
  
  // Privacy & Security
  saveChatHistory: boolean
  saveAPIKeysLocally: boolean
  analyticsEnabled: boolean
  
  // Actions - API Keys
  setAPIKey: (provider: string, key: string) => Promise<void>
  getAPIKey: (provider: string) => string | undefined
  deleteAPIKey: (provider: string) => Promise<void>
  loadAPIKeys: () => Promise<void>
  validateAPIKey: (provider: string, key: string) => Promise<boolean>
  
  // Actions - Provider Settings
  setProviderSetting: (provider: string, settings: Partial<ProviderSettings>) => void
  toggleProvider: (provider: string, enabled: boolean) => void
  
  // Actions - UI Preferences
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setFontSize: (size: number) => void
  setEditorTheme: (theme: string) => void
  setFontFamily: (family: string) => void
  
  // Actions - Editor Settings
  setAutoSave: (enabled: boolean) => void
  setAutoSaveDelay: (delay: number) => void
  setTabSize: (size: number) => void
  toggleWordWrap: () => void
  toggleMinimap: () => void
  toggleLineNumbers: () => void
  
  // Actions - Feature Flags
  toggleFeature: (feature: keyof Pick<SettingsState, 'enableWebContainer' | 'enableTerminal' | 'enableAIAssistant' | 'enableCodeCompletion'>) => void
  
  // Actions - Privacy
  setPrivacySettings: (settings: Partial<Pick<SettingsState, 'saveChatHistory' | 'saveAPIKeysLocally' | 'analyticsEnabled'>>) => void
  
  // Actions - Persistence
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
  resetSettings: () => Promise<void>
  exportSettings: () => string
  importSettings: (json: string) => Promise<void>
}

const defaultSettings: Omit<SettingsState, keyof { [K in keyof SettingsState]: SettingsState[K] extends Function ? K : never }[keyof SettingsState]> = {
  apiKeys: {},
  providerSettings: {},
  theme: 'dark',
  fontSize: 14,
  editorTheme: 'vs-dark',
  fontFamily: 'Geist Mono, Monaco, Courier New, monospace',
  autoSave: true,
  autoSaveDelay: 1000,
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  lineNumbers: true,
  enableWebContainer: true,
  enableTerminal: true,
  enableAIAssistant: true,
  enableCodeCompletion: true,
  saveChatHistory: true,
  saveAPIKeysLocally: true,
  analyticsEnabled: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set, get) => ({
      ...defaultSettings,

      // API Key Management
      setAPIKey: async (provider, key) => {
        set((state) => {
          state.apiKeys[provider] = key
        })
        
        // Persist to IndexedDB if enabled
        if (get().saveAPIKeysLocally) {
          await apiKeyDB.set(provider, key)
        }
      },

      getAPIKey: (provider) => {
        return get().apiKeys[provider]
      },

      deleteAPIKey: async (provider) => {
        set((state) => {
          delete state.apiKeys[provider]
        })
        
        await apiKeyDB.delete(provider)
      },

      loadAPIKeys: async () => {
        if (!get().saveAPIKeysLocally) return
        
        try {
          const keys = await apiKeyDB.getAllKeys()
          set((state) => {
            state.apiKeys = keys
          })
        } catch (error) {
          console.error('Failed to load API keys:', error)
        }
      },

      validateAPIKey: async (provider, key) => {
        // Basic validation - can be enhanced with actual API calls
        if (!key || key.trim().length < 10) {
          return false
        }
        
        // Provider-specific validation
        const patterns: Record<string, RegExp> = {
          openai: /^sk-[A-Za-z0-9]{48,}$/,
          anthropic: /^sk-ant-[A-Za-z0-9-]{95,}$/,
          google: /^AIza[A-Za-z0-9_-]{35}$/,
        }
        
        const pattern = patterns[provider]
        return pattern ? pattern.test(key) : true
      },

      // Provider Settings
      setProviderSetting: (provider, settings) => {
        set((state) => {
          if (!state.providerSettings[provider]) {
            state.providerSettings[provider] = { enabled: true }
          }
          Object.assign(state.providerSettings[provider], settings)
        })
      },

      toggleProvider: (provider, enabled) => {
        set((state) => {
          if (!state.providerSettings[provider]) {
            state.providerSettings[provider] = { enabled }
          } else {
            state.providerSettings[provider].enabled = enabled
          }
        })
      },

      // UI Preferences
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme
        })
        
        // Apply theme to document
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.classList.toggle('dark', prefersDark)
          } else {
            root.classList.toggle('dark', theme === 'dark')
          }
        }
      },

      setFontSize: (size) => {
        set((state) => {
          state.fontSize = Math.max(10, Math.min(24, size))
        })
      },

      setEditorTheme: (theme) => {
        set((state) => {
          state.editorTheme = theme
        })
      },

      setFontFamily: (family) => {
        set((state) => {
          state.fontFamily = family
        })
      },

      // Editor Settings
      setAutoSave: (enabled) => {
        set((state) => {
          state.autoSave = enabled
        })
      },

      setAutoSaveDelay: (delay) => {
        set((state) => {
          state.autoSaveDelay = Math.max(500, Math.min(5000, delay))
        })
      },

      setTabSize: (size) => {
        set((state) => {
          state.tabSize = Math.max(2, Math.min(8, size))
        })
      },

      toggleWordWrap: () => {
        set((state) => {
          state.wordWrap = !state.wordWrap
        })
      },

      toggleMinimap: () => {
        set((state) => {
          state.minimap = !state.minimap
        })
      },

      toggleLineNumbers: () => {
        set((state) => {
          state.lineNumbers = !state.lineNumbers
        })
      },

      // Feature Flags
      toggleFeature: (feature) => {
        set((state) => {
          state[feature] = !state[feature]
        })
      },

      // Privacy Settings
      setPrivacySettings: (settings) => {
        set((state) => {
          Object.assign(state, settings)
        })
      },

      // Persistence
      loadSettings: async () => {
        try {
          const settings = await settingsDB.get()
          set((state) => {
            Object.assign(state, settings)
          })
          
          // Load API keys
          await get().loadAPIKeys()
        } catch (error) {
          console.error('Failed to load settings:', error)
        }
      },

      saveSettings: async () => {
        try {
          const { 
            theme, fontSize, editorTheme, fontFamily,
            autoSave, autoSaveDelay, tabSize, wordWrap, minimap, lineNumbers,
            enableWebContainer, enableTerminal, enableAIAssistant, enableCodeCompletion,
            saveChatHistory, saveAPIKeysLocally, analyticsEnabled
          } = get()
          
          await settingsDB.update({
            theme, fontSize, editorTheme, fontFamily,
            autoSave, autoSaveDelay, tabSize, wordWrap, minimap, lineNumbers,
            enableWebContainer, enableTerminal, enableAIAssistant, enableCodeCompletion,
            saveChatHistory, saveAPIKeysLocally, analyticsEnabled
          } as any)
        } catch (error) {
          console.error('Failed to save settings:', error)
        }
      },

      resetSettings: async () => {
        set((state) => {
          Object.assign(state, defaultSettings)
        })
        
        await settingsDB.reset()
      },

      exportSettings: () => {
        const state = get()
        const exportData = {
          theme: state.theme,
          fontSize: state.fontSize,
          editorTheme: state.editorTheme,
          fontFamily: state.fontFamily,
          autoSave: state.autoSave,
          autoSaveDelay: state.autoSaveDelay,
          tabSize: state.tabSize,
          wordWrap: state.wordWrap,
          minimap: state.minimap,
          lineNumbers: state.lineNumbers,
          providerSettings: state.providerSettings,
          // Don't export API keys for security
        }
        
        return JSON.stringify(exportData, null, 2)
      },

      importSettings: async (json) => {
        try {
          const imported = JSON.parse(json)
          set((state) => {
            Object.assign(state, imported)
          })
          
          await get().saveSettings()
        } catch (error) {
          console.error('Failed to import settings:', error)
          throw new Error('Invalid settings file')
        }
      },
    })),
    {
      name: 'pyvax-settings-store',
      partialize: (state) => ({
        apiKeys: state.saveAPIKeysLocally ? state.apiKeys : {},
        theme: state.theme,
        fontSize: state.fontSize,
        editorTheme: state.editorTheme,
        fontFamily: state.fontFamily,
        autoSave: state.autoSave,
        autoSaveDelay: state.autoSaveDelay,
        tabSize: state.tabSize,
        wordWrap: state.wordWrap,
        minimap: state.minimap,
        lineNumbers: state.lineNumbers,
        providerSettings: state.providerSettings,
        enableWebContainer: state.enableWebContainer,
        enableTerminal: state.enableTerminal,
        enableAIAssistant: state.enableAIAssistant,
        enableCodeCompletion: state.enableCodeCompletion,
        saveChatHistory: state.saveChatHistory,
        saveAPIKeysLocally: state.saveAPIKeysLocally,
        analyticsEnabled: state.analyticsEnabled,
      }),
    }
  )
)

// Selector hooks
export const useAPIKeys = () => useSettingsStore((state) => state.apiKeys)
export const useTheme = () => useSettingsStore((state) => state.theme)
export const useEditorSettings = () => useSettingsStore((state) => ({
  fontSize: state.fontSize,
  theme: state.editorTheme,
  fontFamily: state.fontFamily,
  tabSize: state.tabSize,
  wordWrap: state.wordWrap,
  minimap: state.minimap,
  lineNumbers: state.lineNumbers,
}))
export const useFeatureFlags = () => useSettingsStore((state) => ({
  webContainer: state.enableWebContainer,
  terminal: state.enableTerminal,
  aiAssistant: state.enableAIAssistant,
  codeCompletion: state.enableCodeCompletion,
}))
