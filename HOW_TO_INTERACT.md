# 🔗 How to Interact With Your Deployed Contract

You have deployed bytecode! Now let's interact with it.

---

## 📊 Your Bytecode Analysis

```
600436106100b35760003560e01c80633a525c29146100b9...
```

This contains:
- **Function dispatcher** (routes calls to correct function)
- **Function selectors** (4-byte IDs for each function)
- **EVM opcodes** (PUSH, SLOAD, SSTORE, etc.)

---

## 🎯 Method 1: Web Interface (Easiest)

### Step 1: Open PyVax IDE

```bash
npm run dev
# Opens http://localhost:3001
```

### Step 2: Go to Playground

Navigate to: `http://localhost:3001/playground`

### Step 3: Interact Section

After deploying, the IDE shows:
- ✅ **Contract Address**
- 📝 **Available Functions**
- 🔄 **Call Function** buttons

### Step 4: Call Functions

**View Functions** (read-only):
```typescript
// Automatically available in IDE
contract.get()  // No gas needed
contract.balance_of("0xAddress")
```

**Write Functions** (costs gas):
```typescript
contract.set(42)  // Requires MetaMask confirmation
contract.deposit(100)
```

---

## 🎯 Method 2: Python Script (avax_cli)

### Setup

```python
from avax_cli.interactor import ContractInteractor
from avax_cli.wallet import WalletManager

# Configuration
config = {
    "network": "fuji",
    "rpc_url": "https://api.avax-test.network/ext/bc/C/rpc",
    "chain_id": 43113
}

# Load wallet
wallet = WalletManager()
wallet.create_from_private_key("YOUR_PRIVATE_KEY")

# Create interactor
interactor = ContractInteractor(config, wallet)
```

### View Contract Info

```python
# Shows: address, network, all functions
interactor.get_contract_info("SimpleStorage")
```

### Call View Functions

```python
# Read state (no gas)
value = interactor.call_view_function(
    "SimpleStorage",  # Contract name
    "get"             # Function name
)
print(f"Current value: {value}")

# With arguments
balance = interactor.call_view_function(
    "DeFiContract",
    "balance_of",
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
)
```

### Send Transactions

```python
# Write state (costs gas)
tx_hash = interactor.send_transaction(
    "SimpleStorage",  # Contract name
    "set",           # Function name
    42               # New value
)
print(f"Transaction: {tx_hash}")

# With multiple arguments
tx_hash = interactor.send_transaction(
    "DeFiContract",
    "deposit",
    1000  # Amount
)
```

---

## 🎯 Method 3: Web3.py Direct

### Setup

```python
from web3 import Web3

# Connect to Avalanche Fuji
w3 = Web3(Web3.HTTPProvider('https://api.avax-test.network/ext/bc/C/rpc'))

# Contract details
contract_address = "0xYourContractAddress"
contract_abi = [...]  # Your ABI from compilation

# Create contract instance
contract = w3.eth.contract(address=contract_address, abi=contract_abi)
```

### Call View Functions

```python
# Read-only calls (free)
result = contract.functions.get().call()
print(f"Value: {result}")

balance = contract.functions.balance_of("0xAddress").call()
print(f"Balance: {balance}")
```

### Send Transactions

```python
from eth_account import Account

# Setup account
private_key = "YOUR_PRIVATE_KEY"
account = Account.from_key(private_key)

# Build transaction
transaction = contract.functions.set(42).build_transaction({
    'from': account.address,
    'nonce': w3.eth.get_transaction_count(account.address),
    'gas': 200000,
    'gasPrice': w3.eth.gas_price,
    'chainId': 43113
})

# Sign and send
signed_txn = account.sign_transaction(transaction)
tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

# Wait for confirmation
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"Transaction successful! Hash: {tx_hash.hex()}")
```

---

## 🎯 Method 4: JavaScript/TypeScript (ethers.js)

### Setup

```typescript
import { ethers } from 'ethers'

// Connect to Avalanche Fuji
const provider = new ethers.JsonRpcProvider(
  'https://api.avax-test.network/ext/bc/C/rpc'
)

// Contract details
const contractAddress = "0xYourContractAddress"
const contractABI = [...]  // Your ABI

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider)
```

### Call View Functions

