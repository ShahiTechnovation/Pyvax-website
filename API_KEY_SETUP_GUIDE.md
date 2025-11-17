# 🔑 API Key Setup Guide - Inline Configuration

## No More Blocking Screens!

PyVax AI now features **Bolt.diy-style inline API key management** - no blocking screens, no page redirects, just seamless configuration.

---

## 📸 What You'll See

### 1. Page Loads (No API Key)
```
┌──────────────────────────────────────────────────┐
│ ⭐ PyVax AI          [Select Model ▼] [Workbench]│
├──────────────────────────────────────────────────┤
│                                                    │
│  ╔════════════════════════════════════════════╗  │
│  ║ 🔑 OpenAI API Key Required                 ║  │
│  ║                                            ║  │
│  ║ Get your API key from OpenAI and enter    ║  │
│  ║ it below to start using PyVax AI.         ║  │
│  ║                                            ║  │
│  ║ [●●●●●●●●●●●●●●●●●●●●●●●●●] [👁️] [Save]  ║  │
│  ║                                            ║  │
│  ║ Your API key is stored locally and never  ║  │
│  ║ sent to our servers.                      ║  │
│  ╚════════════════════════════════════════════╝  │
│                                                    │
│              ⭐ Welcome to PyVax AI                │
│      Build production-ready dApps using           │
│           natural language.                        │
│                                                    │
│  [Create ERC-20]  [Build DeFi dApp]               │
│  [NFT Marketplace] [Audit Contract]               │
│                                                    │
├──────────────────────────────────────────────────┤
│ [Add an API key to start chatting...] [Send 🚫]  │
│     Add your openai API key above to chat         │
└──────────────────────────────────────────────────┘
```

### 2. After Adding API Key
```
┌──────────────────────────────────────────────────┐
│ ⭐ PyVax AI          [GPT-4o ▼]      [Workbench] │
├──────────────────────────────────────────────────┤
│                                                    │
│  ╔════════════════════════════════════════════╗  │
│  ║ ✅ API Key Saved!                          ║  │
│  ║ You can now start chatting with OpenAI    ║  │
│  ╚════════════════════════════════════════════╝  │
│                                                    │
│              ⭐ Welcome to PyVax AI                │
│      Build production-ready dApps using           │
│           natural language.                        │
│                                                    │
│  [Create ERC-20]  [Build DeFi dApp]               │
│  [NFT Marketplace] [Audit Contract]               │
│                                                    │
├──────────────────────────────────────────────────┤
│ [Describe what you want to build...]    [Send ✓] │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup Steps

### Option 1: Use OpenAI (Recommended)
1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key (starts with `sk-`)
4. Paste in PyVax AI banner
5. Click **Save**
6. Start chatting!

### Option 2: Use Anthropic (Claude)
1. Visit https://console.anthropic.com/account/keys
2. Create new API key
3. Copy the key (starts with `sk-ant-`)
4. Switch provider in dropdown
5. Paste key in banner
6. Click **Save**

### Option 3: Use Google AI (Free!)
1. Visit https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy the key (starts with `AIza`)
4. Switch provider to Google
5. Paste key in banner
6. Click **Save**

---

## 🎨 Features

### Inline Banner
- ✅ Shows at top of chat (non-blocking)
- ✅ Direct link to provider's API key page
- ✅ Password input with show/hide toggle
- ✅ Enter key to save
- ✅ Success feedback with auto-dismiss
- ✅ Manual dismiss option (X button)
- ✅ Security notice displayed

### Provider Selector
- ✅ All 7 providers in dropdown menu
- ✅ 30+ models with pricing info
- ✅ Shows which providers have API keys
- ✅ Disabled state for missing keys
- ✅ Current model highlighted
- ✅ Context window displayed
- ✅ Quick switching between providers

### Smart Input Behavior
- ✅ Disabled when no API key (clear feedback)
- ✅ Dynamic placeholder text
- ✅ Tooltip on hover explaining why disabled
- ✅ Help text below input
- ✅ Re-enables instantly after key added

---

## 🔒 Security

### Local Storage Only
```typescript
// API keys are stored in localStorage
// Never sent to our servers
// Only sent to your chosen LLM provider
{
  "openai": "sk-...",
  "anthropic": "sk-ant-...",
  "google": "AIza..."
}
```

### Privacy Notice
Every banner shows:
> "Your API key is stored locally and never sent to our servers."

---

## 🎯 Provider Information

| Provider | API Key Format | Get Key From |
|----------|---------------|--------------|
| **OpenAI** | `sk-...` | https://platform.openai.com/api-keys |
| **Anthropic** | `sk-ant-...` | https://console.anthropic.com/account/keys |
| **Google** | `AIza...` | https://aistudio.google.com/app/apikey |
| **Mistral** | `...` | https://console.mistral.ai/api-keys |
| **Cohere** | `...` | https://dashboard.cohere.com/api-keys |
| **OpenRouter** | `sk-or-...` | https://openrouter.ai/keys |
| **Groq** | `gsk_...` | https://console.groq.com/keys |

---

## 💡 Tips

### Multiple Providers
You can add API keys for multiple providers and switch between them:
1. Add OpenAI key → Chat with GPT-4o
2. Click provider dropdown → Select Claude 3.5 Sonnet
3. Banner appears → Add Anthropic key
4. Switch back and forth anytime!

### Free Option
Google's Gemini 2.0 Flash is **completely free**:
- No credit card required
- 1M context window
- Fast inference
- Perfect for testing

### Best Models
- **Code**: Claude 3.5 Sonnet or GPT-4o
- **Fast**: Groq (Llama 3.3 70B) or GPT-4o Mini
- **Long Context**: Gemini 1.5 Pro (2M tokens!)
- **Free**: Gemini 2.0 Flash

---

## 🐛 Troubleshooting

### Banner Doesn't Appear
- Refresh the page
- Check if API key already saved (look at send button - is it enabled?)
- Try clicking provider dropdown

### "Invalid API Key" Error
- Check key format (should start with `sk-`, `sk-ant-`, etc.)
- Verify key on provider's website
- Make sure you copied the full key (no spaces)

### Send Button Still Disabled
- Wait 1 second after saving key
- Refresh the page
- Check browser console for errors

### Key Not Persisting
- Check if localStorage is enabled
- Try incognito/private mode
- Clear site data and try again

---

## 📚 Related Documentation

- `MIGRATION_COMPLETE_SUMMARY.md` - Full system overview
- `PHASE5_COMPLETE.md` - UI integration details
- `.env.example` - Environment variable reference

---

## 🎉 Result

**No blocking screens.** No complex setup. Just:
1. Open PyVax AI
2. See banner
3. Add key
4. Start building

Simple. Fast. Seamless. 🚀

---

**Updated**: Nov 18, 2025 - 1:25 AM IST  
**Commit**: `767acf9`  
**Status**: PRODUCTION READY ✅
