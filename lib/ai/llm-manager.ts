/**
 * LLM Manager - Multi-provider orchestration for PyVax AI
 * Supports OpenAI, Anthropic, Google, Mistral, Cohere, OpenRouter, Groq
 */

import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from '@ai-sdk/mistral'
import { createCohere } from '@ai-sdk/cohere'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModelV1 } from 'ai'

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
  description: string
}

export interface ProviderConfig {
  provider: string
  apiKey: string
  baseURL?: string
  model: string
}

/**
 * Comprehensive model catalog with pricing and capabilities
 */
export const MODEL_CATALOG: Record<string, ModelInfo[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      pricing: { input: 2.5, output: 10 },
      capabilities: ['code', 'vision', 'function-calling', 'json-mode'],
      description: 'Most capable model for complex reasoning and code generation',
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      pricing: { input: 0.15, output: 0.6 },
      capabilities: ['code', 'vision', 'function-calling', 'json-mode'],
      description: 'Fast and affordable model for most tasks',
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      pricing: { input: 10, output: 30 },
      capabilities: ['code', 'vision', 'function-calling'],
      description: 'Previous generation flagship model',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      contextWindow: 16385,
      maxOutputTokens: 4096,
      pricing: { input: 0.5, output: 1.5 },
      capabilities: ['code', 'function-calling'],
      description: 'Fast and economical for simple tasks',
    },
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      pricing: { input: 3, output: 15 },
      capabilities: ['code', 'vision', 'thinking', 'artifacts'],
      description: 'Best for complex code generation and reasoning',
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      pricing: { input: 0.8, output: 4 },
      capabilities: ['code', 'vision'],
      description: 'Fast and affordable Claude model',
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      pricing: { input: 15, output: 75 },
      capabilities: ['code', 'vision', 'reasoning'],
      description: 'Most powerful Claude model for complex tasks',
    },
  ],
  google: [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash',
      provider: 'google',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      pricing: { input: 0, output: 0 }, // Free during preview
      capabilities: ['code', 'vision', 'multimodal'],
      description: 'Experimental model with 1M token context',
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      contextWindow: 2000000,
      maxOutputTokens: 8192,
      pricing: { input: 1.25, output: 5 },
      capabilities: ['code', 'vision', 'multimodal', 'long-context'],
      description: '2M token context for analyzing large codebases',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      pricing: { input: 0.075, output: 0.3 },
      capabilities: ['code', 'vision', 'multimodal'],
      description: 'Fast and efficient with large context',
    },
  ],
  mistral: [
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      provider: 'mistral',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      pricing: { input: 2, output: 6 },
      capabilities: ['code', 'function-calling', 'json-mode'],
      description: 'Flagship model with strong coding abilities',
    },
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small',
      provider: 'mistral',
      contextWindow: 32000,
      maxOutputTokens: 8192,
      pricing: { input: 0.2, output: 0.6 },
      capabilities: ['code', 'function-calling'],
      description: 'Efficient model for most tasks',
    },
  ],
  cohere: [
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      pricing: { input: 2.5, output: 10 },
      capabilities: ['code', 'rag', 'multilingual'],
      description: 'Optimized for retrieval-augmented generation',
    },
    {
      id: 'command-r',
      name: 'Command R',
      provider: 'cohere',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      pricing: { input: 0.15, output: 0.6 },
      capabilities: ['code', 'rag'],
      description: 'Balanced performance and cost',
    },
  ],
  openrouter: [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      pricing: { input: 3, output: 15 },
      capabilities: ['code', 'vision'],
      description: 'Access Claude via OpenRouter',
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      pricing: { input: 2.5, output: 10 },
      capabilities: ['code', 'vision'],
      description: 'Access GPT-4o via OpenRouter',
    },
    {
      id: 'google/gemini-2.0-flash-exp:free',
      name: 'Gemini 2.0 Flash (Free)',
      provider: 'openrouter',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      pricing: { input: 0, output: 0 },
      capabilities: ['code', 'vision', 'free'],
      description: 'Free access to Gemini 2.0',
    },
  ],
  groq: [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B',
      provider: 'groq',
      contextWindow: 32768,
      maxOutputTokens: 8192,
      pricing: { input: 0.59, output: 0.79 },
      capabilities: ['code', 'fast-inference'],
      description: 'Ultra-fast inference with Groq hardware',
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      provider: 'groq',
      contextWindow: 8192,
      maxOutputTokens: 8192,
      pricing: { input: 0.05, output: 0.08 },
      capabilities: ['code', 'fast-inference'],
      description: 'Extremely fast and affordable',
    },
  ],
}

