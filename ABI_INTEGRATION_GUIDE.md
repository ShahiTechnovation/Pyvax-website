# 📋 ABI Integration Guide

## 🎯 What is ABI?

**ABI (Application Binary Interface)** is a JSON file that describes your smart contract's functions, inputs, and outputs. Your frontend needs it to interact with the deployed contract.

---

## 🚀 Where to Get Your ABI

### **Method 1: From IDE (After Deployment)**

After deploying a contract, look in the deployed contract panel:

```
┌──────────────────────────────────────────┐
│ Contract Address                [Copy]   │
│ 0x6c838...                               │
├──────────────────────────────────────────┤
│ Contract ABI (5 functions)               │
│ [Copy ABI]  [Download]                   │
│ > View ABI JSON                          │
└──────────────────────────────────────────┘
```

**Options:**
- ✅ **Copy ABI** - Copies JSON to clipboard
- ✅ **Download** - Downloads as `.json` file
- ✅ **View ABI JSON** - Preview in IDE

### **Method 2: From PyVax Explorer**

Visit your contract in the explorer:
```
http://localhost:3001/explorer/0xYOUR_ADDRESS?network=fuji
```

Go to **Code tab** → Scroll to **Contract ABI** section:
- ✅ Full ABI displayed
- ✅ Copy button
- ✅ Frontend integration examples
- ✅ Usage code snippets

---

## 💻 Using ABI in Your Frontend

### **1. Vanilla JavaScript / ethers.js**

```javascript
import { ethers } from 'ethers'

// Your contract details (copy from IDE/Explorer)
const contractAddress = "0x6c838124..." // Your deployed address
const contractABI = [
  {
    "inputs": [],
    "name": "get_candidates",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  // ... more functions
]

// Connect to contract
async function connectContract() {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, contractABI, signer)
  return contract
}

// Call view functions (read-only, free)
async function getCandidates() {
  const contract = await connectContract()
  const candidates = await contract.get_candidates()
  console.log('Candidates:', candidates)
  return candidates
}

// Call write functions (transactions, costs gas)
async function addCandidate(name) {
  const contract = await connectContract()
  const tx = await contract.add_candidate(name)
  console.log('Transaction sent:', tx.hash)
  await tx.wait() // Wait for confirmation
  console.log('Transaction confirmed!')
}

// Usage
getCandidates()
addCandidate("Alice")
```

---

### **2. React + ethers.js**

```tsx
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Contract config
const CONTRACT_ADDRESS = "0x6c838124..."
const CONTRACT_ABI = [ /* ABI from IDE/Explorer */ ]

function VotingApp() {
  const [contract, setContract] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)

  // Initialize contract
  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        )
        setContract(contractInstance)
      }
    }
    init()
  }, [])

  // Read function
  async function loadCandidates() {
    if (!contract) return
    setLoading(true)
    try {
      const result = await contract.get_candidates()
      setCandidates(result)
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  // Write function
  async function vote(candidate) {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.vote(candidate)
      await tx.wait()
      alert('Vote recorded!')
      loadCandidates() // Refresh
    } catch (error) {
      console.error('Error:', error)
      alert('Vote failed: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Voting dApp</h1>
      <button onClick={loadCandidates} disabled={loading}>
        {loading ? 'Loading...' : 'Load Candidates'}
      </button>
      
      <ul>
        {candidates.map((candidate, i) => (
          <li key={i}>
            {candidate}
            <button onClick={() => vote(candidate)}>Vote</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### **3. React + wagmi (Recommended)**

```tsx
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'

const CONTRACT_ADDRESS = "0x6c838124..."
const CONTRACT_ABI = [ /* ABI from IDE/Explorer */ ]

function VotingApp() {
  // Read contract data
  const { data: candidates } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'get_candidates',
  })

  // Prepare write transaction
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'vote',
    args: ['Alice'], // Dynamic arguments
  })

  // Execute write transaction
  const { write: vote, isLoading } = useContractWrite(config)

  return (
    <div>
      <h1>Candidates</h1>
      <ul>
        {candidates?.map((candidate, i) => (
          <li key={i}>{candidate}</li>
        ))}
      </ul>
      
      <button onClick={() => vote?.()} disabled={isLoading}>
        {isLoading ? 'Voting...' : 'Vote for Alice'}
      </button>
    </div>
  )
}
```

---

### **4. Next.js App Router**

```tsx
'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = "0x6c838124..."
const CONTRACT_ABI = [ /* ABI */ ]

