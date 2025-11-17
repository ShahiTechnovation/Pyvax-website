"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Zap, Shield, Cpu, FileCode, Terminal, Rocket, BookOpen } from "lucide-react"

export function DocsContentNew() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">PyVax Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to building Python smart contracts for Avalanche C-Chain
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started with PyVax in 5 minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Open the Playground</h3>
            <p className="text-sm text-muted-foreground">
              Navigate to <code className="px-2 py-1 bg-muted rounded">/playground</code> to access the PyVax IDE
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">2. Write Your First Contract</h3>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code className="text-sm">{`class SimpleStorage(PySmartContract):
    """A simple storage contract"""
    
    def __init__(self):
        self.value: int = 0
        self.owner: address = self.msg_sender()
    
    @public_function
    def store(self, new_value: int):
        """Store a new value"""
        if self.msg_sender() == self.owner:
            self.value = new_value
    
    @view_function
    def retrieve(self) -> int:
        """Retrieve the stored value"""
        return self.value`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Transpile & Deploy</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click "Transpile" to convert Python to EVM bytecode</li>
              <li>Click "Connect Wallet" to connect MetaMask</li>
              <li>Click "Deploy" to deploy to Avalanche</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Main Documentation Tabs */}
      <Tabs defaultValue="python-syntax" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="python-syntax">Python Syntax</TabsTrigger>
          <TabsTrigger value="transpilation">Transpilation</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        {/* Python Syntax Tab */}
        <TabsContent value="python-syntax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Python Smart Contract Syntax
              </CardTitle>
              <CardDescription>Learn how to write smart contracts in Python</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contract Class */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Contract Class</h3>
                <p className="text-sm text-muted-foreground">
                  All contracts inherit from <code className="px-2 py-1 bg-muted rounded">PySmartContract</code>
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`class MyContract(PySmartContract):
    def __init__(self):
        super().__init__()
        # Initialize state variables`}</code>
                </pre>
              </div>

              {/* State Variables */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">State Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Define state variables with type hints in the constructor
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`def __init__(self):
    self.value: int = 0              # uint256
    self.owner: address = msg.sender  # address
    self.name: str = "MyToken"       # bytes32
    self.active: bool = True         # bool
    self.balances: dict = {}         # mapping(address => uint256)`}</code>
                </pre>
              </div>

              {/* Type Mapping */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Type Mapping</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded">
                    <p className="font-semibold text-sm">Python</p>
                    <code className="text-xs">int</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="font-semibold text-sm">Solidity/EVM</p>
                    <code className="text-xs">uint256</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <code className="text-xs">str</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <code className="text-xs">address or bytes32</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <code className="text-xs">bool</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <code className="text-xs">bool</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <code className="text-xs">dict</code>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <code className="text-xs">mapping</code>
                  </div>
                </div>
              </div>

              {/* Functions */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Functions</h3>
                <p className="text-sm text-muted-foreground">
                  Use decorators to define function visibility
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`@public_function
def transfer(self, to: address, amount: int):
    """Public function that modifies state"""
    self.balances[to] += amount

@view_function
def get_balance(self, user: address) -> int:
    """View function that reads state"""
    return self.balances.get(user, 0)`}</code>
                </pre>
              </div>

              {/* Control Flow */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Control Flow</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`@public_function
def conditional_transfer(self, to: address, amount: int):
    sender = self.msg_sender()
    
    if self.balances[sender] >= amount:
        self.balances[sender] -= amount
        self.balances[to] += amount
    else:
        # Transaction will revert
        pass`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transpilation Tab */}
        <TabsContent value="transpilation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Python to EVM Transpilation
              </CardTitle>
              <CardDescription>How PyVax converts Python to EVM bytecode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Transpilation Process</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold">AST Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Parse Python code and extract contract components (state variables, functions, events)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold">Type Inference</p>
                      <p className="text-sm text-muted-foreground">
                        Convert Python types to EVM types (int → uint256, dict → mapping)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold">Bytecode Generation</p>
                      <p className="text-sm text-muted-foreground">
                        Generate EVM opcodes (PUSH, SLOAD, SSTORE, JUMP, etc.)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-semibold">ABI Generation</p>
                      <p className="text-sm text-muted-foreground">
                        Create JSON ABI for contract interaction
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Output</h3>
                <p className="text-sm text-muted-foreground">
                  The transpiler generates three outputs:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>EVM Bytecode:</strong> Deployable contract bytecode (0x608060...)</li>
                  <li><strong>ABI:</strong> JSON interface for contract interaction</li>
                  <li><strong>Solidity Code:</strong> Equivalent Solidity code for reference</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">API Endpoint</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`POST /api/transpile

Request:
{
  "source": "Python contract code",
  "contractName": "MyContract"
}

Response:
{
  "success": true,
  "bytecode": "0x608060405...",
  "abi": [...],
  "solidity": "contract MyContract { ... }",
  "metadata": {
    "compiler": "python-evm-transpiler",
    "version": "0.1.0",
    "gas_estimate": 50000
  }
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Tab */}
        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Deploying to Avalanche
              </CardTitle>
              <CardDescription>Deploy your Python contracts to Avalanche C-Chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>MetaMask wallet installed</li>
                  <li>AVAX tokens for gas fees</li>
                  <li>Compiled contract (bytecode + ABI)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Supported Networks</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-semibold">Avalanche Mainnet</p>
                    <p className="text-xs text-muted-foreground mt-1">Chain ID: 43114</p>
                    <p className="text-xs text-muted-foreground">RPC: https://api.avax.network/ext/bc/C/rpc</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-semibold">Fuji Testnet</p>
                    <p className="text-xs text-muted-foreground mt-1">Chain ID: 43113</p>
                    <p className="text-xs text-muted-foreground">RPC: https://api.avax-test.network/ext/bc/C/rpc</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Deployment Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold">Connect Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        Click "Connect Wallet" and approve MetaMask connection
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold">Select Network</p>
                      <p className="text-sm text-muted-foreground">
                        Choose Avalanche Mainnet or Fuji Testnet
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold">Deploy Contract</p>
                      <p className="text-sm text-muted-foreground">
                        Click "Deploy" and confirm transaction in MetaMask
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-semibold">Verify on Snowtrace</p>
                      <p className="text-sm text-muted-foreground">
                        View your deployed contract on Snowtrace explorer
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Gas Estimation</h3>
                <p className="text-sm text-muted-foreground">
                  PyVax automatically estimates gas costs before deployment:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Simple contracts: ~85,000 gas (~0.002 AVAX)</li>
                  <li>Token contracts: ~150,000 gas (~0.004 AVAX)</li>
                  <li>Complex DeFi: ~300,000 gas (~0.008 AVAX)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                API Reference
              </CardTitle>
              <CardDescription>PyVax API endpoints and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transpile API */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">POST /api/transpile</h3>
                <p className="text-sm text-muted-foreground">
                  Transpile Python smart contract to EVM bytecode
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`// Request
{
  "source": "class SimpleStorage(PySmartContract): ...",
  "contractName": "SimpleStorage"
}

// Response
{
  "success": true,
  "bytecode": "0x608060405...",
  "abi": [
    {
      "type": "function",
      "name": "store",
      "inputs": [{"name": "new_value", "type": "uint256"}],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ],
  "metadata": {
    "compiler": "python-evm-transpiler",
    "version": "0.1.0",
    "gas_estimate": 50000
  }
}`}</code>
                </pre>
              </div>

              {/* Compile API */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">POST /api/compile</h3>
                <p className="text-sm text-muted-foreground">
                  Compile Solidity smart contract
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`// Request
{
  "source": "contract SimpleStorage { ... }",
  "contractName": "SimpleStorage"
}

// Response
{
  "success": true,
  "contracts": {
    "SimpleStorage": {
      "abi": [...],
      "bytecode": "0x608060405...",
      "deployedBytecode": "0x608060405...",
      "gasEstimates": {}
    }
  }
}`}</code>
                </pre>
              </div>

              {/* Error Handling */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Error Handling</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className="text-sm">{`// Error Response
{
  "success": false,
  "errors": [
    {
      "severity": "error",
      "message": "Syntax error on line 5",
      "formattedMessage": "Expected ':' after function definition"
    }
  ]
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Example Contracts
          </CardTitle>
          <CardDescription>Ready-to-use Python smart contract templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Simple Storage</h4>
              <p className="text-sm text-muted-foreground">
                Basic contract for storing and retrieving a value
              </p>
              <code className="text-xs text-primary">SimpleStorage.py</code>
            </div>
            
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">ERC20 Token</h4>
              <p className="text-sm text-muted-foreground">
                Standard fungible token implementation
              </p>
              <code className="text-xs text-primary">ERC20Token.py</code>
            </div>
            
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">DeFi Staking</h4>
              <p className="text-sm text-muted-foreground">
                Staking contract with rewards
              </p>
              <code className="text-xs text-primary">StakingContract.py</code>
            </div>
            
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">NFT Collection</h4>
              <p className="text-sm text-muted-foreground">
                ERC721 NFT with minting functionality
              </p>
              <code className="text-xs text-primary">NFTCollection.py</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Best Practices
          </CardTitle>
          <CardDescription>Security and optimization guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Security</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Always validate user inputs</li>
                <li>Use access control for sensitive functions</li>
                <li>Check balances before transfers</li>
                <li>Emit events for important state changes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Gas Optimization</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Minimize storage operations (SSTORE is expensive)</li>
                <li>Use view functions for read-only operations</li>
                <li>Batch operations when possible</li>
                <li>Avoid loops over large datasets</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Code Quality</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Add docstrings to all functions</li>
                <li>Use descriptive variable names</li>
                <li>Keep functions small and focused</li>
                <li>Test thoroughly before deployment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
