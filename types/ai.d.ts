// AI-related type definitions for PyVax Unified

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
  usage?: TokenUsage
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface LLMProvider {
  id: string
  name: string
  baseURL?: string
  requiresApiKey: boolean
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  contextWindow: number
  maxOutputTokens: number
  pricing: {
    input: number  // per 1M tokens
    output: number // per 1M tokens
  }
  capabilities: string[]
}

export interface ProviderConfig {
  provider: string
  model: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatRequest {
  messages: Message[]
  provider: string
  model: string
  apiKey: string
  files?: Record<string, string>
  contextOptimization?: boolean
}

export interface ChatResponse {
  message: Message
  usage?: TokenUsage
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls'
}

export interface StreamChunk {
  type: 'text' | 'usage' | 'error' | 'done'
  content?: string
  usage?: TokenUsage
  error?: string
}
