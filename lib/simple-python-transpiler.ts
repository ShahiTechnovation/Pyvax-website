// Python to EVM Bytecode Transpiler (Browser-compatible)
// Based on professional Python-to-EVM transpiler architecture

export interface TranspileResult {
  success: boolean
  solidity?: string
  bytecode?: string
  abi?: any[]
  metadata?: any
  errors?: string[]
}

export async function transpilePythonToSolidity(pythonCode: string): Promise<TranspileResult> {
  try {
    // Call the transpile API endpoint
    const response = await fetch('/api/transpile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: pythonCode
      })
    })

    if (!response.ok) {
      throw new Error('Transpilation request failed')
    }

    const result = await response.json()
    
    if (result.success) {
      // Also generate Solidity for display
      const transpiler = new SimplePythonTranspiler()
      const solidity = transpiler.transpile(pythonCode)
      
      return {
        success: true,
        solidity,
        bytecode: result.bytecode,
        abi: result.abi,
        metadata: result.metadata
      }
    } else {
      return {
        success: false,
        errors: result.errors || ['Transpilation failed']
      }
    }
  } catch (error) {
    // Fallback to simple transpiler
    try {
      const transpiler = new SimplePythonTranspiler()
      const solidity = transpiler.transpile(pythonCode)
      
      return {
        success: true,
        solidity
      }
    } catch (fallbackError) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Transpilation failed']
      }
    }
  }
}

class SimplePythonTranspiler {
  private contractName: string = 'Contract'
  private stateVars: Array<{ name: string; type: string; visibility: string }> = []
  private functions: Array<{ name: string; params: string; returns: string; visibility: string; body: string }> = []
  private events: Array<{ name: string; params: string }> = []
  
  transpile(pythonCode: string): string {
    // Parse Python code
    this.parsePython(pythonCode)
    
    // Generate Solidity
    return this.generateSolidity()
  }
  
  private parsePython(code: string) {
    const lines = code.split('\n')
    let inFunction = false
    let currentFunction: any = null
    let functionBody: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue
      
      // Parse class definition
      if (trimmed.startsWith('class ')) {
        const match = trimmed.match(/class\s+(\w+)/)
        if (match) {
          this.contractName = match[1]
        }
      }
      
      // Parse function definition
      else if (trimmed.startsWith('def ')) {
        if (inFunction && currentFunction) {
          currentFunction.body = functionBody.join('\n')
          this.functions.push(currentFunction)
          functionBody = []
        }
        
        currentFunction = this.parseFunction(trimmed)
        inFunction = true
      }
      
      // Parse state variables (in __init__)
      else if (trimmed.startsWith('self.') && trimmed.includes('=')) {
        const stateVar = this.parseStateVar(trimmed)
        if (stateVar) {
          this.stateVars.push(stateVar)
        }
      }
      
      // Collect function body
      else if (inFunction && line.startsWith('    ')) {
        functionBody.push(line.substring(4)) // Remove indentation
      }
    }
    
