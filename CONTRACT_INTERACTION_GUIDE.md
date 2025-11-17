# 🎯 Contract Interaction Panel - Quick Guide

## ✅ What's Fixed

### **1. Close Button** ✅
- **X button** in top-right corner of interaction panel
- Click to close and return to editor
- Panel closes, editor becomes visible again

### **2. Scrollable Panel** ✅
- Max height: `max-h-96` (384px)
- Scrolls if functions overflow
- Editor remains visible above

### **3. Function Buttons** ✅
- **Call button** (blue) - For view functions (read-only, free)
- **Send button** (orange) - For write functions (transactions, costs gas)

---

## 🚀 How to Use

### **Step 1: Deploy Contract**
1. Write Python contract in editor
2. Click "Compile (Native)"
3. Click "Deploy"
4. Confirm in MetaMask

### **Step 2: Interaction Panel Appears**
After successful deployment, you'll see:
- ✅ Contract address (with Copy button)
- ✅ Links to Snowtrace and Python source
- ✅ All contract functions
- ✅ **X button to close panel**

### **Step 3: Interact with Functions**

#### **View Functions (Blue "Call" Button)**
Example: `get_candidates`

1. **No input needed?** Just click "Call"
2. **Has input?** Enter value → Click "Call"
3. Result appears in console instantly
4. **Free** - No gas cost

#### **Write Functions (Orange "Send" Button)**
Example: `add_candidate`, `vote`

1. **Enter required inputs** in text fields
2. Click **"Send"**
3. **MetaMask popup** appears
4. Confirm transaction
5. Wait for confirmation
6. Result in console

### **Step 4: Close Panel**
- Click **X button** in top-right
- Panel closes
- Editor becomes visible again
- Can deploy again anytime

---

## 📝 Example: Voting Contract

### **Functions You'll See:**

```
┌────────────────────────────────────────┐
│ add_candidate    [write]    [Send]    │
│ [_______weed_________]                 │
└────────────────────────────────────────┘
```
**Usage:**
1. Type candidate name: `weed`
2. Click "Send"
3. Confirm in MetaMask
4. Candidate added!

```
┌────────────────────────────────────────┐
│ vote             [write]    [Send]    │
│ [___candidate_name (address)____]     │
└────────────────────────────────────────┘
```
**Usage:**
1. Enter address or name
2. Click "Send"  
3. Confirm transaction
4. Vote recorded!

```
┌────────────────────────────────────────┐
│ get_candidates   [view]     [Call]    │
└────────────────────────────────────────┘
```
**Usage:**
1. Click "Call"
2. See list in console
3. No gas needed!

```
┌────────────────────────────────────────┐
│ get_vote_count   [view]     [Call]    │
│ [___candidate_name (address)____]     │
└────────────────────────────────────────┘
```
**Usage:**
1. Enter candidate name
2. Click "Call"
3. See vote count in console
4. Free to check!

---

## 🎨 Visual Guide

### **Panel Layout:**
```
┌──────────────────────────────────────────────────────┐
│ ● Contract Deployed Successfully!          [X]       │ ← Close button
├──────────────────────────────────────────────────────┤
│ Contract Address: 0x6c83812425...           [Copy]   │
│ 🔗 View on Snowtrace | 📝 View Python Source        │
├──────────────────────────────────────────────────────┤
│ Interact with Contract                               │
│                                                      │
│ [Function boxes with inputs and buttons]             │
│ ...scrollable if many functions...                   │
└──────────────────────────────────────────────────────┘
```

### **Scrolling:**
- Panel has `max-h-96` (384px max height)
- If functions overflow, scrollbar appears
- Editor stays visible at top

---

## ⚡ Quick Actions

### **Copy Contract Address:**
1. Click "Copy" button
2. Address copied to clipboard
3. Confirmation in console

### **View on Snowtrace:**
1. Click "View on Snowtrace" link
2. Opens in new tab
3. See blockchain data

### **View Python Source:**
1. Click "View Python Source" link
2. Opens custom explorer
3. See your Python code + full interaction UI

### **Close Panel:**
1. Click X button
2. Panel disappears
3. Back to editor

---

## 🐛 Troubleshooting

### **Issue: Buttons not working**
**Solution:**
- Make sure MetaMask is connected
- Check you're on Avalanche Fuji testnet
- View functions (Call) work without wallet
- Write functions (Send) need MetaMask

### **Issue: Can't see editor**
**Solution:**
- Click **X button** in top-right of panel
- Panel closes, editor appears
- Scroll up if needed

### **Issue: Panel too tall**
**Solution:**
- Panel auto-scrolls at 384px height
- Use mouse wheel or scrollbar
- Functions at bottom are accessible

### **Issue: Input not working**
**Solution:**
- Click in input field
- Type your value
- For addresses: full address or name
- For numbers: just digits

---

## 💡 Tips

### **For View Functions:**
- ✅ **Free to call** - No gas
- ✅ **Instant results** - No waiting
- ✅ **No MetaMask** needed
- ✅ **Call many times** - No cost

### **For Write Functions:**
- ⚠️ **Costs gas** - Need AVAX
- ⚠️ **Needs MetaMask** confirmation
- ⚠️ **Wait for confirmation** - Takes time
- ⚠️ **Changes state** - Permanent

### **Best Practice:**
1. **Call view functions first** to check state
2. **Then send transactions** to modify
3. **Call view again** to verify changes
4. **Close panel** when done to code more

---

## 🎯 Workflow Example

### **Complete Voting Flow:**

1. **Deploy Contract**
   ```
   Compile → Deploy → Confirm MetaMask
   ```

2. **Add Candidates**
   ```
   add_candidate: "Alice" → Send → Confirm
   add_candidate: "Bob" → Send → Confirm
   ```

3. **Check Candidates**
   ```
   get_candidates → Call → See ["Alice", "Bob"]
   ```

4. **Vote**
   ```
   vote: "Alice" → Send → Confirm
   vote: "Bob" → Send → Confirm
   ```

5. **Check Results**
   ```
   get_vote_count: "Alice" → Call → See "1"
   get_vote_count: "Bob" → Call → See "1"
   ```

6. **Close Panel**
   ```
   Click X → Back to editor
   ```

---

## ✅ Success Indicators

### **In Console:**
```
✓ Contract deployed at: 0x6c838...
✓ Contract verified!
✓ Calling get_candidates...
✓ Result: ["Alice", "Bob"]
✓ Transaction sent: 0xabc123...
✓ Transaction confirmed in block 12345
```

### **In Panel:**
- Green pulse = Contract active
- Blue buttons = View functions
- Orange buttons = Write functions
- Filled inputs = Ready to call

---

## 🎉 You're Ready!

Now you can:
- ✅ Deploy Python contracts
- ✅ Interact with all functions
- ✅ Close panel when done
- ✅ View on explorers
- ✅ Test thoroughly

**Have fun building!** 🚀
