# 🔧 Bolt.new Integration Guide for PyVax AI

## 📊 **Bolt.new Architecture Analysis**

### **Key Learnings from hacked3.0-main:**

1. **Provider Pattern**
   - Base provider class for all LLM providers
   - Registry pattern for dynamic provider loading
   - API keys stored in cookies (not localStorage)
   - Environment variable fallbacks

2. **Streaming Architecture**
   - `SwitchableStream` for handling long responses
   - Token limit handling with automatic continuation
   - Data streams for usage tracking
   - Proper Transform streams

3. **API Structure**
   - Remix routes (not Next.js API routes)
   - Edge runtime with Cloudflare Workers
   - Cookie-based API key management
   - Scoped logging system

4. **Provider Implementation**
   - `@ai-sdk/anthropic`, `@ai-sdk/openai`, etc.
   - Dynamic model loading
   - Base URL configuration
   - API key priority: cookies > env > defaults

---

## 🔄 **Comparison: Bolt vs PyVax Current**

| Feature | Bolt.new | PyVax Current | Action Needed |
|---------|----------|---------------|---------------|
| **Framework** | Remix | Next.js | ✅ Keep Next.js |
| **API Keys** | Cookies | localStorage | ✅ Keep localStorage |
| **Streaming** | SwitchableStream | Direct stream | ⚠️ Simplify for Next.js |
| **Providers** | Registry pattern | Direct imports | ⚠️ Our approach is fine |
| **Edge Runtime** | Cloudflare | Vercel | ✅ Already using |
| **Token Handling** | Auto-continue | Single response | 🔄 Can add later |

---

## 🛠️ **Fixes Needed for PyVax AI**

### **Issue 1: API Key Handling**

**Bolt.new Approach:**
```typescript
// From cookies
const cookieHeader = request.headers.get('Cookie');
const apiKeys = JSON.parse(parseCookies(cookieHeader || '').apiKeys || '{}');
```

**PyVax Approach (Keep it):**
```typescript
// From request body (simpler for Next.js)
const { apiKey } = await request.json()
```

**Status:** ✅ Our approach is better for Next.js

---

### **Issue 2: Provider Initialization**

**Bolt.new Approach:**
```typescript
const anthropic = createAnthropic({ apiKey });
return anthropic(model);
```

**PyVax Issue:**
```typescript
// ❌ Wrong: passing apiKey as second parameter
return openai(model, { apiKey })

// ✅ Correct:
const openai = createOpenAI({ apiKey })
return openai(model)
```

**Status:** ⚠️ NEEDS FIX

---

### **Issue 3: Streaming Response**

**Bolt.new Approach:**
```typescript
return new Response(stream.readable, {
  headers: {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  }
})
```

**PyVax Current:**
```typescript
return new Response(stream as any, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  }
})
```

**Status:** ⚠️ NEEDS BETTER TYPING

---

## ✅ **Implementation Fixes**

### **Fix 1: Update AI Service Layer**

The issue is in how we initialize providers. Let me show the correct pattern:

```typescript
// ❌ WRONG (our current code)
function getModel(config: AIConfig) {
  switch (provider) {
    case 'openai':
      return openai(model || 'gpt-4-turbo-preview')  // Missing apiKey!
  }
}

// ✅ CORRECT (Bolt.new pattern)
function getModel(config: AIConfig) {
  const { provider, apiKey, model } = config
  
  switch (provider) {
    case 'openai': {
      const openaiProvider = createOpenAI({ apiKey })
      return openaiProvider(model || 'gpt-4-turbo-preview')
    }
    case 'anthropic': {
      const anthropicProvider = createAnthropic({ apiKey })
      return anthropicProvider(model || 'claude-3-5-sonnet-20241022')
    }
    // ... etc
  }
}
```

---

### **Fix 2: Streaming API Route**

```typescript
// ✅ Proper streaming with better error handling
export async function POST(req: NextRequest) {
  try {
    const { prompt, agentType, provider, apiKey, model } = await req.json()

    const stream = await generateContract({
      prompt,
      agentType,
      config: { provider, apiKey, model },
      stream: true,
    })

    // Convert ReadableStream to proper format
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    // Proper error responses
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

---

### **Fix 3: Component Integration**

No changes needed! Our minimal UI is good. Just ensure API calls work properly.

---

## 🎯 **Action Items**

### **High Priority:**
1. ✅ Fix provider initialization (use createOpenAI, createAnthropic)
2. ✅ Fix API key passing
3. ✅ Test streaming responses

### **Medium Priority:**
4. 🔄 Add better error handling
5. 🔄 Add usage tracking
6. 🔄 Add token limit handling

### **Low Priority:**
7. ⏳ Add switchable streams (for very long responses)
8. ⏳ Add provider registry pattern
9. ⏳ Add dynamic model loading

---

## 🚀 **Implementation Plan**

### **Step 1: Fix lib/ai/service.ts**
- Update `getModel()` function
- Use proper provider initialization
- Pass apiKey correctly

### **Step 2: Test API Route**
- Verify streaming works
- Test all 4 providers
- Check error handling

### **Step 3: Test UI**
- Generate code with real AI
- Verify streaming display
- Check all agents work

---

## 📋 **Code Changes Required**

### **File: lib/ai/service.ts**
Lines to update: 110-130 (getModel function)

### **File: app/api/ai/generate/route.ts**
Lines to update: 60-70 (response handling)

### **Files: components/pyvax-ai-v2/**
Status: ✅ No changes needed

---

## ✅ **What We Learned**

1. **Provider Pattern is Optional**
   - Bolt uses it for extensibility
   - We can keep our simpler approach
   - Direct imports are fine for 4 providers

2. **Cookie vs localStorage**
   - Bolt uses cookies for server-side
   - We use localStorage for client-side
   - Both approaches valid for Next.js

3. **Streaming is Complex**
   - Bolt has sophisticated token handling
   - We can start simple
   - Add features as needed

4. **Edge Runtime Works**
   - Both use Vercel AI SDK
   - Edge runtime is optimal
   - Streaming works well

---

## 🎉 **Summary**

**What's Good:**
✅ Our UI is simpler and cleaner
✅ Our API structure works for Next.js
✅ Our agent system is solid
✅ localStorage API keys are fine

**What Needs Fixing:**
⚠️ Provider initialization (critical)
⚠️ API key passing (critical)
⚠️ Stream typing (minor)

**Result:**
With these fixes, PyVax AI v2.0 will work perfectly! 🚀

---

## 🔧 **Next: Apply Fixes**

Ready to:
1. Update lib/ai/service.ts with proper provider init
2. Fix API key handling
3. Test with real API keys
4. Deploy! 🚀
