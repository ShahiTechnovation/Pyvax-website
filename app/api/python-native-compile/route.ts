/**
 * Python Native Compilation API Route
 * Compiles Python smart contracts directly to EVM bytecode using the Python microservice
 */

import { NextRequest, NextResponse } from 'next/server'

interface PythonCompileRequest {
  source: string
  contractName?: string
  optimize?: boolean
}

interface PythonCompileResponse {
  success: boolean
  bytecode: string
  abi: any[]
  metadata: {
    compiler: string
    version: string
    gas_estimate: number
    state_variables: Record<string, number>
    functions: string[]
  }
  compiler: string
  version: string
}

const PYTHON_COMPILER_URL = process.env.PYTHON_COMPILER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body: PythonCompileRequest = await request.json()
    const { source, contractName = 'Contract', optimize = true } = body

    if (!source) {
      return NextResponse.json(
        { 
          success: false, 
          errors: ['No source code provided'] 
        },
        { status: 400 }
      )
    }

    // Call Python compiler microservice
    const compilerResponse = await fetch(`${PYTHON_COMPILER_URL}/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: source,
        contractName,
        optimize,
      }),
    })

    if (!compilerResponse.ok) {
      const error = await compilerResponse.json() as { detail?: string }
      return NextResponse.json(
        {
          success: false,
          errors: [error.detail || 'Compilation failed'],
        },
        { status: compilerResponse.status }
      )
    }

    const result: PythonCompileResponse = await compilerResponse.json()

    return NextResponse.json({
      success: true,
      bytecode: result.bytecode,
      abi: result.abi,
      metadata: result.metadata,
      compiler: 'python-native',
      compilerVersion: result.version,
      native: true,
    })

  } catch (error) {
    console.error('Python compilation error:', error)
    
    // Check if Python service is unreachable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            'Python compiler service is not available. Please ensure the Python microservice is running.',
            `Expected URL: ${PYTHON_COMPILER_URL}`,
            'Run: cd python-compiler-service && python main.py'
          ],
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error'],
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    const healthResponse = await fetch(`${PYTHON_COMPILER_URL}/health`, {
      method: 'GET',
    })

    const isHealthy = healthResponse.ok

    return NextResponse.json({
      service: 'python-native-compile',
      compilerUrl: PYTHON_COMPILER_URL,
      compilerStatus: isHealthy ? 'healthy' : 'unhealthy',
      available: isHealthy,
    })
  } catch (error) {
    return NextResponse.json({
      service: 'python-native-compile',
      compilerUrl: PYTHON_COMPILER_URL,
      compilerStatus: 'unreachable',
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
