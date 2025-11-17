/**
 * Code Enhancer API - Improve code quality, add tests, optimize gas
 * Supports auditing, enhancement, explanation, and test generation
 */

import { type NextRequest } from 'next/server'
import { streamText } from 'ai'
import { LLMManager } from '@/lib/ai/llm-manager'
import {
  getAuditPrompt,
  getEnhancementPrompt,
  getExplainPrompt,
  getTestGenerationPrompt,
  getDeploymentPrompt,
} from '@/lib/ai/prompts/system-prompt'

export const runtime = 'edge'

type EnhancementType = 'audit' | 'enhance' | 'explain' | 'tests' | 'deploy'

interface EnhancerRequest {
  code: string
  language: string
  type: EnhancementType
  provider: string
  model: string
  apiKey: string
}

/**
 * POST /api/ai/enhancer
 * Enhance, audit, or explain code
 */
export async function POST(req: NextRequest) {
  try {
    const body: EnhancerRequest = await req.json()
    const { code, language, type, provider, model, apiKey } = body

    // Validation
    if (!code || !language || !type) {
      return new Response('Code, language, and type are required', {
        status: 400,
      })
    }

    if (!provider || !model || !apiKey) {
      return new Response('Provider, model, and API key are required', {
        status: 401,
      })
    }

    // Validate enhancement type
    const validTypes: EnhancementType[] = [
      'audit',
      'enhance',
      'explain',
      'tests',
      'deploy',
    ]
    if (!validTypes.includes(type)) {
      return new Response(
        `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        { status: 400 }
      )
    }

    // Get appropriate prompt
    const prompts = {
      audit: getAuditPrompt(),
      enhance: getEnhancementPrompt(),
      explain: getExplainPrompt(),
      tests: getTestGenerationPrompt(),
      deploy: getDeploymentPrompt(),
    }

    const systemPrompt = prompts[type]

    // Prepare messages
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ]

    // Get model instance
    const languageModel = LLMManager.getModel({
      provider,
      model,
      apiKey,
    })

    // Stream response
    const result = await streamText({
      model: languageModel,
      messages,
      temperature: type === 'audit' ? 0.3 : 0.7, // Lower temp for audits
      maxTokens: 8000,
      onFinish: async ({ usage }) => {
        console.log(`Code ${type} completed:`, usage)
      },
    })

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Enhancer API error:', error)

    if (error.message?.includes('API key')) {
      return new Response('Invalid API key', { status: 401 })
    }

    return new Response(
      JSON.stringify({
        error: 'Enhancement failed',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * GET /api/ai/enhancer
 * Get available enhancement types
 */
export async function GET() {
  return Response.json({
    types: [
      {
        id: 'audit',
        name: 'Security Audit',
        description: 'Analyze code for security vulnerabilities',
      },
      {
        id: 'enhance',
        name: 'Code Enhancement',
        description: 'Improve code quality and gas efficiency',
      },
      {
        id: 'explain',
        name: 'Code Explanation',
        description: 'Get detailed explanation of how code works',
      },
      {
        id: 'tests',
        name: 'Generate Tests',
        description: 'Create comprehensive unit tests',
      },
      {
        id: 'deploy',
        name: 'Deployment Script',
        description: 'Generate deployment scripts for Avalanche',
      },
    ],
  })
}