```typescript
// Read-only (no gas)
const value = await contract.get()
console.log(`Value: ${value}`)

const balance = await contract.balance_of("0xAddress")
console.log(`Balance: ${balance}`)
```

### Send Transactions

```typescript
// Connect wallet (MetaMask)
const signer = await provider.getSigner()
const contractWithSigner = contract.connect(signer)

// Send transaction
const tx = await contractWithSigner.set(42)
console.log(`Transaction sent: ${tx.hash}`)

// Wait for confirmation
const receipt = await tx.wait()
console.log(`Confirmed in block: ${receipt.blockNumber}`)
```

---

## 📝 Common Contract Functions

### SimpleStorage

```python
# View functions
get()  # Returns current value

# Write functions
set(value: int)  # Sets new value
```

### Counter

```python
# View functions
get_count()  # Returns current count

# Write functions
increment()  # Increases count by 1
decrement()  # Decreases count by 1
reset()      # Resets to 0
```

### DeFi Contract

```python
# View functions
balance_of(user: address)     # User's balance
get_total_deposits()          # Total deposited

# Write functions
deposit(amount: int)          # Deposit tokens
withdraw(amount: int)         # Withdraw tokens
set_interest_rate(rate: int)  # Admin only
```

---

## 🔍 Decoding Your Bytecode

Your bytecode has these function selectors:

```python
# Decode function selectors
from Crypto.Hash import keccak

def get_selector(signature):
    k = keccak.new(digest_bits=256)
    k.update(signature.encode('utf-8'))
    return k.digest()[:4].hex()

# Examples
print(get_selector("get()"))                    # Returns selector
print(get_selector("set(uint256)"))
print(get_selector("balance_of(address)"))
```

From your bytecode, I can see selectors:
- `3a525c29` - Function 1
- `301b5ab8` - Function 2
- `cffb7517` - Function 3
- And more...

---

## 🚀 Quick Start Script

```bash
# 1. Save this as interact.py
cat > interact.py << 'EOF'
from avax_cli.interactor import ContractInteractor
from avax_cli.wallet import WalletManager
import os

config = {
    "network": "fuji",
    "rpc_url": "https://api.avax-test.network/ext/bc/C/rpc",
    "chain_id": 43113
}

wallet = WalletManager()
wallet.create_from_private_key(os.getenv("PRIVATE_KEY"))

interactor = ContractInteractor(config, wallet)

# Show contract info
interactor.get_contract_info("SimpleStorage")

# Call a view function
value = interactor.call_view_function("SimpleStorage", "get")
print(f"Current value: {value}")

# Send a transaction
tx = interactor.send_transaction("SimpleStorage", "set", 100)
print(f"Transaction: {tx}")
EOF

# 2. Set your private key
export PRIVATE_KEY="your_private_key_here"

# 3. Run
python interact.py
```

---

## 📊 Example Output

```
╭─────────────────────────────────────────────────────────╮
│ SimpleStorage Contract Information                      │
├─────────────────────────────────────────────────────────┤
│ Address     │ 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb │
│ Network     │ fuji                                      │
│ Deployer    │ 0x...                                     │
│ Block       │ 12345678                                  │
│ Gas Used    │ 123,456                                   │
╰─────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────╮
│ Available Functions                                      │
├─────────────┬──────────────┬────────────────────────────┤
│ Function    │ Type         │ Inputs                     │
├─────────────┼──────────────┼────────────────────────────┤
│ get         │ view         │                            │
│ set         │ nonpayable   │ uint256 _value             │
╰─────────────┴──────────────┴────────────────────────────╯

Current value: 42
Transaction: 0xabc123...
```

---

## 🎯 Next Steps

1. **Find your contract address** (from deployment logs)
2. **Choose interaction method** (Web, Python, or JS)
3. **Call view functions** to read state
4. **Send transactions** to modify state
5. **View on Snowtrace**: `https://testnet.snowtrace.io/address/YOUR_ADDRESS`

---

## 💡 Tips

- **View functions**: Free, instant
- **Write functions**: Cost gas, need wallet
- **Test on Fuji**: Use testnet AVAX first
- **Check Snowtrace**: View all transactions
- **Save contract address**: You'll need it to interact

Happy interacting! 🚀
