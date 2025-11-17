/**
 * AI Store - State management for chat, messages, and LLM providers
 * Replaces nanostores from Bolt.diy with Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Message } from '@/types/ai'
import { chatDB } from '@/lib/db'
import { DEFAULT_PROVIDER, DEFAULT_MODEL } from '@/lib/constants'

export interface AIState {
  // Current Chat State
  messages: Message[]
  isStreaming: boolean
  streamingMessageId: string | null
  currentChatId: string | null
  error: Error | null

  // Provider Configuration
  selectedProvider: string
  selectedModel: string
  temperature: number
  maxTokens: number

  // Chat History
  chatHistory: Array<{ id: string; title: string; updatedAt: number }>

  // Actions - Message Management
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, content: string) => void
  updateMessageUsage: (id: string, usage: Message['usage']) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void

  // Actions - Streaming
  startStreaming: (messageId: string) => void
  stopStreaming: () => void
  appendToStreamingMessage: (content: string) => void

  // Actions - Chat Management
  loadChat: (chatId: string) => Promise<void>
  saveCurrentChat: (title?: string) => Promise<string>
  deleteChat: (chatId: string) => Promise<void>
  createNewChat: () => void
  loadChatHistory: () => Promise<void>

  // Actions - Provider Management
  setProvider: (provider: string, model: string) => void
  setTemperature: (temperature: number) => void
  setMaxTokens: (maxTokens: number) => void

  // Actions - Error Handling
  setError: (error: Error | null) => void
}

export const useAIStore = create<AIState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      messages: [],
      isStreaming: false,
      streamingMessageId: null,
      currentChatId: null,
      error: null,
      selectedProvider: DEFAULT_PROVIDER,
      selectedModel: DEFAULT_MODEL,
      temperature: 0.7,
      maxTokens: 8000,
      chatHistory: [],

      // Message Management
      addMessage: (message) => {
        const id = crypto.randomUUID()
        const timestamp = Date.now()
        
        set((state) => {
          state.messages.push({
            ...message,
            id,
            timestamp,
          })
        })
        
        return id
      },

      updateMessage: (id, content) => {
        set((state) => {
          const message = state.messages.find((m) => m.id === id)
          if (message) {
            message.content = content
          }
        })
      },

      updateMessageUsage: (id, usage) => {
        set((state) => {
          const message = state.messages.find((m) => m.id === id)
          if (message && usage) {
            message.usage = usage
          }
        })
      },

      deleteMessage: (id) => {
        set((state) => {
          state.messages = state.messages.filter((m) => m.id !== id)
        })
      },

      clearMessages: () => {
        set((state) => {
          state.messages = []
          state.currentChatId = null
          state.error = null
        })
      },

      // Streaming Management
      startStreaming: (messageId) => {
        set((state) => {
          state.isStreaming = true
          state.streamingMessageId = messageId
          state.error = null
        })
      },

      stopStreaming: () => {
        set((state) => {
          state.isStreaming = false
          state.streamingMessageId = null
        })
      },

      appendToStreamingMessage: (content) => {
        const { streamingMessageId } = get()
        if (!streamingMessageId) return

        set((state) => {
          const message = state.messages.find((m) => m.id === streamingMessageId)
          if (message) {
            message.content += content
          }
        })
      },

      // Chat Management
      loadChat: async (chatId) => {
        try {
          const chat = await chatDB.get(chatId)
          if (!chat) {
            throw new Error('Chat not found')
          }

          set((state) => {
            state.messages = chat.messages
            state.currentChatId = chatId
            state.selectedProvider = chat.provider
            state.selectedModel = chat.model
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error as Error
          })
        }
      },

      saveCurrentChat: async (title) => {
        const { messages, currentChatId, selectedProvider, selectedModel } = get()

        if (messages.length === 0) {
          throw new Error('No messages to save')
        }

        const chatTitle = title || messages[0]?.content.slice(0, 50) || 'New Chat'

        try {
          if (currentChatId) {
            // Update existing chat
            await chatDB.update(currentChatId, {
              title: chatTitle,
              messages,
              provider: selectedProvider,
              model: selectedModel,
            })
            return currentChatId
          } else {
            // Create new chat
            const newChatId = await chatDB.create({
              title: chatTitle,
              messages,
              provider: selectedProvider,
              model: selectedModel,
            })
            
            set((state) => {
              state.currentChatId = newChatId
            })
            
            // Refresh chat history
            await get().loadChatHistory()
            
            return newChatId
          }
        } catch (error) {
          set((state) => {
            state.error = error as Error
          })
          throw error
        }
      },

      deleteChat: async (chatId) => {
        try {
          await chatDB.delete(chatId)
          
          // If deleted chat is current, clear it
          const { currentChatId } = get()
          if (currentChatId === chatId) {
            get().createNewChat()
          }
          
          // Refresh chat history
          await get().loadChatHistory()
        } catch (error) {
          set((state) => {
            state.error = error as Error
          })
        }
      },

      createNewChat: () => {
        set((state) => {
          state.messages = []
          state.currentChatId = null
          state.error = null
          state.isStreaming = false
          state.streamingMessageId = null
        })
      },

      loadChatHistory: async () => {
        try {
          const chats = await chatDB.getAll()
          set((state) => {
            state.chatHistory = chats.map((chat) => ({
              id: chat.id,
              title: chat.title,
              updatedAt: chat.updatedAt,
            }))
          })
        } catch (error) {
          console.error('Failed to load chat history:', error)
        }
      },

      // Provider Management
      setProvider: (provider, model) => {
        set((state) => {
          state.selectedProvider = provider
          state.selectedModel = model
        })
      },

      setTemperature: (temperature) => {
        set((state) => {
          state.temperature = Math.max(0, Math.min(2, temperature))
        })
      },

      setMaxTokens: (maxTokens) => {
        set((state) => {
          state.maxTokens = Math.max(100, Math.min(32000, maxTokens))
        })
      },

      // Error Handling
      setError: (error) => {
        set((state) => {
          state.error = error
          if (error) {
            state.isStreaming = false
            state.streamingMessageId = null
          }
        })
      },
    })),
    {
      name: 'pyvax-ai-store',
      partialize: (state) => ({
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        currentChatId: state.currentChatId,
      }),
    }
  )
)

// Selector hooks for optimized re-renders
export const useMessages = () => useAIStore((state) => state.messages)
export const useIsStreaming = () => useAIStore((state) => state.isStreaming)
export const useCurrentProvider = () => useAIStore((state) => ({
  provider: state.selectedProvider,
  model: state.selectedModel,
}))
export const useChatHistory = () => useAIStore((state) => state.chatHistory)
