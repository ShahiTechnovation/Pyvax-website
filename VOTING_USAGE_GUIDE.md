# 🗳️ Simple Voting Contract - Usage Guide

## What This Contract Does

A beginner-friendly voting system where:
- ✅ An admin can add candidates
- ✅ Each person can vote once
- ✅ Everyone can see the results
- ✅ Admin can close voting when done

---

## How to Deploy

### 1. Open PyVax IDE
Go to: `http://localhost:3001/playground`

### 2. Copy the Python Code
Copy `VOTING_CONTRACT_BEGINNER.py` into the editor

### 3. Compile
- Click **"Compile (Native)"** button
- Wait for success message

### 4. Connect Wallet
- Click **"Connect Wallet"**
- Approve MetaMask connection

### 5. Deploy
- Click **"Deploy"** button
- Approve transaction in MetaMask
- Wait for confirmation

**You're now the admin!** 🎉

---

## How to Use After Deployment

### For Admin (You):

#### Add Candidates
```python
# Call: add_candidate(name)
add_candidate("Alice")
add_candidate("Bob")
add_candidate("Charlie")
```

#### Close Voting
```python
# Call: close_voting()
close_voting()
```

---

### For Voters (Anyone):

#### Vote for a Candidate
```python
# Call: vote(candidate_id)
vote(1)  # Vote for candidate #1 (Alice)
vote(2)  # Vote for candidate #2 (Bob)
vote(3)  # Vote for candidate #3 (Charlie)
```

**Note:** Candidate IDs start at 1, not 0!

---

### For Everyone (View Functions - FREE):

#### Get Total Candidates
```python
get_total_candidates()  # Returns: 3
```

#### Get Candidate Name
```python
get_candidate_name(1)  # Returns: "Alice"
get_candidate_name(2)  # Returns: "Bob"
```

#### Get Vote Count
```python
get_vote_count(1)  # Returns: 5 (Alice has 5 votes)
get_vote_count(2)  # Returns: 3 (Bob has 3 votes)
```

#### Get Winner
```python
get_winner()  # Returns: (1, "Alice", 5)
# Means: Candidate ID 1, named Alice, with 5 votes
```

#### Check if Voting is Open
```python
is_voting_open()  # Returns: True or False
```

#### Check if Someone Voted
```python
did_address_vote("0x1234...")  # Returns: True or False
```

#### See Who Someone Voted For
```python
who_did_address_vote_for("0x1234...")  # Returns: 2 (they voted for Bob)
```

---

## Example Full Flow

### Step 1: Deploy Contract
```
You deploy → You become admin
```

### Step 2: Admin Adds Candidates
```python
add_candidate("Alice")    # Candidate ID: 1
add_candidate("Bob")      # Candidate ID: 2
add_candidate("Charlie")  # Candidate ID: 3
```

### Step 3: People Vote
```
Voter 0xAAA... calls: vote(1)  # Votes for Alice
Voter 0xBBB... calls: vote(1)  # Votes for Alice
Voter 0xCCC... calls: vote(2)  # Votes for Bob
```

### Step 4: Check Results
```python
get_vote_count(1)  # Returns: 2 (Alice)
get_vote_count(2)  # Returns: 1 (Bob)
get_vote_count(3)  # Returns: 0 (Charlie)

get_winner()       # Returns: (1, "Alice", 2)
```

### Step 5: Admin Closes Voting
```python
close_voting()  # No more votes allowed
```

---

## Security Features ✅

1. **One Vote Per Address**
   - Contract tracks who voted
   - Prevents double voting

2. **Admin Only Functions**
   - Only deployer can add candidates
   - Only deployer can close voting

3. **Input Validation**
   - Can't vote for non-existent candidates
   - Can't vote when voting is closed
   - Can't add empty candidate names

4. **Public Transparency**
   - Anyone can view results
   - All votes are on-chain
   - Events logged for tracking

---

## Gas Costs (Approximate on Avalanche)

| Action | Cost |
|--------|------|
| Deploy Contract | ~0.01 AVAX |
| Add Candidate | ~0.001 AVAX |
| Vote | ~0.001 AVAX |
| Close Voting | ~0.0005 AVAX |
| View Functions | **FREE** ✨ |

---

## Troubleshooting

### "Only admin can add candidates"
- You're not the deployer
- Use the admin wallet

### "You already voted"
- Each address can only vote once
- Use a different wallet to vote again

### "Voting is closed"
- Admin called `close_voting()`
- No more votes allowed

### "Invalid candidate ID"
- Use IDs starting from 1
- Check total candidates first: `get_total_candidates()`

---

## Real-World Use Cases

✅ **Student Elections**
- Class representative voting
- Club president elections

✅ **Community Polls**
- Decide on proposals
- Feature voting

✅ **DAO Governance**
- Vote on changes
- Elect committee members

✅ **Contest Voting**
- Vote for winners
- Public competitions

---

## Next Steps

1. ✅ Deploy this contract
2. ✅ Add some candidates
3. ✅ Test voting with different wallets
4. ✅ View results in PyVax Explorer
5. ✅ Share contract address with voters!

---

## Explorer Integration

After deployment, your contract will show in PyVax Explorer with:
- 📊 Read functions (view results)
- ✍️ Write functions (vote, add candidates)
- 📝 Source code
- 🔍 Transaction history

Visit: `http://localhost:3001/explorer/YOUR_CONTRACT_ADDRESS?network=fuji`

---

## Questions?

- Check console logs in IDE
- View transactions on Snowtrace
- Test on Fuji testnet first
- Get testnet AVAX from faucet

**Happy Voting! 🗳️**
