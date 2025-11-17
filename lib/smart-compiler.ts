/**
 * Smart Compiler - Automatically chooses best compilation method
 * Supports: Browser (Pyodide), Transpiler, or API
 * 
 * IMPORTANT: Uses dynamic imports to avoid SSR issues with Pyodide
 */

import { transpilePythonToSolidity } from './simple-python-transpiler'
import { compilePythonNative } from './python-native-compiler'

export type CompilerMode = 'browser' | 'transpiler' | 'api' | 'auto'

export interface SmartCompileResult {
  success: boolean
  bytecode?: string
  abi?: any[]
  solidity?: string
  compiler?: string
  mode?: CompilerMode
  errors?: string[]
  metadata?: any
}

/**
 * Analyze Python code complexity
 */
function analyzeComplexity(code: string): 'simple' | 'complex' {
  // Check for complex features
  const hasInheritance = /class\s+\w+\([^)]+\)/.test(code)
  const hasDecorators = code.includes('@')
  const hasComplexTypes = /List\[|Dict\[|Tuple\[|Optional\[/.test(code)
  const hasImports = code.includes('import ') || code.includes('from ')
  const hasMultipleClasses = (code.match(/class\s+\w+/g) || []).length > 1
  
  return (hasInheritance || hasComplexTypes || hasImports || hasMultipleClasses) 
    ? 'complex' 
    : 'simple'
}

/**
 * Smart compile - automatically chooses best method
 */
export async function smartCompile(
  pythonCode: string,
  preferredMode: CompilerMode = 'auto'
): Promise<SmartCompileResult> {
  const complexity = analyzeComplexity(pythonCode)
  
  // Auto mode - choose based on availability and complexity
  if (preferredMode === 'auto') {
    // Prioritize API compiler (most reliable) if Python service is running
    // Try API first, then browser, then transpiler
    preferredMode = 'api'  // Always try API first for best results
  }
  
  // Try preferred mode
  try {
    switch (preferredMode) {
      case 'browser':
        return await compileBrowser(pythonCode)
      
      case 'transpiler':
        return await compileTranspiler(pythonCode)
      
      case 'api':
        return await compileAPI(pythonCode)
      
      default:
        throw new Error('Invalid compiler mode')
    }
  } catch (error: any) {
    // Fallback logic
    console.warn(`[Smart Compiler] ${preferredMode} failed, trying fallback...`)
    
    if (preferredMode === 'api') {
      // API failed, try browser
      const browserCompiler = await import('./browser-python-compiler-safe')
      if (browserCompiler.isPyodideReady()) {
        return await compileBrowser(pythonCode)
      } else {
        // Browser not ready, use transpiler
        return await compileTranspiler(pythonCode)
      }
    } else if (preferredMode === 'browser') {
      // Browser failed, try transpiler
      return await compileTranspiler(pythonCode)
    } else {
      // Transpiler failed, try initializing browser
      const browserCompiler = await import('./browser-python-compiler-safe')
      await browserCompiler.initPyodide()
      return await compileBrowser(pythonCode)
    }
  }
}

/**
 * Compile using browser (Pyodide)
 */
async function compileBrowser(pythonCode: string): Promise<SmartCompileResult> {
  console.log('[Smart Compiler] Using browser compiler (Pyodide)')
  
  const browserCompiler = await import('./browser-python-compiler-safe')
  const result = await browserCompiler.compilePythonInBrowser(pythonCode)
  
  return {
    ...result,
    compiler: 'pyodide-browser',
    mode: 'browser',
  }
}

/**
 * Compile using transpiler
 */
async function compileTranspiler(pythonCode: string): Promise<SmartCompileResult> {
  console.log('[Smart Compiler] Using transpiler')
  
  const result = await transpilePythonToSolidity(pythonCode)
  
  return {
    success: !!result.bytecode,
    bytecode: result.bytecode,
    abi: result.abi,
    solidity: result.solidity,
    compiler: 'js-transpiler',
    mode: 'transpiler',
    errors: result.errors,
  }
}

/**
 * Compile using API
 */
async function compileAPI(pythonCode: string): Promise<SmartCompileResult> {
  console.log('[Smart Compiler] Using API compiler')
  
  try {
    const result = await compilePythonNative(pythonCode)
    
    return {
      success: result.success,
      bytecode: result.bytecode,
      abi: result.abi,
      compiler: 'python-native-api',
      mode: 'api',
      errors: result.errors,
      metadata: result.metadata,
    }
  } catch (error: any) {
    // API unavailable
    return {
      success: false,
      errors: ['API compiler unavailable. Please use browser or transpiler mode.'],
      mode: 'api',
    }
  }
}

/**
 * Initialize Pyodide in background (call on app start)
 */
export async function warmupBrowserCompiler(): Promise<void> {
  try {
    const browserCompiler = await import('./browser-python-compiler-safe')
    if (!browserCompiler.isPyodideReady()) {
      console.log('[Smart Compiler] Warming up browser compiler...')
      await browserCompiler.initPyodide()
      console.log('[Smart Compiler] Browser compiler ready!')
    }
  } catch (error) {
    console.warn('[Smart Compiler] Browser compiler warmup failed:', error)
  }
}

/**
 * Get recommended compiler mode
 */
export async function getRecommendedMode(pythonCode: string): Promise<CompilerMode> {
  const complexity = analyzeComplexity(pythonCode)
  
  try {
    const browserCompiler = await import('./browser-python-compiler-safe')
    if (browserCompiler.isPyodideReady()) {
      return 'browser' // Pyodide ready, use it
    }
  } catch {
    // Browser compiler not available
  }
  
  if (complexity === 'simple') {
    return 'transpiler' // Simple code, transpiler is fast
  } else {
    return 'api' // Complex code, need full compiler
  }
}

/**
 * Get compiler status
 */
export async function getCompilerStatus() {
  let browserAvailable = false
  
  try {
    const browserCompiler = await import('./browser-python-compiler-safe')
    browserAvailable = browserCompiler.isPyodideReady()
  } catch {
    // Browser compiler not available
  }
  
  return {
    browser: {
      available: browserAvailable,
      name: 'Pyodide (Browser)',
      description: 'Full Python in WebAssembly',
    },
    transpiler: {
      available: true,
      name: 'JS Transpiler',
      description: 'Fast, lightweight',
    },
    api: {
      available: true, // Check will happen on use
      name: 'API Compiler',
      description: 'Server-side Python',
    },
  }
}
