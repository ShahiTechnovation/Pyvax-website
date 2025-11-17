// Global type declarations for PyVax Unified

// MetaMask/Ethereum Provider
interface EthereumProvider {
  isMetaMask?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (args: any) => void) => void
  removeListener: (event: string, handler: (args: any) => void) => void
  selectedAddress: string | null
  chainId: string | null
}

interface Window {
  ethereum?: EthereumProvider
}

// Extend Navigator for Web3
interface Navigator {
  brave?: {
    isBrave: () => Promise<boolean>
  }
}
