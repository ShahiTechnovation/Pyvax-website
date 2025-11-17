// Solidity Compiler Integration (Browser-compatible)

export interface CompilationResult {
  success: boolean
  contracts?: {
    [key: string]: {
      abi: any[]
      bytecode: string
      deployedBytecode: string
      gasEstimates?: any
    }
  }
  errors?: Array<{
    severity: 'error' | 'warning'
    message: string
    formattedMessage: string
  }>
}

export async function compileSolidity(
  source: string,
  contractName: string = 'Contract'
): Promise<CompilationResult> {
  try {
    // Use browser-compatible compilation via API
    const response = await fetch('/api/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source,
        contractName
      })
    })

    if (!response.ok) {
      throw new Error('Compilation request failed')
    }

    const output = await response.json()

    // Return the API response directly
    return output
  } catch (error) {
    return {
      success: false,
      errors: [{
        severity: 'error',
        message: error instanceof Error ? error.message : 'Compilation failed',
        formattedMessage: error instanceof Error ? error.message : 'Compilation failed'
      }]
    }
  }
}

// Avalanche-specific configuration
export const AVALANCHE_CONFIG = {
  networks: {
    mainnet: {
      chainId: 43114,
      name: 'Avalanche C-Chain',
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      explorer: 'https://snowtrace.io',
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
      }
    },
    testnet: {
      chainId: 43113,
      name: 'Avalanche Fuji Testnet',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      explorer: 'https://testnet.snowtrace.io',
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
      },
      faucet: 'https://faucet.avax.network/'
    }
  },
  gasSettings: {
    maxFeePerGas: 225000000000, // 225 nAVAX
    maxPriorityFeePerGas: 2000000000 // 2 nAVAX
  }
}

// Avalanche-optimized contract template
export const AVALANCHE_CONTRACT_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AvalancheContract
 * @dev Optimized for Avalanche C-Chain
 */
contract AvalancheContract is Ownable, ReentrancyGuard, Pausable {
    // State variables
    uint256 public value;
    mapping(address => uint256) public balances;
    
    // Events
    event ValueChanged(uint256 indexed newValue, address indexed changer);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    // Custom errors (gas-efficient)
    error InvalidAmount();
    error InsufficientBalance();
    error Unauthorized();
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Store a new value
     * @param newValue The value to store
     */
    function store(uint256 newValue) external whenNotPaused {
        value = newValue;
        emit ValueChanged(newValue, msg.sender);
    }
    
    /**
     * @dev Retrieve the stored value
     * @return The stored value
     */
    function retrieve() external view returns (uint256) {
        return value;
    }
    
    /**
     * @dev Deposit AVAX
     */
    function deposit() external payable nonReentrant whenNotPaused {
        if (msg.value == 0) revert InvalidAmount();
        
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw AVAX
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept AVAX
     */
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
`

// Validate Solidity code
export function validateSolidityCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for SPDX license
  if (!code.includes('SPDX-License-Identifier')) {
    errors.push('Missing SPDX license identifier')
  }

  // Check for pragma
  if (!code.includes('pragma solidity')) {
    errors.push('Missing pragma directive')
  }

  // Check for contract definition
  if (!code.includes('contract ')) {
    errors.push('No contract definition found')
  }

  // Check for dangerous patterns
  if (code.includes('tx.origin')) {
    errors.push('Security risk: Using tx.origin (use msg.sender instead)')
  }

  if (code.includes('selfdestruct')) {
    errors.push('Warning: selfdestruct is deprecated')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
