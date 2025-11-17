/**
 * IndexedDB Database Layer for PyVax Unified
 * Handles persistent storage for chats, projects, API keys, and settings
 */

import Dexie, { type EntityTable } from 'dexie'
import type { Message } from '@/types/ai'

// Database Schemas
export interface Chat {
  id: string
  title: string
  messages: Message[]
  provider: string
  model: string
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  description?: string
  files: Record<string, string>
  dependencies?: Record<string, string>
  previewUrl?: string
  createdAt: number
  updatedAt: number
}

export interface APIKey {
  provider: string
  key: string
  isValid: boolean
  updatedAt: number
}

export interface UserSettings {
  id: string
  theme: 'light' | 'dark' | 'system'
  defaultProvider: string
  defaultModel: string
  autoSave: boolean
  enableTerminal: boolean
  enablePreview: boolean
  fontSize: number
  editorTheme: string
}

// Dexie Database Class
class PyVaxDatabase extends Dexie {
  chats!: EntityTable<Chat, 'id'>
  projects!: EntityTable<Project, 'id'>
  apiKeys!: EntityTable<APIKey, 'provider'>
  settings!: EntityTable<UserSettings, 'id'>

  constructor() {
    super('PyVaxDB')
    
    this.version(1).stores({
      chats: 'id, createdAt, updatedAt, provider, model',
      projects: 'id, name, createdAt, updatedAt',
      apiKeys: 'provider, updatedAt',
      settings: 'id',
    })
  }
}

// Singleton instance
export const db = new PyVaxDatabase()

// Helper functions for Chat operations
export const chatDB = {
  async getAll(): Promise<Chat[]> {
    return db.chats.orderBy('updatedAt').reverse().toArray()
  },

  async get(id: string): Promise<Chat | undefined> {
    return db.chats.get(id)
  },

  async create(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.chats.add({
      ...chat,
      id,
      createdAt: now,
      updatedAt: now,
    })
    return id
  },

  async update(id: string, updates: Partial<Chat>): Promise<void> {
    await db.chats.update(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },

  async delete(id: string): Promise<void> {
    await db.chats.delete(id)
  },

  async deleteAll(): Promise<void> {
    await db.chats.clear()
  },

  async search(query: string): Promise<Chat[]> {
    const allChats = await this.getAll()
    return allChats.filter(chat => 
      chat.title.toLowerCase().includes(query.toLowerCase()) ||
      chat.messages.some(msg => msg.content.toLowerCase().includes(query.toLowerCase()))
    )
  },
}

// Helper functions for Project operations
export const projectDB = {
  async getAll(): Promise<Project[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray()
  },

  async get(id: string): Promise<Project | undefined> {
    return db.projects.get(id)
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.projects.add({
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    })
    return id
  },

  async update(id: string, updates: Partial<Project>): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },

  async delete(id: string): Promise<void> {
    await db.projects.delete(id)
  },

  async deleteAll(): Promise<void> {
    await db.projects.clear()
  },

  async updateFiles(id: string, files: Record<string, string>): Promise<void> {
    await this.update(id, { files })
  },
}

// Helper functions for API Key operations
export const apiKeyDB = {
  async getAll(): Promise<APIKey[]> {
    return db.apiKeys.toArray()
  },

  async get(provider: string): Promise<APIKey | undefined> {
    return db.apiKeys.get(provider)
  },

  async set(provider: string, key: string): Promise<void> {
    await db.apiKeys.put({
      provider,
      key,
      isValid: true,
      updatedAt: Date.now(),
    })
  },

  async delete(provider: string): Promise<void> {
    await db.apiKeys.delete(provider)
  },

  async deleteAll(): Promise<void> {
    await db.apiKeys.clear()
  },

  async getAllKeys(): Promise<Record<string, string>> {
    const keys = await this.getAll()
    return keys.reduce((acc, { provider, key }) => {
      acc[provider] = key
      return acc
    }, {} as Record<string, string>)
  },
}

// Helper functions for Settings operations
export const settingsDB = {
  async get(): Promise<UserSettings> {
    const settings = await db.settings.get('default')
    if (!settings) {
      // Return default settings
      return {
        id: 'default',
        theme: 'dark',
        defaultProvider: 'openai',
        defaultModel: 'gpt-4o-mini',
        autoSave: true,
        enableTerminal: true,
        enablePreview: true,
        fontSize: 14,
        editorTheme: 'vs-dark',
      }
    }
    return settings
  },

  async update(updates: Partial<UserSettings>): Promise<void> {
    const current = await this.get()
    await db.settings.put({
      ...current,
      ...updates,
    })
  },

  async reset(): Promise<void> {
    await db.settings.delete('default')
  },
}

// Export all database utilities
export default {
  db,
  chatDB,
  projectDB,
  apiKeyDB,
  settingsDB,
}
