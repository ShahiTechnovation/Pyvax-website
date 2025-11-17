/**
 * AI Module - Centralized exports for PyVax AI functionality
 */

// LLM Manager
export { LLMManager, MODEL_CATALOG, MODELS } from './llm-manager'
export type { ModelInfo, ProviderConfig } from './llm-manager'

// System Prompts
export {
  getSystemPrompt,
  getAuditPrompt,
  getEnhancementPrompt,
  getExplainPrompt,
  getTestGenerationPrompt,
  getDeploymentPrompt,
} from './prompts/system-prompt'

// Client Utilities
export {
  sendChatMessage,
  enhanceCode,
  fetchModels,
  getRecommendedModel,
  testAPIKey,
  parseCodeBlocks,
  extractFileModifications,
  estimateTokenCount,
  formatCost,
} from './client'
export type { StreamOptions } from './client'

// React Hooks
export { useAIChat, useAIProvider, useModelSelection } from './use-ai-chat'
export type { UseAIChatOptions } from './use-ai-chat'
