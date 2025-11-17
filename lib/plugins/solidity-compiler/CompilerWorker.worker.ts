// Solidity Compiler Web Worker
// @ts-ignore
import * as solc from 'solc'

// Cache for loaded compiler versions
const compilerCache = new Map<string, any>()

self.addEventListener('message', async (e: MessageEvent) => {
  const { type, data } = e.data

  switch (type) {
    case 'COMPILE':
      await compileSolidity(data)
      break
    case 'LOAD_VERSION':
      await loadCompilerVersion(data.version)
      break
  }
})

async function loadCompilerVersion(version: string): Promise<void> {
  if (compilerCache.has(version)) {
    self.postMessage({
      type: 'VERSION_LOADED',
      version
    })
    return
  }

  try {
    self.postMessage({
      type: 'VERSION_LOADING',
      version
    })

    // Use the built-in solc compiler
    const compiler = solc
    compilerCache.set(version, compiler)

    self.postMessage({
      type: 'VERSION_LOADED',
      version
    })
  } catch (error: any) {
    self.postMessage({
      type: 'VERSION_LOAD_ERROR',
      error: error.message
    })
  }
}

async function compileSolidity(data: { source: string; fileName: string; version: string }): Promise<void> {
  try {
    let compiler = compilerCache.get(data.version)

    if (!compiler) {
      await loadCompilerVersion(data.version)
      compiler = compilerCache.get(data.version)
    }

    if (!compiler) {
      throw new Error('Compiler not loaded')
    }

    const input = {
      language: 'Solidity',
      sources: {
        [data.fileName]: {
          content: data.source
        }
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        outputSelection: {
          '*': {
            '*': [
              'abi',
              'evm.bytecode',
              'evm.deployedBytecode',
              'evm.gasEstimates',
              'metadata'
            ],
            '': ['ast']
          }
        }
      }
    }

    const output = JSON.parse(compiler.compile(JSON.stringify(input)))

    if (output.errors) {
      const errors = output.errors.filter((e: any) => e.severity === 'error')
      const warnings = output.errors.filter((e: any) => e.severity === 'warning')

      if (errors.length > 0) {
        self.postMessage({
          type: 'COMPILE_ERROR',
          errors,
          warnings
        })
        return
      }
    }

    // Extract compiled contracts
    const contracts = []
    for (const file in output.contracts) {
      for (const contractName in output.contracts[file]) {
        const contract = output.contracts[file][contractName]
        contracts.push({
          name: contractName,
          abi: contract.abi,
          bytecode: contract.evm.bytecode.object,
          deployedBytecode: contract.evm.deployedBytecode.object,
          gasEstimates: contract.evm.gasEstimates,
          metadata: contract.metadata
        })
      }
    }

    self.postMessage({
      type: 'COMPILE_SUCCESS',
      contracts,
      warnings: output.errors || []
    })

  } catch (error: any) {
    self.postMessage({
      type: 'COMPILE_ERROR',
      error: error.message
    })
  }
}

export {}