/**
 * LLM Manager - Provider factory and model management
 */
export class LLMManager {
  private static providerCache = new Map<string, any>()

  /**
   * Get a language model instance for the specified provider and model
   */
  static getModel(config: ProviderConfig): LanguageModelV1 {
    const { provider, apiKey, baseURL, model } = config

    if (!apiKey) {
      throw new Error(`API key required for provider: ${provider}`)
    }

    // Create provider instance
    const providerInstance = this.getProvider(provider, apiKey, baseURL)

    // Return model
    return providerInstance(model)
  }

  /**
   * Get or create a provider instance (cached)
   */
  private static getProvider(provider: string, apiKey: string, baseURL?: string) {
    const cacheKey = `${provider}-${apiKey.slice(0, 8)}`

    if (this.providerCache.has(cacheKey)) {
      return this.providerCache.get(cacheKey)
    }

    let providerInstance: any

    switch (provider) {
      case 'openai':
        providerInstance = createOpenAI({
          apiKey,
          baseURL: baseURL || 'https://api.openai.com/v1',
        })
        break

      case 'anthropic':
        providerInstance = createAnthropic({
          apiKey,
        })
        break

      case 'google':
        providerInstance = createGoogleGenerativeAI({
          apiKey,
        })
        break

      case 'mistral':
        providerInstance = createMistral({
          apiKey,
        })
        break

      case 'cohere':
        providerInstance = createCohere({
          apiKey,
        })
        break

      case 'openrouter':
        providerInstance = createOpenRouter({
          apiKey,
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'PyVax AI - Agentic dApp Builder',
          },
        })
        break

      case 'groq':
        // Groq uses OpenAI-compatible API
        providerInstance = createOpenAI({
          apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        })
        break

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    this.providerCache.set(cacheKey, providerInstance)
    return providerInstance
  }

  /**
   * Get all available models across all providers
   */
  static getAllModels(): ModelInfo[] {
    return Object.values(MODEL_CATALOG).flat()
  }

  /**
   * Get models for a specific provider
   */
  static getModelsForProvider(provider: string): ModelInfo[] {
    return MODEL_CATALOG[provider] || []
  }

  /**
   * Get model information by ID
   */
  static getModelInfo(provider: string, modelId: string): ModelInfo | undefined {
    const models = this.getModelsForProvider(provider)
    return models.find((m) => m.id === modelId)
  }

  /**
   * Validate API key format for a provider
   */
  static validateAPIKey(provider: string, apiKey: string): boolean {
    if (!apiKey || apiKey.trim().length < 10) {
      return false
    }

    const patterns: Record<string, RegExp> = {
      openai: /^sk-[A-Za-z0-9]{48,}$/,
      anthropic: /^sk-ant-[A-Za-z0-9-]{95,}$/,
      google: /^AIza[A-Za-z0-9_-]{35}$/,
      mistral: /^[A-Za-z0-9]{32}$/,
      openrouter: /^sk-or-v1-[A-Za-z0-9]{64}$/,
      groq: /^gsk_[A-Za-z0-9]{52}$/,
    }

    const pattern = patterns[provider]
    return pattern ? pattern.test(apiKey) : true
  }

  /**
   * Calculate estimated cost for a request
   */
  static calculateCost(
    provider: string,
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const modelInfo = this.getModelInfo(provider, modelId)
    if (!modelInfo) return 0

    const inputCost = (inputTokens / 1_000_000) * modelInfo.pricing.input
    const outputCost = (outputTokens / 1_000_000) * modelInfo.pricing.output

    return inputCost + outputCost
  }

  /**
   * Get recommended model for a specific task
   */
  static getRecommendedModel(task: 'code' | 'chat' | 'reasoning' | 'fast' | 'free'): ModelInfo {
    const recommendations = {
      code: MODEL_CATALOG.anthropic[0], // Claude 3.5 Sonnet
      chat: MODEL_CATALOG.openai[1], // GPT-4o Mini
      reasoning: MODEL_CATALOG.anthropic[2], // Claude 3 Opus
      fast: MODEL_CATALOG.groq[1], // Llama 3.1 8B
      free: MODEL_CATALOG.google[0], // Gemini 2.0 Flash
    }

    return recommendations[task]
  }

  /**
   * Clear provider cache (useful for testing)
   */
  static clearCache() {
    this.providerCache.clear()
  }
}

// Export model catalog and types
export { MODEL_CATALOG as MODELS }
export default LLMManager
