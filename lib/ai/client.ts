/**
 * AI Client - Frontend utilities for interacting with AI APIs
 * Handles streaming, error handling, and state updates
 */

import { useAIStore } from '@/lib/stores/ai-store'
import type { Message } from '@/types/ai'

export interface StreamOptions {
  provider: string
  model: string
  apiKey: string
  temperature?: number
  maxTokens?: number
  files?: Record<string, string>
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

/**
 * Send a chat message with streaming response
 */
export async function sendChatMessage(
  content: string,
  options: StreamOptions
): Promise<void> {
  const store = useAIStore.getState()
  
  // Add user message
  const userMessageId = store.addMessage({
    role: 'user',
    content,
  })

  // Add empty assistant message for streaming
  const assistantMessageId = store.addMessage({
    role: 'assistant',
    content: '',
  })

  // Start streaming
  store.startStreaming(assistantMessageId)
  options.onStart?.()

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: store.messages.slice(0, -1), // Exclude the empty assistant message
        provider: options.provider,
        model: options.model,
        apiKey: options.apiKey,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        files: options.files,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    // Read stream
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (!reader) {
      throw new Error('No reader available')
    }

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('0:')) {
          // Text chunk
          const text = line.slice(2).trim()
          if (text) {
            fullText += text
            store.appendToStreamingMessage(text)
            options.onToken?.(text)
          }
        } else if (line.startsWith('d:')) {
          // Data chunk (usage info)
          try {
            const data = JSON.parse(line.slice(2))
            if (data.type === 'usage') {
              store.updateMessageUsage(assistantMessageId, data.value)
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    // Complete
    store.stopStreaming()
    options.onComplete?.(fullText)

    // Save chat if it's new
    if (!store.currentChatId && store.messages.length > 0) {
      await store.saveCurrentChat()
    }
  } catch (error: any) {
    console.error('Chat error:', error)
    store.setError(error)
    store.stopStreaming()
    
    // Update assistant message with error
    store.updateMessage(
      assistantMessageId,
      `Error: ${error.message || 'An unexpected error occurred'}`
    )
    
    options.onError?.(error)
  }
}

/**
 * Enhance code with AI
 */
export async function enhanceCode(
  code: string,
  language: string,
  type: 'audit' | 'enhance' | 'explain' | 'tests' | 'deploy',
  options: StreamOptions
): Promise<string> {
  options.onStart?.()

  try {
    const response = await fetch('/api/ai/enhancer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        type,
        provider: options.provider,
        model: options.model,
        apiKey: options.apiKey,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    // Read stream
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (!reader) {
      throw new Error('No reader available')
    }

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('0:')) {
          const text = line.slice(2).trim()
          if (text) {
            fullText += text
            options.onToken?.(text)
          }
        }
      }
    }

    options.onComplete?.(fullText)
    return fullText
  } catch (error: any) {
    console.error('Enhancement error:', error)
    options.onError?.(error)
    throw error
  }
}

/**
 * Fetch available models
 */
export async function fetchModels(provider?: string) {
  try {
    const url = provider
      ? `/api/ai/models?provider=${provider}`
      : '/api/ai/models'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch models:', error)
    throw error
  }
}

/**
 * Get recommended model for a task
 */
export async function getRecommendedModel(
  task: 'code' | 'chat' | 'reasoning' | 'fast' | 'free'
) {
  try {
    const response = await fetch('/api/ai/models/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to get recommendation')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to get recommendation:', error)
    throw error
  }
}

/**
 * Test API key validity
 */
export async function testAPIKey(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    // Make a minimal request to test the key
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        provider,
        model: 'gpt-3.5-turbo', // Use cheapest model for testing
        apiKey,
        maxTokens: 10,
      }),
    })

    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Parse code blocks from AI response
 */
export function parseCodeBlocks(markdown: string): Array<{
  language: string
  code: string
  path?: string
}> {
  const codeBlockRegex = /```(\w+)(?::(.+?))?\n([\s\S]*?)```/g
  const blocks: Array<{ language: string; code: string; path?: string }> = []

  let match
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1],
      code: match[3].trim(),
      path: match[2]?.trim(),
    })
  }

  return blocks
}

/**
 * Extract file modifications from AI response
 */
export function extractFileModifications(content: string): Record<string, string> {
  const files: Record<string, string> = {}
  
  // Match <diff path="...">...</diff> blocks
  const diffRegex = /<diff path="([^"]+)">\s*```\w*\n([\s\S]*?)```\s*<\/diff>/g
  
  let match
  while ((match = diffRegex.exec(content)) !== null) {
    const path = match[1]
    const code = match[2].trim()
    files[path] = code
  }

  return files
}

/**
 * Calculate token count (rough estimate)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

/**
 * Format cost in USD
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(4)}¢`
  }
  return `$${cost.toFixed(4)}`
}
