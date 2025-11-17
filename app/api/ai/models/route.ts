/**
 * Models API Route - List available LLM models
 * Returns model catalog with pricing, capabilities, and provider info
 */

import { type NextRequest } from 'next/server'
import { LLMManager, type ModelInfo } from '@/lib/ai/llm-manager'

export const runtime = 'edge'

/**
 * GET /api/ai/models
 * Returns all available models across providers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')

    let models: ModelInfo[]

    if (provider) {
      // Get models for specific provider
      models = LLMManager.getModelsForProvider(provider)
      
      if (models.length === 0) {
        return Response.json(
          { error: `No models found for provider: ${provider}` },
          { status: 404 }
        )
      }
    } else {
      // Get all models
      models = LLMManager.getAllModels()
    }

    // Group by provider for easier frontend consumption
    const grouped = models.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    }, {} as Record<string, ModelInfo[]>)

    return Response.json({
      models,
      grouped,
      count: models.length,
      providers: Object.keys(grouped),
    })
  } catch (error: any) {
    console.error('Models API error:', error)
    
    return Response.json(
      {
        error: 'Failed to fetch models',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai/models/recommend
 * Get recommended model for a specific task
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { task } = body

    if (!task) {
      return Response.json(
        { error: 'Task parameter is required' },
        { status: 400 }
      )
    }

    const validTasks = ['code', 'chat', 'reasoning', 'fast', 'free']
    if (!validTasks.includes(task)) {
      return Response.json(
        { error: `Task must be one of: ${validTasks.join(', ')}` },
        { status: 400 }
      )
    }

    const recommended = LLMManager.getRecommendedModel(task)

    return Response.json({
      task,
      recommended,
    })
  } catch (error: any) {
    console.error('Model recommendation error:', error)
    
    return Response.json(
      {
        error: 'Failed to get recommendation',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
