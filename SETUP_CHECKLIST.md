# PyVax AI Setup Checklist

## ✅ Pre-Setup Verification

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Git installed (optional, for updates)

## 📦 Installation Steps

### 1. Main Application Setup

```bash
# In project root
npm install --legacy-peer-deps
```

**Expected outcome:** All dependencies installed, no errors

### 2. AI Assistant Setup

```bash
# Navigate to AI assistant folder
cd hacked3.0-main

# Install dependencies
pnpm install
```

**Expected outcome:** All dependencies installed successfully

### 3. Environment Configuration

```bash
# Copy and configure API keys
# Edit hacked3.0-main/.env.local
```

Add at least one API key:
- [ ] OpenAI API key added
- [ ] OR Anthropic API key added
- [ ] OR Google AI API key added
- [ ] OR any other supported provider

## 🚀 Running the Application

### Method 1: Using Scripts (Recommended)

**Windows Batch:**
```bash
.\start-ai-dev.bat
```

**PowerShell:**
```powershell
.\start-ai-dev.ps1
```

**Expected outcome:**
- [ ] Two terminal windows open
- [ ] Main app starts on port 3000
- [ ] AI assistant starts on port 5173
- [ ] No error messages

### Method 2: Manual Start

**Terminal 1 - Main Application:**
```bash
npm run dev
```
- [ ] Server starts successfully
- [ ] Compiles without errors
- [ ] Running on http://localhost:3000

**Terminal 2 - AI Assistant:**
```bash
cd hacked3.0-main
pnpm run dev
```
- [ ] Server starts successfully
- [ ] Running on http://localhost:5173
- [ ] No compilation errors

## 🧪 Testing the Integration

### 1. Test Main Application

Navigate to: `http://localhost:3000`

- [ ] Home page loads correctly
- [ ] No console errors
- [ ] Navigation works
- [ ] Orb animation displays (if on home page)

### 2. Test Playground

Navigate to: `http://localhost:3000/playground`

- [ ] Playground page loads
- [ ] Code editor appears
- [ ] Console panel visible
- [ ] Can write/edit code

### 3. Test AI Assistant (Standalone)

Navigate to: `http://localhost:5173`

- [ ] AI interface loads
- [ ] Chat input available
- [ ] File tree visible
- [ ] Editor panel present

### 4. Test AI Integration

Navigate to: `http://localhost:3000/ai`

**If AI server is running:**
- [ ] Page loads with embedded iframe
- [ ] AI interface visible inside
- [ ] Can interact with AI
- [ ] "Refresh" button works
- [ ] "Open in New Tab" button works

**If AI server is NOT running:**
- [ ] Shows helpful error message
- [ ] Displays setup instructions
- [ ] "Check Again" button present

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Module not found: ogl"
**Solution:**
```bash
npm install --legacy-peer-deps
```

#### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find process
netstat -ano | findstr :3000
# Kill process
taskkill /PID <process_id> /F
```

#### Issue: "pnpm not found"
**Solution:**
```bash
npm install -g pnpm
```

#### Issue: AI assistant won't start
**Solutions:**
1. Check if dependencies are installed:
   ```bash
   cd hacked3.0-main
   pnpm install
   ```
2. Check if port 5173 is free:
   ```bash
   netstat -ano | findstr :5173
   ```
3. Try clearing cache:
   ```bash
   cd hacked3.0-main
   rm -rf node_modules .vite
   pnpm install
   ```

#### Issue: iframe shows blank page
**Solutions:**
1. Check browser console for errors
2. Verify AI server is running on port 5173
3. Try opening http://localhost:5173 directly
4. Check if API key is configured

## ✅ Final Verification

All systems working when:

- [ ] Main app accessible at http://localhost:3000
- [ ] AI assistant accessible at http://localhost:5173
- [ ] /ai page shows embedded interface
- [ ] Can create new AI chat
- [ ] Can generate code with AI
- [ ] Can see live preview in AI assistant
- [ ] No console errors in browser
- [ ] No errors in terminal logs

## 📚 Next Steps

Once setup is complete:

1. **Configure API Keys**: Add your preferred AI provider keys in `hacked3.0-main/.env.local`
2. **Read Documentation**: Check [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)
3. **Try Examples**: Test with simple prompts like "Create a React todo app"
4. **Explore Features**: Try different pages (/playground, /templates, /docs)
5. **Build Something**: Start creating your dApp!

## 🆘 Getting Help

If you encounter issues:

1. Check browser console (F12)
2. Check terminal logs for errors
3. Review [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)
4. Ensure all dependencies are installed
5. Verify API keys are configured

---

**Happy Building! 🚀**
