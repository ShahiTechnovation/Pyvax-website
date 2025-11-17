# 🤖 PyVax AI Setup Guide

## ✅ Installation Complete!

The Bolt.diy AI system has been installed and integrated with PyVax as a separate AI page.

---

## 🎯 How It Works

### **Two Servers Running:**

1. **PyVax Main** (Port 3001)
   - Python IDE
   - Contract verification
   - Blockchain explorer
   - Your existing features

2. **PyVax AI** (Port 5173)
   - Full AI agent (Bolt.diy)
   - Code generation
   - Full-stack dApps
   - Terminal, preview, file editor

### **Integration:**
- Visit `/ai` route in PyVax → Opens AI interface
- AI runs in separate process (port 5173)
- Both systems work independently
- No conflicts, clean separation

---

## 🚀 How to Start

### **Terminal 1: PyVax Main**
```bash
# In project root
cd c:\Users\nothi\Downloads\pyvax-website

# Start PyVax
npm run dev

# Available at: http://localhost:3001
```

### **Terminal 2: PyVax AI**
```bash
# In AI folder
cd c:\Users\nothi\Downloads\pyvax-website\hacked3.0-main

# Start AI server
pnpm run dev

# Available at: http://localhost:5173
```

---

## 📋 Quick Start Commands

### **Option 1: Manual Start (Recommended)**

**Terminal 1:**
```bash
cd c:\Users\nothi\Downloads\pyvax-website
npm run dev
```

**Terminal 2:**
```bash
cd c:\Users\nothi\Downloads\pyvax-website\hacked3.0-main
pnpm run dev
```

### **Option 2: Single Command (PowerShell)**
```powershell
# Start both servers
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\nothi\Downloads\pyvax-website; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\nothi\Downloads\pyvax-website\hacked3.0-main; pnpm run dev"
```

---

## 🎨 How to Use

### **1. Start Both Servers**
Follow the commands above

### **2. Access PyVax**
Open: http://localhost:3001

### **3. Navigate to AI Page**
Click "AI Agent" in navigation, or visit: http://localhost:3001/ai

### **4. Use AI Features**
- Generate full-stack dApps
- AI code generation
- Built-in terminal
- Live preview
- File management

---

## 🔧 Configuration

### **AI Server Configuration**

The AI system uses its own `.env` file. Create if needed:

```bash
# hacked3.0-main/.env.local

# AI Provider Keys (add at least one)
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Optional
GROQ_API_KEY=
OPENROUTER_API_KEY=
```

Get API keys:
- **Anthropic (Claude):** https://console.anthropic.com/
- **OpenAI (GPT-4):** https://platform.openai.com/
- **Google (Gemini):** https://makersuite.google.com/app/apikey

---

## 📊 Architecture

```
PyVax Website (Next.js - Port 3001)
├── /playground     → Python IDE
├── /explorer       → Blockchain Explorer
├── /ai             → AI Agent Interface (iframe to port 5173)
└── Other pages

PyVax AI (Remix - Port 5173)
├── Bolt.diy system
├── AI code generation
├── WebContainer (browser-based execution)
├── Terminal, preview, file editor
└── Full-stack dApp generation
```

---

## 🎯 Features

### **PyVax Main (Port 3001):**
- ✅ Python smart contract IDE
- ✅ Python → EVM transpilation
- ✅ Contract verification
- ✅ Blockchain explorer
- ✅ MetaMask deployment
- ✅ Read/Write functions

### **PyVax AI (Port 5173):**
- ✅ AI code generation
- ✅ Full-stack dApp creation
- ✅ Multiple AI providers
- ✅ Built-in terminal
- ✅ Live preview
- ✅ File system
- ✅ Git integration
- ✅ WebContainer (runs code in browser)

---

## 🔥 Example Workflow

### **1. Generate Contract with AI**
```
Visit: http://localhost:3001/ai
Ask AI: "Create a voting contract"
AI generates complete project with:
- Smart contract
- Frontend UI
- Tests
- Deployment scripts
```

