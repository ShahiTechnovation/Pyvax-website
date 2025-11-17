/**
 * Python Native Compiler Client
 * Compiles Python smart contracts directly to EVM bytecode
 */

export interface PythonCompileResult {
  success: boolean
  bytecode?: string
  abi?: any[]
  metadata?: {
    compiler: string
    version: string
    gas_estimate: number
    state_variables: Record<string, number>
    functions: string[]
  }
  compiler?: string
  compilerVersion?: string
  native?: boolean
  errors?: string[]
}

export interface CompilerStatus {
  service: string
  compilerUrl: string
  compilerStatus: 'healthy' | 'unhealthy' | 'unreachable'
  available: boolean
  error?: string
}

/**
 * Compile Python smart contract to EVM bytecode using native compiler
 */
export async function compilePythonNative(
  pythonCode: string,
  contractName: string = 'Contract'
): Promise<PythonCompileResult> {
  try {
    const response = await fetch('/api/python-native-compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: pythonCode,
        contractName,
        optimize: true,
      }),
    })

    const result = await response.json()
    return result

  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Compilation failed'],
    }
  }
}

/**
 * Check if Python native compiler is available
 */
export async function checkCompilerStatus(): Promise<CompilerStatus> {
  try {
    const response = await fetch('/api/python-native-compile', {
      method: 'GET',
    })

    return await response.json()
  } catch (error) {
    return {
      service: 'python-native-compile',
      compilerUrl: 'unknown',
      compilerStatus: 'unreachable',
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validate Python syntax without full compilation
 */
export async function validatePythonSyntax(pythonCode: string): Promise<{
  valid: boolean
  message: string
  line?: number
  offset?: number
}> {
  try {
    // For now, just try to compile and check for syntax errors
    const result = await compilePythonNative(pythonCode)
    
    if (result.success) {
      return {
        valid: true,
        message: 'Python syntax is valid',
      }
    } else {
      const errorMessage = result.errors?.[0] || 'Validation failed'
      return {
        valid: false,
        message: errorMessage,
      }
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'Validation error',
    }
  }
}