    // Add last function
    if (inFunction && currentFunction) {
      currentFunction.body = functionBody.join('\n')
      this.functions.push(currentFunction)
    }
  }
  
  private parseFunction(line: string): any {
    // Extract function name
    const nameMatch = line.match(/def\s+(\w+)\s*\(([^)]*)\)/)
    if (!nameMatch) return null
    
    const name = nameMatch[1]
    const paramsStr = nameMatch[2]
    
    // Skip __init__
    if (name === '__init__') return null
    
    // Parse parameters
    const params = this.parseParameters(paramsStr)
    
    // Extract return type
    const returnsMatch = line.match(/->\\s*(.+):/)
    const returns = returnsMatch ? this.pythonTypeToSolidity(returnsMatch[1].trim()) : ''
    
    return {
      name,
      params,
      returns,
      visibility: 'public',
      body: ''
    }
  }
  
  private parseParameters(paramsStr: string): string {
    if (!paramsStr || paramsStr === 'self') return ''
    
    const params = paramsStr.split(',')
      .map(p => p.trim())
      .filter(p => p !== 'self')
      .map(p => {
        // Parse "name: type" format
        if (p.includes(':')) {
          const [name, type] = p.split(':').map(s => s.trim())
          const solType = this.pythonTypeToSolidity(type)
          return `${solType} ${name}`
        }
        return `uint256 ${p}`
      })
    
    return params.join(', ')
  }
  
  private parseStateVar(line: string): any {
    const match = line.match(/self\.(\w+)\s*:\s*(\w+)\s*=/)
    if (!match) {
      // Try without type hint
      const simpleMatch = line.match(/self\.(\w+)\s*=\s*(.+)/)
      if (simpleMatch) {
        return {
          name: simpleMatch[1],
          type: this.inferType(simpleMatch[2]),
          visibility: 'public'
        }
      }
      return null
    }
    
    return {
      name: match[1],
      type: this.pythonTypeToSolidity(match[2]),
      visibility: 'public'
    }
  }
  
  private pythonTypeToSolidity(pyType: string): string {
    const typeMap: { [key: string]: string } = {
      'int': 'uint256',
      'str': 'string',
      'bool': 'bool',
      'address': 'address',
      'bytes': 'bytes',
      'uint256': 'uint256',
      'uint': 'uint256'
    }
    return typeMap[pyType] || 'uint256'
  }
  
  private inferType(value: string): string {
    value = value.trim()
    if (value === 'True' || value === 'False') return 'bool'
    if (value.startsWith('"') || value.startsWith("'")) return 'string'
    if (!isNaN(Number(value))) return 'uint256'
    return 'uint256'
  }
  
  private generateSolidity(): string {
    const lines: string[] = []
    
    // SPDX and pragma
    lines.push('// SPDX-License-Identifier: MIT')
    lines.push('pragma solidity ^0.8.20;')
    lines.push('')
    
    // OpenZeppelin imports
    lines.push('import "@openzeppelin/contracts/access/Ownable.sol";')
    lines.push('import "@openzeppelin/contracts/security/ReentrancyGuard.sol";')
    lines.push('import "@openzeppelin/contracts/security/Pausable.sol";')
    lines.push('')
    
    // Contract declaration
    lines.push(`/**`)
    lines.push(` * @title ${this.contractName}`)
    lines.push(` * @dev Transpiled from Python using PyVax`)
    lines.push(` */`)
    lines.push(`contract ${this.contractName} is Ownable, ReentrancyGuard, Pausable {`)
    lines.push('')
    
    // State variables
    if (this.stateVars.length > 0) {
      lines.push('    // State variables')
      this.stateVars.forEach(v => {
        lines.push(`    ${v.type} ${v.visibility} ${v.name};`)
      })
      lines.push('')
    }
    
    // Events
    lines.push('    // Events')
    lines.push('    event ValueChanged(uint256 indexed newValue);')
    lines.push('')
    
    // Constructor
    lines.push('    constructor() Ownable(msg.sender) {')
    this.stateVars.forEach(v => {
      if (v.type === 'uint256') {
        lines.push(`        ${v.name} = 0;`)
      }
    })
    lines.push('    }')
    lines.push('')
    
    // Functions
    if (this.functions.length > 0) {
      lines.push('    // Functions')
      this.functions.forEach(f => {
        if (!f) return
        
        const returnsStr = f.returns ? ` returns (${f.returns})` : ''
        lines.push(`    /**`)
        lines.push(`     * @dev ${f.name}`)
        lines.push(`     */`)
        lines.push(`    function ${f.name}(${f.params}) ${f.visibility}${returnsStr} {`)
        
        // Convert Python body to Solidity
        const solidityBody = this.convertBodyToSolidity(f.body, f.returns)
        lines.push(solidityBody)
        
        lines.push('    }')
        lines.push('')
      })
    }
    
    // Emergency functions
    lines.push('    // Emergency functions')
    lines.push('    function pause() external onlyOwner {')
    lines.push('        _pause();')
    lines.push('    }')
    lines.push('')
    lines.push('    function unpause() external onlyOwner {')
    lines.push('        _unpause();')
    lines.push('    }')
    
    lines.push('}')
    
    return lines.join('\n')
  }
  
  private convertBodyToSolidity(pythonBody: string, returnType: string): string {
    if (!pythonBody.trim()) {
      if (returnType) {
        return `        return 0; // TODO: Implement function logic`
      }
      return `        // TODO: Implement function logic`
    }
    
    const lines = pythonBody.split('\n')
    const solidityLines: string[] = []
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      
      // Convert self.var to var
      let converted = trimmed.replace(/self\./g, '')
      
      // Convert return statement
      if (converted.startsWith('return ')) {
        solidityLines.push(`        ${converted};`)
      }
      // Convert assignment
      else if (converted.includes('=')) {
        solidityLines.push(`        ${converted};`)
      }
      // Other statements
      else {
        solidityLines.push(`        ${converted};`)
      }
    })
    
    return solidityLines.join('\n') || '        // Function body'
  }
}

// Python contract templates
export const PYTHON_CONTRACT_TEMPLATE = `# PyVax Smart Contract
# Write Python code and transpile to Solidity

class SimpleStorage:
    """A simple storage contract"""
    
    def __init__(self):
        self.value: int = 0
        self.owner: address = msg.sender
    
    def store(self, new_value: int):
        """Store a new value"""
        self.value = new_value
    
    def retrieve(self) -> int:
        """Retrieve the stored value"""
        return self.value
`

export const PYTHON_TOKEN_TEMPLATE = `# PyVax ERC20 Token
class PyVaxToken:
    """ERC20 Token Implementation"""
    
    def __init__(self):
        self.name: str = "PyVax Token"
        self.symbol: str = "PVX"
        self.decimals: int = 18
        self.total_supply: int = 1000000
    
    def balance_of(self, account: address) -> int:
        """Get balance of account"""
        return 0
    
    def transfer(self, to: address, amount: int) -> bool:
        """Transfer tokens"""
        return True
`
