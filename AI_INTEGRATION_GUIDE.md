# PyVax AI Integration Guide

## Overview

The PyVax platform now includes a full-featured AI coding assistant (based on Bolt.diy) embedded in the `/ai` page. This guide explains how to run and use the integrated system.

## Architecture

- **Main Application**: Next.js app running on `http://localhost:3000`
- **AI Coding Assistant**: Remix app (hacked3.0-main) running on `http://localhost:5173`
- **Integration**: The AI assistant is embedded via iframe in the `/ai` page

## Quick Start

### Option 1: Using Batch Script (Windows)

```bash
# Double-click or run from command line
start-ai-dev.bat
```

### Option 2: Using PowerShell Script (Windows)

```powershell
# Run from PowerShell
.\start-ai-dev.ps1
```

### Option 3: Manual Start

**Terminal 1 - Main Next.js App:**
```bash
npm run dev
```

**Terminal 2 - AI Coding Assistant:**
```bash
cd hacked3.0-main
pnpm install  # First time only
pnpm run dev
```

## Accessing the AI Assistant

Once both servers are running:

1. Navigate to: `http://localhost:3000/ai`
2. The page will automatically detect if the AI server is running
3. If not running, you'll see instructions on how to start it

## Features

### Main PyVax Features (Port 3000)
- ✅ Python/Solidity smart contract IDE
- ✅ Contract compilation and deployment
- ✅ Blockchain explorer
- ✅ Template library
- ✅ Documentation

### AI Coding Assistant Features (Port 5173)
- ✅ Natural language to code generation
- ✅ WebContainer integration (runs code in browser)
- ✅ Multi-file project generation
- ✅ Live code preview
- ✅ Terminal access
- ✅ Git integration
- ✅ Multiple AI provider support (OpenAI, Anthropic, Google, etc.)

## Configuration

### AI Assistant Configuration

The AI assistant requires API keys for the LLM providers. Configure them in:

**Location:** `hacked3.0-main/.env.local`

```env
# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Google
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key

# Add other providers as needed
```

You can also configure API keys directly in the UI (Settings panel).

## Usage

### Creating a New Project with AI

1. Go to `http://localhost:3000/ai`
2. Type your request, e.g., "Create a React todo app with TypeScript"
3. The AI will generate the complete project structure
4. Code runs instantly in the browser preview

### Exporting Generated Code

- Use the download button to export your project
- All files are available for local development

### Modifying Generated Code

- Edit files directly in the Monaco editor
- Changes are instantly reflected in the preview
- Terminal available for running commands

## Troubleshooting

### AI Server Not Running

**Issue:** Page shows "PyVax AI Server Not Running"

**Solution:**
```bash
cd hacked3.0-main
pnpm install
pnpm run dev
```

### Port Conflicts

**Issue:** Port 3000 or 5173 already in use

**Solution:**
```bash
# Find and kill the process using the port
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

Or modify the port in the configuration:
- Main app: `package.json` scripts
- AI assistant: `hacked3.0-main/vite.config.ts`

### Dependencies Not Installed

**Issue:** Modules not found

**Solution:**
```bash
# Main app
npm install

# AI assistant
cd hacked3.0-main
pnpm install
```

## Development Tips

### Updating the AI Assistant

The embedded AI assistant is a separate project. To update it:

```bash
cd hacked3.0-main
git pull  # If using git
pnpm install
```

### Customizing the Integration

The integration code is in:
- `/app/ai/page.tsx` - Main integration page
- Can be modified to change iframe behavior, styling, etc.

### Adding More Features

Both projects can be developed independently:
- Main PyVax features: Standard Next.js development
- AI features: Remix development in `hacked3.0-main/`

## Performance Considerations

- **Memory**: Running both servers requires ~2GB RAM
- **First Load**: AI server may take 30-60 seconds to initialize WebContainer
- **Browser**: Chrome/Edge recommended for best WebContainer support

## Security Notes

- API keys are stored locally (never sent to PyVax servers)
- WebContainer runs in isolated environment
- iframe sandbox restrictions applied for security

## Support

For issues:
1. Check the console logs in both terminal windows
2. Verify both servers are running
3. Ensure API keys are configured correctly
4. Check browser console for errors

## Next Steps

- Explore the AI coding capabilities
- Try generating complete dApps with smart contracts
- Integrate with PyVax's deployment features
- Customize the AI prompts for blockchain development

---

**Happy Coding! 🚀**
