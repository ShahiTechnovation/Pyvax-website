# 🔧 Manual Contract Verification Guide

Use this if auto-verification failed during deployment.

---

## Step 1: Gather Required Information

You need:
1. ✅ **Contract Address**: `0x89F628A96419e4651968EB8332ec0b662B5372e8`
2. ✅ **Python Source Code**: Your voting contract code
3. ✅ **Contract Name**: `SimpleVoting`
4. ✅ **ABI**: From your compilation (see below)
5. ✅ **Network**: `fuji`

---

## Step 2: Get Your ABI

### Option A: From IDE Console
After compiling, check the console for:
```javascript
{
  "abi": [ ... ],  // Copy this entire array
  "bytecode": "0x...",
  ...
}
```

### Option B: From Browser DevTools
1. Open DevTools (F12)
2. Go to Console tab
3. After compilation, look for the compilation result object
4. Expand it and copy the `abi` array

---

## Step 3: Call Manual Verification API

### Using cURL:

```bash
curl -X POST http://localhost:3001/api/verify-manual \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x89F628A96419e4651968EB8332ec0b662B5372e8",
    "network": "fuji",
    "contractName": "SimpleVoting",
    "pythonSource": "... YOUR FULL PYTHON CODE HERE ...",
    "abi": [
      {
        "type": "function",
        "name": "vote",
        "inputs": [{"name": "candidate_id", "type": "uint256"}],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      ... REST OF ABI ...
    ],
    "bytecode": "0x..."
  }'
```

### Using Fetch (Browser Console):

```javascript
fetch('http://localhost:3001/api/verify-manual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x89F628A96419e4651968EB8332ec0b662B5372e8',
    network: 'fuji',
    contractName: 'SimpleVoting',
    pythonSource: `YOUR_PYTHON_CODE_HERE`,
    abi: [/* YOUR ABI ARRAY */],
    bytecode: '0x...'
  })
})
.then(r => r.json())
.then(console.log)
```

---

## Step 4: Check Verification Status

### API Check:
```bash
curl "http://localhost:3001/api/verify-manual?address=0x89F628A96419e4651968EB8332ec0b662B5372e8&network=fuji"
```

### Or visit PyVax Explorer:
```
http://localhost:3001/explorer/0x89F628A96419e4651968EB8332ec0b662B5372e8?network=fuji
```

---

## Step 5: Verify It Worked

After manual verification, the explorer should show:
- ✅ Status: "Verified ✓"
- ✅ Code tab with Python source
- ✅ Read tab with view functions
- ✅ Write tab with write functions

---

## Quick Verification Script

Save this as `verify-contract.js` and run with `node verify-contract.js`:

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

const pythonSource = fs.readFileSync('./VOTING_CONTRACT_BEGINNER.py', 'utf8');

// TODO: Replace with your actual ABI from compilation
const abi = [
  // Paste your ABI here
];

fetch('http://localhost:3001/api/verify-manual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x89F628A96419e4651968EB8332ec0b662B5372e8',
    network: 'fuji',
    contractName: 'SimpleVoting',
    pythonSource: pythonSource,
    abi: abi,
    bytecode: '0x' // Optional
  })
})
.then(r => r.json())
.then(result => {
  console.log('Verification Result:', result);
  if (result.success && result.verified) {
    console.log('✅ Contract verified successfully!');
    console.log('Visit: http://localhost:3001/explorer/0x89F628A96419e4651968EB8332ec0b662B5372e8?network=fuji');
  } else {
    console.log('❌ Verification failed:', result.message);
    if (result.errors) {
      console.log('Errors:', result.errors);
    }
  }
})
.catch(err => {
  console.error('Error:', err);
});
```

---

## Troubleshooting

### "Missing required fields"
- Make sure you included: address, pythonSource, contractName, abi

### "ABI is required"
- You must provide the ABI array from compilation
- It should have function definitions with names, inputs, outputs

### "Contract does not exist on blockchain"
- Wrong address
- Wrong network (use 'fuji' for testnet)
- Contract wasn't actually deployed

### Still Not Working?
1. Check browser console for errors
2. Check server logs for verification errors
3. Try redeploying the contract fresh

---

## Expected ABI Format

Your ABI should look like this:

```json
[
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "add_candidate",
    "inputs": [
      {"name": "name", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "vote",
    "inputs": [
      {"name": "candidate_id", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "get_vote_count",
    "inputs": [
      {"name": "candidate_id", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "VoteCast",
    "inputs": [
      {"name": "voter", "type": "address", "indexed": false},
      {"name": "candidate_id", "type": "uint256", "indexed": false},
      {"name": "candidate_name", "type": "string", "indexed": false}
    ]
  }
]
```

---

## Success Indicators

✅ API returns: `{ "success": true, "verified": true }`  
✅ Explorer shows "Verified ✓" badge  
✅ Source code visible in Code tab  
✅ Read functions clickable in Read tab  
✅ Write functions clickable in Write tab  

---

## Need Help?

Share with me:
1. The console output from your IDE after compilation
2. The verification API response
3. Any error messages from browser console

I'll help debug! 🚀
