'use client'

import { useState, useEffect } from 'react'
import { Play, Save, Download, Upload, Code2, Zap, Loader2, FileCode, Terminal, Settings, ExternalLink, Code, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Editor from '@monaco-editor/react'
import { ethers } from 'ethers'
import { ElizaAgentAssistant } from './eliza-agent-assistant'
import { transpilePythonToSolidity, PYTHON_CONTRACT_TEMPLATE } from '@/lib/simple-python-transpiler'
import { compileSolidity, AVALANCHE_CONTRACT_TEMPLATE, AVALANCHE_CONFIG } from '@/lib/solidity-compiler'
import { FileSystem } from '@/lib/indexeddb-filesystem'
import { compilePythonNative, checkCompilerStatus } from '@/lib/python-native-compiler'
import { smartCompile, warmupBrowserCompiler } from '@/lib/smart-compiler'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

declare global {
  interface Window {
    ethereum?: any
  }
}

type Language = 'python' | 'solidity'
type CompilerMode = 'native' | 'transpile'

export function UnifiedIDE() {
  const [language, setLanguage] = useState<Language>('python')
  const [compilerMode, setCompilerMode] = useState<CompilerMode>('native')
  const [pythonCode, setPythonCode] = useState(PYTHON_CONTRACT_TEMPLATE)
  const [solidityCode, setSolidityCode] = useState(AVALANCHE_CONTRACT_TEMPLATE)
  const [isTranspiling, setIsTranspiling] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [compiledContract, setCompiledContract] = useState<any>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>('Not connected')
  const [balance, setBalance] = useState<string>('0')
  const [compilerStatus, setCompilerStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const [browserCompilerReady, setBrowserCompilerReady] = useState(false)
  const [browserCompilerInitializing, setBrowserCompilerInitializing] = useState(false)
  const [deployedContract, setDeployedContract] = useState<{address: string, abi: any[]} | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<string>('')
  const [functionArgs, setFunctionArgs] = useState<{[key: string]: string}>({})
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)

  useEffect(() => {
    checkWalletConnection()
    loadFromIndexedDB()
    checkPythonCompiler()
    initBrowserCompiler()
  }, [])

  const initBrowserCompiler = async () => {
    setBrowserCompilerInitializing(true)
    addLog('🔄 Initializing browser compiler...', 'info')
    
    try {
      await warmupBrowserCompiler()
      setBrowserCompilerReady(true)
      setBrowserCompilerInitializing(false)
      addLog('✓ Browser compiler ready! (Pyodide loaded)', 'success')
      addLog('ℹ You can now compile Python without a server!', 'info')
    } catch (error: any) {
      setBrowserCompilerInitializing(false)
      addLog('⚠ Browser compiler initialization failed', 'warning')
      addLog('ℹ Falling back to transpiler mode', 'info')
    }
  }

  const checkPythonCompiler = async () => {
    try {
      const status = await checkCompilerStatus()
      setCompilerStatus(status.available ? 'available' : 'unavailable')
      if (status.available) {
        addLog('Python native compiler is available', 'success')
      } else {
        addLog('Python native compiler is not available. Using transpiler mode.', 'warning')
        setCompilerMode('transpile')
      }
    } catch (error) {
      setCompilerStatus('unavailable')
      setCompilerMode('transpile')
    }
  }

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'
    setConsoleOutput(prev => [...prev, `[${timestamp}] ${prefix} ${message}`])
  }

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setAccount(address)
          
          const network = await provider.getNetwork()
          setNetwork(network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name)
          
          const balance = await provider.getBalance(address)
          setBalance(ethers.formatEther(balance))
          
          addLog(`Connected to ${address.slice(0, 6)}...${address.slice(-4)}`, 'success')
        }
      } catch (error) {
        console.error('Wallet check error:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      addLog('Please install MetaMask!', 'error')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      await checkWalletConnection()
    } catch (error: any) {
      addLog(`Wallet connection failed: ${error.message}`, 'error')
    }
  }

  const switchToAvalanche = async () => {
    if (typeof window.ethereum === 'undefined') {
      addLog('Please install MetaMask!', 'error')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa869' }], // Avalanche Fuji Testnet
      })
      addLog('Switched to Avalanche Fuji Testnet', 'success')
      await checkWalletConnection()
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xa869',
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
              },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.snowtrace.io/']
            }]
          })
          addLog('Added Avalanche Fuji Testnet', 'success')
        } catch (addError) {
          addLog('Failed to add Avalanche network', 'error')
        }
      } else {
        addLog(`Failed to switch network: ${error.message}`, 'error')
      }
    }
  }

  const compilePythonContract = async () => {
    if (compilerMode === 'native') {
      await compilePythonNativeMode()
    } else {
      await transpilePythonMode()
    }
  }

  const compilePythonNativeMode = async () => {
    setIsCompiling(true)
    addLog('🚀 Compiling Python contract...', 'info')

    try {
      // Use smart compiler - automatically picks best method
      const result = await smartCompile(pythonCode, 'auto')
      
      if (result.success && result.bytecode && result.abi) {
        setCompiledContract({
          bytecode: result.bytecode,
          abi: result.abi,
          metadata: result.metadata
        })
        
        // Show compiler mode used
        const compilerName = result.mode === 'browser' 
          ? '🌐 Browser Compiler (Pyodide)'
          : result.mode === 'api'
          ? '🔌 API Compiler'
          : '⚡ Transpiler'
        
        addLog('✓ Compilation successful!', 'success')
        addLog(`Compiler: ${compilerName}`, 'info')
        addLog(`Mode: ${result.mode}`, 'info')
        addLog(`Bytecode size: ${result.bytecode.length / 2} bytes`, 'info')
        
        if (result.mode === 'browser') {
          addLog('ℹ Compiled entirely in your browser!', 'info')
        }
      } else {
        addLog('✗ Compilation failed', 'error')
        result.errors?.forEach(err => addLog(err, 'error'))
      }
    } catch (error: any) {
      addLog(`Compilation error: ${error.message}`, 'error')
    } finally {
      setIsCompiling(false)
    }
  }

  const transpilePythonMode = async () => {
    setIsTranspiling(true)
    addLog('Transpiling Python to Solidity...', 'info')

    try {
      const result = await transpilePythonToSolidity(pythonCode)
      
      if (result.success && result.solidity) {
        setSolidityCode(result.solidity)
        setLanguage('solidity')
        addLog('✓ Transpilation successful!', 'success')
        
        // Save to IndexedDB
        await FileSystem.saveFile({
          name: 'transpiled.sol',
          path: '/contracts/transpiled.sol',
          content: result.solidity,
          language: 'solidity'
        })
        
        // Auto-compile the Solidity
        await compileContract()
      } else {
        addLog('✗ Transpilation failed', 'error')
        result.errors?.forEach((err: string) => addLog(err, 'error'))
      }
    } catch (error: any) {
      addLog(`Transpilation error: ${error.message}`, 'error')
    } finally {
      setIsTranspiling(false)
    }
  }

  const compileContract = async () => {
    setIsCompiling(true)
    addLog('Compiling Solidity contract...', 'info')

    try {
      const result = await compileSolidity(solidityCode, 'Contract')

      if (result.success && result.contracts) {
        const contractName = Object.keys(result.contracts)[0]
        const contract = result.contracts[contractName]
        
        setCompiledContract(contract)
        addLog('✓ Compilation successful!', 'success')
        addLog(`Contract: ${contractName}`, 'info')
        addLog(`Bytecode size: ${contract.bytecode.length / 2} bytes`, 'info')
        
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => {
            addLog(err.message, 'warning')
          })
        }
      } else {
        addLog('✗ Compilation failed', 'error')
        result.errors?.forEach(err => {
          addLog(err.message, 'error')
        })
      }
    } catch (error: any) {
      addLog(`Compilation error: ${error.message}`, 'error')
    } finally {
      setIsCompiling(false)
    }
  }

  const deployContract = async () => {
    if (!compiledContract) {
      addLog('Please compile the contract first', 'error')
      return
    }

    if (!account) {
      addLog('Please connect your wallet first', 'error')
      return
    }

    // Validate bytecode
    // For mock compilation we only require non-empty hex bytecode.
    // Very small contracts (like 0x00) are allowed so we can test the full
    // deployment flow even with minimal bytecode.
    if (!compiledContract.bytecode || compiledContract.bytecode === '0x') {
      addLog('Invalid bytecode generated', 'error')
      addLog('This usually means the contract is too simple or has compilation errors', 'error')
      addLog('Try adding a constructor with state variables', 'info')
      return
    }

    setIsDeploying(true)
    addLog('Deploying contract to Avalanche...', 'info')

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Check if bytecode is valid
      addLog(`📦 Bytecode size: ${(compiledContract.bytecode.length / 2 - 1)} bytes`, 'info')
      
      if ((compiledContract.bytecode.length / 2 - 1) < 50) {
        addLog('⚠️ Warning: Bytecode is very small, deployment might fail', 'info')
      }

      const factory = new ethers.ContractFactory(
        compiledContract.abi,
        compiledContract.bytecode,
        signer
      )

      addLog('Estimating gas...', 'info')
      try {
        const deploymentData = factory.interface.encodeDeploy([])
        const gasEstimate = await provider.estimateGas({
          from: account,
          data: compiledContract.bytecode,
        })
        addLog(`⛽ Estimated gas: ${gasEstimate.toString()}`, 'info')
      } catch (gasError: any) {
        addLog('⚠️ Gas estimation failed - contract might be invalid', 'error')
        addLog(`Error: ${gasError.message}`, 'error')
        
        if (gasError.message.includes('missing revert data') || gasError.message.includes('CALL_EXCEPTION')) {
          addLog('', 'info')
          addLog('💡 This error usually means:', 'info')
          addLog('1. Contract bytecode is invalid or incomplete', 'info')
          addLog('2. Constructor is failing immediately', 'info')
          addLog('3. Contract needs a proper constructor', 'info')
          addLog('', 'info')
          addLog('✅ Try this:', 'info')
          addLog('- Add __init__ method with self.owner = msg.sender', 'info')
          addLog('- Add at least one state variable', 'info')
          addLog('- Use a complete contract template', 'info')
        }
        
        setIsDeploying(false)
        return
      }

      addLog('Sending deployment transaction...', 'info')
      const contract = await factory.deploy()
      
      addLog('Waiting for confirmation...', 'info')
      await contract.waitForDeployment()
      
      const address = await contract.getAddress()
      const deployTx = contract.deploymentTransaction()

      addLog(`✓ Contract deployed at: ${address}`, 'success')
      addLog(`Transaction hash: ${deployTx?.hash}`, 'info')
      addLog(`View on Snowtrace: https://testnet.snowtrace.io/address/${address}`, 'info')
      
      // Save deployed contract for interaction
      setDeployedContract({
        address,
        abi: compiledContract.abi
      })

      // Auto-verify contract
      if (language === 'python') {
        addLog('Auto-verifying contract...', 'info')
        await autoVerifyContract(address, pythonCode)
      }
    } catch (error: any) {
      addLog(`❌ Deployment failed: ${error.message}`, 'error')
      
      if (error.message.includes('user rejected')) {
        addLog('Transaction was rejected in MetaMask', 'info')
      } else if (error.message.includes('insufficient funds')) {
        addLog('Insufficient AVAX balance for deployment', 'error')
        addLog('Get testnet AVAX from: https://faucet.avax.network/', 'info')
      }
    } finally {
      setIsDeploying(false)
    }
  }

  const saveToIndexedDB = async () => {
    try {
      await FileSystem.saveFile({
        name: language === 'python' ? 'contract.py' : 'contract.sol',
        path: language === 'python' ? '/contracts/contract.py' : '/contracts/contract.sol',
        content: language === 'python' ? pythonCode : solidityCode,
        language
      })
      addLog('Saved to IndexedDB', 'success')
    } catch (error: any) {
      addLog(`Save error: ${error.message}`, 'error')
    }
  }

  const loadFromIndexedDB = async () => {
    try {
      const files = await FileSystem.getAllFiles()
      if (files.length > 0) {
        addLog(`Loaded ${files.length} files from IndexedDB`, 'info')
      }
    } catch (error: any) {
      console.error('Load error:', error)
    }
  }

  const autoVerifyContract = async (address: string, sourceCode: string) => {
    try {
      addLog(`🔍 Starting auto-verification...`, 'info')
      
      // Extract contract name from source code
      const contractNameMatch = sourceCode.match(/class\s+(\w+)/)
      const contractName = contractNameMatch ? contractNameMatch[1] : 'Contract'
      
      // Get network from current connection (default to fuji)
      let currentNetwork = 'fuji'
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const network = await provider.getNetwork()
          if (network.chainId === BigInt(43114)) currentNetwork = 'mainnet'
          else if (network.chainId === BigInt(43113)) currentNetwork = 'fuji'
        }
      } catch (e) {
        // Use default fuji
      }
      
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          network: currentNetwork,
          pythonSource: sourceCode,
          contractName: contractName,
          compilerVersion: 'pyvax-transpiler-2.0.0',
          abi: compiledContract?.abi || [],
          bytecode: compiledContract?.bytecode || '0x'
        })
      })

      const result = await response.json()
      
      console.log('[Auto-Verify] Result:', result)
      console.log('[Auto-Verify] Full details:', JSON.stringify(result, null, 2))

      if (result.success && result.verified) {
        addLog(`✓ Contract verified successfully!`, 'success')
        addLog(`📝 Python source saved`, 'success')
        addLog(`🎯 Read/Write functions enabled`, 'success')
      } else {
        addLog(`⚠ Verification failed: ${result.message}`, 'error')
        if (result.errors && result.errors.length > 0) {
          addLog(`Errors:`, 'error')
          result.errors.forEach((err: string, idx: number) => {
            addLog(`  ${idx + 1}. ${err}`, 'error')
          })
        }
      }
      
      // Always show explorer link
      addLog(`📊 View on PyVax Explorer: ${window.location.origin}/explorer/${address}?network=fuji`, 'info')
    } catch (error: any) {
      console.error('[Auto-Verify] Error:', error)
      addLog(`❌ Verification error: ${error.message}`, 'error')
      addLog(`📊 Explorer: ${window.location.origin}/explorer/${address}?network=fuji`, 'info')
    }
  }

  const callContractFunction = async (functionName: string, isView: boolean) => {
    if (!deployedContract || !account) {
      addLog('Contract not deployed or wallet not connected', 'error')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const contract = new ethers.Contract(
        deployedContract.address,
        deployedContract.abi,
        isView ? provider : signer
      )

      // Get function from ABI
      const funcAbi = deployedContract.abi.find((f: any) => f.type === 'function' && f.name === functionName)
      if (!funcAbi) {
        addLog(`Function ${functionName} not found`, 'error')
        return
      }

      // Parse arguments
      const args = funcAbi.inputs.map((input: any) => {
        const value = functionArgs[input.name] || ''
        if (input.type.includes('int')) {
          return value || '0'
        }
        return value
      })

      if (isView) {
        // Call view function
        addLog(`Calling ${functionName}...`, 'info')
        const result = await contract[functionName](...args)
        addLog(`✓ Result: ${result.toString()}`, 'success')
      } else {
        // Send transaction
        addLog(`Sending transaction to ${functionName}...`, 'info')
        const tx = await contract[functionName](...args)
        addLog(`Transaction sent: ${tx.hash}`, 'info')
        addLog('Waiting for confirmation...', 'info')
        const receipt = await tx.wait()
        addLog(`✓ Transaction confirmed in block ${receipt.blockNumber}`, 'success')
        addLog(`Gas used: ${receipt.gasUsed.toString()}`, 'info')
      }
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error')
    }
  }

  const currentCode = language === 'python' ? pythonCode : solidityCode
  const setCurrentCode = language === 'python' ? setPythonCode : setSolidityCode

  return (
    <>
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl shadow-blue-500/10">
        {/* Animated Gradient Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 animate-gradient-x"></div>
          <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-b from-slate-900/80 to-slate-900/95 backdrop-blur-sm border-b border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-blue-400/30"></div>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-inter">
                PyVax IDE
              </h2>
            
              {/* Language Selector */}
              <div className="flex gap-2 bg-slate-900/50 rounded-xl p-1.5 border border-slate-700/50">
                <Button
                  size="sm"
                  onClick={() => setLanguage('python')}
                  className={`h-9 px-4 rounded-lg font-medium transition-all duration-300 ${
                    language === 'python'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70'
                      : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  🐍 Python
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLanguage('solidity')}
                  className={`h-9 px-4 rounded-lg font-medium transition-all duration-300 ${
                    language === 'solidity'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70'
                      : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  💎 Solidity
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
            {/* Compiler Mode Selector (for Python) */}
            {language === 'python' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Compiler:</span>
                  <Select value={compilerMode} onValueChange={(value) => setCompilerMode(value as CompilerMode)}>
                    <SelectTrigger className="w-[140px] h-8 bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="native">
                        <div className="flex items-center gap-2">
                          <span>Native</span>
                          {compilerStatus === 'available' && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">✓</Badge>
                          )}
                          {compilerStatus === 'unavailable' && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">✗</Badge>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="transpile">Transpile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Browser Compiler Status */}
                {browserCompilerInitializing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                    <span className="text-xs text-yellow-300">Loading Pyodide...</span>
                  </div>
                )}
                {browserCompilerReady && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-300">Browser Ready</span>
                  </div>
                )}
              </>
            )}
            
            {/* Wallet Status */}
            {account ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-300">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-300">{balance.slice(0, 6)} AVAX</span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Connect Wallet
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={switchToAvalanche}
              className="bg-red-600 hover:bg-red-700 border-red-500 text-white"
            >
              🔺 Avalanche
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={saveToIndexedDB}
              className="bg-slate-700 border-slate-600"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>

            {language === 'python' && (
              <Button
                size="sm"
                onClick={compilePythonContract}
                disabled={isTranspiling || isCompiling}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {(isTranspiling || isCompiling) ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-1" />
                )}
                {compilerMode === 'native' ? 'Compile (Native)' : 'Transpile & Compile'}
              </Button>
            )}

            {language === 'solidity' && (
              <Button
                size="sm"
                onClick={compileContract}
                disabled={isCompiling}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isCompiling ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-1" />
                )}
                Compile
              </Button>
            )}

            <Button
              size="sm"
              onClick={deployContract}
              disabled={isDeploying || !compiledContract}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDeploying ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Deploy
            </Button>
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : 'sol'}
              value={currentCode}
              onChange={(value) => setCurrentCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Console */}
          <div className="w-96 border-l border-slate-700 flex flex-col bg-slate-800">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-white">Console</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConsoleOutput([])}
                className="h-7 text-slate-400"
              >
                Clear
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 space-y-1">
              {consoleOutput.length === 0 ? (
                <p className="text-slate-500">Console output will appear here...</p>
              ) : (
                consoleOutput.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('✓') ? 'text-green-400' :
                      log.includes('✗') ? 'text-red-400' :
                      log.includes('⚠') ? 'text-yellow-400' :
                      'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Contract Interaction Panel */}
        {deployedContract && (
          <div className="border-t border-slate-700 bg-slate-800 p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-sm font-semibold text-white">Contract Deployed Successfully!</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeployedContract(null)}
                  className="text-slate-400 hover:text-white"
                  title="Close interaction panel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Contract Address */}
              <div className="bg-slate-900 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1">Contract Address</p>
                    <code className="text-sm text-green-400 font-mono select-all break-all">{deployedContract.address}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(deployedContract.address)
                      addLog('Address copied to clipboard', 'info')
                    }}
                    className="bg-slate-800 border-slate-600 hover:bg-slate-700 ml-2"
                  >
                    Copy
                  </Button>
                </div>
                
                {/* ABI Section */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-400">Contract ABI ({deployedContract.abi.length} functions)</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(deployedContract.abi, null, 2))
                          addLog('ABI copied to clipboard', 'success')
                        }}
                        className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-xs h-7"
                      >
                        <FileCode className="w-3 h-3 mr-1" />
                        Copy ABI
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(deployedContract.abi, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `contract-abi-${deployedContract.address.slice(0, 10)}.json`
                          a.click()
                          URL.revokeObjectURL(url)
                          addLog('ABI downloaded', 'success')
                        }}
                        className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-xs h-7"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* ABI Preview */}
                  <details className="mt-2">
                    <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                      View ABI JSON
                    </summary>
                    <pre className="mt-2 p-2 bg-slate-950 rounded text-xs overflow-auto max-h-40 border border-slate-800">
                      <code className="text-blue-300">{JSON.stringify(deployedContract.abi, null, 2)}</code>
                    </pre>
                  </details>
                </div>
                
                {/* Explorer Links */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
                  <a
                    href={`https://testnet.snowtrace.io/address/${deployedContract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Snowtrace
                  </a>
                  <span className="text-slate-600">|</span>
                  <a
                    href={`/explorer/${deployedContract.address}?network=fuji`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Code className="w-3 h-3" />
                    PyVax Explorer
                  </a>
                </div>
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-white mb-3">Interact with Contract</h4>
            <div className="space-y-3">
              {deployedContract.abi
                .filter((item: any) => item.type === 'function')
                .map((func: any, idx: number) => {
                  const isView = func.stateMutability === 'view' || func.stateMutability === 'pure'
                  return (
                    <div key={idx} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{func.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isView ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {isView ? 'view' : 'write'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => callContractFunction(func.name, isView)}
                          className={isView ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}
                        >
                          {isView ? 'Call' : 'Send'}
                        </Button>
                      </div>
                      
                      {func.inputs.length > 0 && (
                        <div className="space-y-2">
                          {func.inputs.map((input: any, inputIdx: number) => (
                            <input
                              key={inputIdx}
                              type="text"
                              placeholder={`${input.name} (${input.type})`}
                              value={functionArgs[input.name] || ''}
                              onChange={(e) => setFunctionArgs({...functionArgs, [input.name]: e.target.value})}
                              className="w-full px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
      
      {/* Eliza AI Agent */}
      <ElizaAgentAssistant currentCode={currentCode} />
    </>
  )
}
