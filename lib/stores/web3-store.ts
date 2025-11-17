/**
 * Web3 Store - Wallet connection, contract management, and blockchain interactions
 * Integrates with existing PyVax Web3 functionality
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

export interface WalletState {
  address: string | null
  chainId: number | null
  balance: string | null
  isConnected: boolean
  isConnecting: boolean
}

export interface Contract {
  address: string
  name: string
  abi: any[]
  bytecode?: string
  network: string
  deployedAt: number
  verified?: boolean
}

export interface Transaction {
  hash: string
  from: string
  to?: string
  value: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  type: 'deployment' | 'interaction' | 'transfer'
}

export interface Web3State {
  // Wallet
  wallet: WalletState
  
  // Contracts
  contracts: Contract[]
  selectedContract: string | null
  
  // Transactions
  transactions: Transaction[]
  pendingTxCount: number
  
  // Network
  currentNetwork: 'mainnet' | 'fuji' | 'local'
  rpcUrl: string
  
  // Compilation
  isCompiling: boolean
  compilationResult: {
    abi?: any[]
    bytecode?: string
    solidity?: string
    errors?: string[]
  } | null
  
  // Actions - Wallet
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  updateBalance: (balance: string) => void
  switchNetwork: (chainId: number) => Promise<void>
  
  // Actions - Contracts
  addContract: (contract: Omit<Contract, 'deployedAt'>) => void
  removeContract: (address: string) => void
  selectContract: (address: string) => void
  updateContractVerification: (address: string, verified: boolean) => void
  
  // Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'timestamp' | 'status'>) => void
  updateTransactionStatus: (hash: string, status: Transaction['status']) => void
  clearTransactions: () => void
  
  // Actions - Network
  setNetwork: (network: 'mainnet' | 'fuji' | 'local') => void
  setRpcUrl: (url: string) => void
  
  // Actions - Compilation
  setCompiling: (isCompiling: boolean) => void
  setCompilationResult: (result: Web3State['compilationResult']) => void
  clearCompilationResult: () => void
}

export const useWeb3Store = create<Web3State>()(
  persist(
    immer((set, get) => ({
      // Initial State
      wallet: {
        address: null,
        chainId: null,
        balance: null,
        isConnected: false,
        isConnecting: false,
      },
      contracts: [],
      selectedContract: null,
      transactions: [],
      pendingTxCount: 0,
      currentNetwork: 'fuji',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      isCompiling: false,
      compilationResult: null,

      // Wallet Actions
      connectWallet: async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('MetaMask not installed')
        }

        set((state) => {
          state.wallet.isConnecting = true
        })

        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          
          const chainId = await window.ethereum.request({
            method: 'eth_chainId',
          })

          set((state) => {
            state.wallet.address = accounts[0]
            state.wallet.chainId = parseInt(chainId, 16)
            state.wallet.isConnected = true
            state.wallet.isConnecting = false
          })

          // Fetch balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'],
          })
          
          get().updateBalance(balance)

          // Setup listeners
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
              get().disconnectWallet()
            } else {
              set((state) => {
                state.wallet.address = accounts[0]
              })
            }
          })

          window.ethereum.on('chainChanged', (chainId: string) => {
            set((state) => {
              state.wallet.chainId = parseInt(chainId, 16)
            })
            window.location.reload()
          })
        } catch (error) {
          set((state) => {
            state.wallet.isConnecting = false
          })
          throw error
        }
      },

      disconnectWallet: () => {
        set((state) => {
          state.wallet = {
            address: null,
            chainId: null,
            balance: null,
            isConnected: false,
            isConnecting: false,
          }
        })
      },

      updateBalance: (balance) => {
        set((state) => {
          state.wallet.balance = balance
        })
      },

      switchNetwork: async (chainId) => {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('MetaMask not installed')
        }

        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          })
          
          set((state) => {
            state.wallet.chainId = chainId
          })
        } catch (error: any) {
          // Chain not added, attempt to add it
          if (error.code === 4902) {
            // Add Avalanche network params here
            throw new Error('Network not added to MetaMask')
          }
          throw error
        }
      },

      // Contract Actions
      addContract: (contract) => {
        set((state) => {
          state.contracts.push({
            ...contract,
            deployedAt: Date.now(),
          })
        })
      },

      removeContract: (address) => {
        set((state) => {
          state.contracts = state.contracts.filter((c) => c.address !== address)
          
          if (state.selectedContract === address) {
            state.selectedContract = null
          }
        })
      },

      selectContract: (address) => {
        set((state) => {
          state.selectedContract = address
        })
      },

      updateContractVerification: (address, verified) => {
        set((state) => {
          const contract = state.contracts.find((c) => c.address === address)
          if (contract) {
            contract.verified = verified
          }
        })
      },

      // Transaction Actions
      addTransaction: (tx) => {
        set((state) => {
          state.transactions.unshift({
            ...tx,
            timestamp: Date.now(),
            status: 'pending',
          })
          state.pendingTxCount++
        })
      },

      updateTransactionStatus: (hash, status) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.hash === hash)
          if (tx && tx.status === 'pending' && status !== 'pending') {
            state.pendingTxCount = Math.max(0, state.pendingTxCount - 1)
          }
          if (tx) {
            tx.status = status
          }
        })
      },

      clearTransactions: () => {
        set((state) => {
          state.transactions = []
          state.pendingTxCount = 0
        })
      },

      // Network Actions
      setNetwork: (network) => {
        const rpcUrls = {
          mainnet: 'https://api.avax.network/ext/bc/C/rpc',
          fuji: 'https://api.avax-test.network/ext/bc/C/rpc',
          local: 'http://localhost:8545',
        }
        
        set((state) => {
          state.currentNetwork = network
          state.rpcUrl = rpcUrls[network]
        })
      },

      setRpcUrl: (url) => {
        set((state) => {
          state.rpcUrl = url
        })
      },

      // Compilation Actions
      setCompiling: (isCompiling) => {
        set((state) => {
          state.isCompiling = isCompiling
        })
      },

      setCompilationResult: (result) => {
        set((state) => {
          state.compilationResult = result
          state.isCompiling = false
        })
      },

      clearCompilationResult: () => {
        set((state) => {
          state.compilationResult = null
        })
      },
    })),
    {
      name: 'pyvax-web3-store',
      partialize: (state) => ({
        contracts: state.contracts,
        currentNetwork: state.currentNetwork,
        rpcUrl: state.rpcUrl,
      }),
    }
  )
)

// Selector hooks
export const useWallet = () => useWeb3Store((state) => state.wallet)
export const useContracts = () => useWeb3Store((state) => state.contracts)
export const useSelectedContract = () => useWeb3Store((state) => {
  const { selectedContract, contracts } = state
  return selectedContract ? contracts.find((c) => c.address === selectedContract) : null
})
export const usePendingTransactions = () => useWeb3Store((state) => 
  state.transactions.filter((tx) => tx.status === 'pending')
)
export const useCompilation = () => useWeb3Store((state) => ({
  isCompiling: state.isCompiling,
  result: state.compilationResult,
}))
