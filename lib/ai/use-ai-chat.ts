/**
 * useAIChat Hook - React hook for AI chat integration
 * Provides easy-to-use interface for streaming chat in components
 */

import { useState, useCallback, useRef } from 'react'
import { useAIStore } from '@/lib/stores/ai-store'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { sendChatMessage, enhanceCode, type StreamOptions } from './client'

export interface UseAIChatOptions {
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortController = useRef<AbortController | null>(null)

  // Get state from stores
  const messages = useAIStore((state) => state.messages)
  const isStreaming = useAIStore((state) => state.isStreaming)
  const selectedProvider = useAIStore((state) => state.selectedProvider)
  const selectedModel = useAIStore((state) => state.selectedModel)
  const temperature = useAIStore((state) => state.temperature)
  const maxTokens = useAIStore((state) => state.maxTokens)
  
  const apiKeys = useSettingsStore((state) => state.apiKeys)

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (content: string, files?: Record<string, string>) => {
      // Get API key for selected provider
      const apiKey = apiKeys[selectedProvider]
      
      if (!apiKey) {
        const error = new Error(`No API key configured for ${selectedProvider}`)
        setError(error)
        options.onError?.(error)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        await sendChatMessage(content, {
          provider: selectedProvider,
          model: selectedModel,
          apiKey,
          temperature,
          maxTokens,
          files,
          onStart: () => {
            setIsLoading(false)
            options.onStart?.()
          },
          onToken: options.onToken,
          onComplete: options.onComplete,
          onError: (err) => {
            setError(err)
            setIsLoading(false)
            options.onError?.(err)
          },
        })
      } catch (err: any) {
        setError(err)
        setIsLoading(false)
        options.onError?.(err)
      }
    },
    [
      selectedProvider,
      selectedModel,
      apiKeys,
      temperature,
      maxTokens,
      options,
    ]
  )

  /**
   * Enhance code with AI
   */
  const enhance = useCallback(
    async (
      code: string,
      language: string,
      type: 'audit' | 'enhance' | 'explain' | 'tests' | 'deploy'
    ) => {
      const apiKey = apiKeys[selectedProvider]
      
      if (!apiKey) {
        const error = new Error(`No API key configured for ${selectedProvider}`)
        setError(error)
        options.onError?.(error)
        throw error
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await enhanceCode(code, language, type, {
          provider: selectedProvider,
          model: selectedModel,
          apiKey,
          onStart: () => {
            setIsLoading(false)
            options.onStart?.()
          },
          onToken: options.onToken,
          onComplete: options.onComplete,
          onError: (err) => {
            setError(err)
            setIsLoading(false)
            options.onError?.(err)
          },
        })
        
        return result
      } catch (err: any) {
        setError(err)
        setIsLoading(false)
        options.onError?.(err)
        throw err
      }
    },
    [selectedProvider, selectedModel, apiKeys, options]
  )

  /**
   * Stop streaming
   */
  const stop = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
      abortController.current = null
    }
    useAIStore.getState().stopStreaming()
    setIsLoading(false)
  }, [])

  /**
   * Clear chat history
   */
  const clear = useCallback(() => {
    useAIStore.getState().clearMessages()
    setError(null)
  }, [])

  return {
    // State
    messages,
    isLoading,
    isStreaming,
    error,
    
    // Actions
    sendMessage,
    enhance,
    stop,
    clear,
    
    // Provider info
    provider: selectedProvider,
    model: selectedModel,
  }
}

/**
 * useAIProvider Hook - Manage provider/model selection
 */
export function useAIProvider() {
  const selectedProvider = useAIStore((state) => state.selectedProvider)
  const selectedModel = useAIStore((state) => state.selectedModel)
  const setProvider = useAIStore((state) => state.setProvider)
  const temperature = useAIStore((state) => state.temperature)
  const setTemperature = useAIStore((state) => state.setTemperature)
  const maxTokens = useAIStore((state) => state.maxTokens)
  const setMaxTokens = useAIStore((state) => state.setMaxTokens)

  const apiKeys = useSettingsStore((state) => state.apiKeys)
  const setAPIKey = useSettingsStore((state) => state.setAPIKey)
  const getAPIKey = useSettingsStore((state) => state.getAPIKey)

  const hasAPIKey = useCallback(
    (provider: string) => {
      return !!apiKeys[provider]
    },
    [apiKeys]
  )

  const switchProvider = useCallback(
    (provider: string, model: string) => {
      setProvider(provider, model)
    },
    [setProvider]
  )

  return {
    // State
    provider: selectedProvider,
    model: selectedModel,
    temperature,
    maxTokens,
    apiKeys,
    
    // Actions
    setProvider: switchProvider,
    setTemperature,
    setMaxTokens,
    setAPIKey,
    getAPIKey,
    hasAPIKey,
  }
}

/**
 * useModelSelection Hook - Helper for model picker components
 */
export function useModelSelection() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadModels = useCallback(async (provider?: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        provider ? `/api/ai/models?provider=${provider}` : '/api/ai/models'
      )
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    models,
    loading,
    loadModels,
  }
}