export default function ContractPage() {
  const [data, setData] = useState(null)

  async function callContract() {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    )
    
    const result = await contract.get_candidates()
    setData(result)
  }

  return (
    <div>
      <button onClick={callContract}>Call Contract</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```

---

## 📦 Storing ABI in Your Project

### **Option 1: JSON File**

1. Download ABI from IDE
2. Save to `contracts/voting-abi.json`
3. Import in your code:

```javascript
import contractABI from './contracts/voting-abi.json'

const contract = new ethers.Contract(address, contractABI, signer)
```

### **Option 2: TypeScript/JavaScript Constant**

```typescript
// contracts/voting.ts
export const VOTING_CONTRACT = {
  address: "0x6c838124...",
  abi: [
    {
      "inputs": [],
      "name": "get_candidates",
      "outputs": [{"type": "string[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    // ... more functions
  ]
}

// Usage
import { VOTING_CONTRACT } from './contracts/voting'

const contract = new ethers.Contract(
  VOTING_CONTRACT.address,
  VOTING_CONTRACT.abi,
  signer
)
```

### **Option 3: Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6c838124...
```

```javascript
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
const CONTRACT_ABI = require('./contracts/abi.json')
```

---

## 🎯 Common Use Cases

### **1. Display Contract Data**

```javascript
async function displayCandidates() {
  const contract = new ethers.Contract(address, abi, provider)
  const candidates = await contract.get_candidates()
  
  document.getElementById('candidates').innerHTML = candidates
    .map(c => `<li>${c}</li>`)
    .join('')
}
```

### **2. Submit Transaction**

```javascript
async function submitVote(candidate) {
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(address, abi, signer)
  
  const tx = await contract.vote(candidate)
  console.log('TX Hash:', tx.hash)
  
  const receipt = await tx.wait()
  console.log('Confirmed in block:', receipt.blockNumber)
}
```

### **3. Listen to Events**

```javascript
const contract = new ethers.Contract(address, abi, provider)

contract.on('VoteCast', (voter, candidate, event) => {
  console.log(`${voter} voted for ${candidate}`)
})
```

### **4. Get Function List**

```javascript
// List all functions
const functions = abi
  .filter(item => item.type === 'function')
  .map(f => f.name)

console.log('Available functions:', functions)
```

---

## 📝 ABI Structure Explained

### **Function Entry:**

```json
{
  "inputs": [
    {
      "internalType": "string",
      "name": "candidate_name",
      "type": "string"
    }
  ],
  "name": "vote",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}
```

**Fields:**
- `name` - Function name (`vote`)
- `inputs` - Array of parameters
- `outputs` - Return values
- `stateMutability`:
  - `view` - Read-only, free
  - `pure` - Pure function, free
  - `nonpayable` - Costs gas, no ETH
  - `payable` - Costs gas, accepts ETH

---

## 🔧 Troubleshooting

### **Issue: "Cannot read property of undefined"**
```
Solution: Check if MetaMask is installed and connected
```

### **Issue: "execution reverted"**
```
Solution: Function requires gas or wrong parameters
```

### **Issue: "unpredictable gas limit"**
```
Solution: Estimate gas before sending transaction
const gasEstimate = await contract.estimateGas.vote(candidate)
```

### **Issue: ABI function not found**
```
Solution: Make sure function name matches exactly (case-sensitive)
Verify ABI was copied correctly
```

---

## 🎉 Quick Start Checklist

- [ ] Deploy contract from PyVax IDE
- [ ] Copy/download ABI
- [ ] Save ABI in your frontend project
- [ ] Install ethers.js: `npm install ethers`
- [ ] Import ABI and contract address
- [ ] Create contract instance
- [ ] Call view functions (free)
- [ ] Call write functions (with wallet)
- [ ] Test in browser

---

## 📚 Resources

**PyVax:**
- IDE: `http://localhost:3001/playground`
- Explorer: `http://localhost:3001/explorer/[address]`
- Docs: See `CONTRACT_INTERACTION_GUIDE.md`

**External:**
- [ethers.js Docs](https://docs.ethers.org/)
- [wagmi Docs](https://wagmi.sh/)
- [Avalanche Docs](https://docs.avax.network/)

---

## ✅ Summary

### **Getting ABI:**
1. ✅ Deploy contract in IDE
2. ✅ Click "Copy ABI" or "Download"
3. ✅ Or visit Explorer → Code tab

### **Using ABI:**
1. ✅ Import ethers.js
2. ✅ Create contract instance with ABI
3. ✅ Call functions with `contract.functionName()`
4. ✅ Handle transactions and results

**You're ready to build your frontend!** 🚀