### **2. Copy to PyVax IDE**
```
Copy the generated Python contract
Go to: http://localhost:3001/playground
Paste code
Compile and deploy
```

### **3. Verify on Explorer**
```
Go to: http://localhost:3001/explorer/[address]
View transactions, tokens, verified source
```

---

## 🐛 Troubleshooting

### **AI Server Not Running**
```bash
# Check if running
curl http://localhost:5173

# If not, start it
cd hacked3.0-main
pnpm run dev
```

### **Port Already in Use**
```bash
# Kill process on port 5173
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Or change port in hacked3.0-main/vite.config.ts
```

### **Dependencies Issue**
```bash
# Reinstall
cd hacked3.0-main
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### **CORS Errors**
- Normal! The iframe works despite CORS warnings
- Both servers are on localhost, so it's safe

---

## 📝 File Structure

```
pyvax-website/
├── app/
│   ├── ai/
│   │   └── page.tsx          # AI interface page (NEW)
│   ├── playground/
│   ├── explorer/
│   └── ...
├── hacked3.0-main/           # Bolt.diy AI system (AS IS)
│   ├── app/                  # Remix routes
│   ├── components/           # AI UI components
│   ├── lib/                  # AI logic
│   ├── package.json          # pnpm dependencies
│   └── vite.config.ts        # Remix config
└── ...
```

---

## ✅ What Was Done

### **1. Installed Dependencies**
```bash
✅ pnpm install in hacked3.0-main
✅ 133 packages installed
✅ All AI providers included
✅ WebContainer ready
```

### **2. Created AI Page**
```bash
✅ app/ai/page.tsx
✅ Iframe integration
✅ Server status check
✅ Setup instructions
```

### **3. Kept Everything As Is**
```bash
✅ hacked3.0-main/ untouched
✅ Original Bolt.diy system
✅ All features intact
✅ No modifications needed
```

---

## 🎯 Quick Test

### **Test 1: PyVax Main**
```bash
# Terminal 1
npm run dev

# Visit
http://localhost:3001/playground
```

### **Test 2: PyVax AI**
```bash
# Terminal 2
cd hacked3.0-main
pnpm run dev

# Visit
http://localhost:5173
```

### **Test 3: Integrated**
```bash
# Both terminals running

# Visit PyVax
http://localhost:3001

# Click "AI Agent" or go to
http://localhost:3001/ai

# Should see Bolt.diy interface embedded
```

---

## 💡 Tips

### **Development**
- Keep both terminals open
- PyVax Main auto-reloads on changes
- AI server auto-reloads on changes
- Both can run simultaneously

### **Production**
- Deploy PyVax to Railway (as before)
- Deploy AI to Cloudflare Pages (Bolt.diy default)
- Update AI page URL to production AI URL

### **API Keys**
- Add to `hacked3.0-main/.env.local`
- At least one provider needed
- Free tiers available (Anthropic $5 credit)

---

## 📚 Documentation

### **PyVax Main:**
- See existing docs in project root
- Python IDE, verification, explorer

### **Bolt.diy (AI System):**
- See `hacked3.0-main/README.md`
- Original documentation preserved
- No modifications made

---

## 🚀 You're Ready!

### **Start Using:**

**Terminal 1:**
```bash
cd c:\Users\nothi\Downloads\pyvax-website
npm run dev
```

**Terminal 2:**
```bash
cd c:\Users\nothi\Downloads\pyvax-website\hacked3.0-main
pnpm run dev
```

**Then visit:** http://localhost:3001/ai

**Enjoy full AI-powered dApp generation!** 🎉

---

## 📞 Support

### **PyVax Issues:**
- Check existing PyVax docs
- Verify contract verification working
- Check Blockscout integration

### **AI System Issues:**
- Check `hacked3.0-main` docs
- Verify API keys in `.env.local`
- Check AI server is running on 5173

---

**Status:** ✅ **Ready to Use!**  
**PyVax:** http://localhost:3001  
**AI Agent:** http://localhost:3001/ai  
**Both Systems:** Fully functional! 🚀
