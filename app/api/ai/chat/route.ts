/**
 * Chat API Route - Streaming LLM responses
 * Supports multiple providers: OpenAI, Anthropic, Google, Mistral, Cohere, OpenRouter, Groq
 */

import { type NextRequest } from 'next/server'
import { streamText } from 'ai'
import { LLMManager } from '@/lib/ai/llm-manager'
import { getSystemPrompt } from '@/lib/ai/prompts/system-prompt'
import { MAX_TOKENS } from '@/lib/constants'

export const runtime = 'edge' // Use Edge runtime for streaming

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  provider: string
  model: string
  apiKey: string
  temperature?: number
  maxTokens?: number
  files?: Record<string, string>
}

/**
 * POST /api/ai/chat
 * Stream AI responses with multi-provider support
 */
export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const {
      messages,
      provider,
      model,
      apiKey,
      temperature = 0.7,
      maxTokens = MAX_TOKENS,
      files,
    } = body

    // Validation
    if (!messages || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    if (!provider || !model) {
      return new Response('Provider and model are required', { status: 400 })
    }

    if (!apiKey) {
      return new Response('API key is required', { status: 401 })
    }

    // Validate API key format
    if (!LLMManager.validateAPIKey(provider, apiKey)) {
      return new Response('Invalid API key format', { status: 401 })
    }

    // Get system prompt with file context
    const systemPrompt = getSystemPrompt()
    const fileContext = files ? formatFileContext(files) : ''
    
    const systemMessage = {
      role: 'system' as const,
      content: systemPrompt + fileContext,
    }

    // Prepare messages
    const allMessages = [systemMessage, ...messages]

    // Get model instance
    let languageModel
    try {
      languageModel = LLMManager.getModel({
        provider,
        model,
        apiKey,
      })
    } catch (error: any) {
      console.error('Failed to get model:', error)
      return new Response(error.message || 'Failed to initialize model', {
        status: 500,
      })
    }

    // Stream response
    const result = await streamText({
      model: languageModel,
      messages: allMessages,
      temperature,
      maxTokens,
      onFinish: async ({ text, finishReason, usage }) => {
        // Log completion
        console.log('Chat completed:', {
          provider,
          model,
          finishReason,
          usage,
        })

        // Could store metrics here
        if (usage) {
          const cost = LLMManager.calculateCost(
            provider,
            model,
            usage.promptTokens,
            usage.completionTokens
          )
          console.log(`Estimated cost: $${cost.toFixed(6)}`)
        }
      },
    })

    // Return streaming response
    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)

    // Handle specific errors
    if (error.message?.includes('API key')) {
      return new Response('Invalid or expired API key', { status: 401 })
    }

    if (error.message?.includes('rate limit')) {
      return new Response('Rate limit exceeded. Please try again later.', {
        status: 429,
      })
    }

    if (error.message?.includes('context length')) {
      return new Response(
        'Message too long. Please reduce the input size or clear the chat history.',
        { status: 413 }
      )
    }

    // Generic error
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Format file context for the system prompt
 */
function formatFileContext(files: Record<string, string>): string {
  if (Object.keys(files).length === 0) {
    return ''
  }

  let context = '\n\n<current_project_files>\n'
  
  for (const [path, content] of Object.entries(files)) {
    const preview = content.slice(0, 1000)
    const truncated = content.length > 1000 ? '...\n[truncated]' : ''
    
    context += `\nFile: ${path}\n\`\`\`\n${preview}${truncated}\n\`\`\`\n`
  }
  
  context += '</current_project_files>\n'
  
  return context
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
