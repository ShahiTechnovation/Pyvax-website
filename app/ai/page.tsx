'use client'

/**
 * PyVax AI Page - Unified AI Interface
 * Complete integration of WebContainer, LLM streaming, and smart contract generation
 * No external dependencies - fully integrated Next.js application
 */

import { useEffect } from 'react'
import { useAIChat, useAIProvider } from '@/lib/ai'
import { useWebContainer } from '@/lib/webcontainer/use-webcontainer'
import { useWorkbenchStore } from '@/lib/stores'
import { Loader2, Sparkles, Code2, Terminal as TerminalIcon, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PyVaxAIPage() {
  // Initialize AI and WebContainer
  const { messages, sendMessage, isStreaming, error } = useAIChat({
    onComplete: async (text) => {
      // Auto-apply AI response to WebContainer
      if (isBooted) {
        await applyAI(text, { autoInstall: true, autoStart: true })
      }
    },
  })

  const { provider, model, hasAPIKey } = useAIProvider()
  const { isBooted, isBooting, boot, applyAI } = useWebContainer({ autoboot: true })
  const showWorkbench = useWorkbenchStore((state) => state.showWorkbench)
  const toggleWorkbench = useWorkbenchStore((state) => state.toggleWorkbench)

  // Boot WebContainer on mount
  useEffect(() => {
    if (!isBooted && !isBooting) {
      boot()
    }
  }, [isBooted, isBooting, boot])

  // Check for API key
  const hasKey = hasAPIKey(provider)

  if (isBooting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/80 border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-lg">Initializing WebContainer...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center p-8">
        <Card className="p-8 bg-slate-900/80 border-yellow-500/20 backdrop-blur-sm max-w-2xl">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">API Key Required</h1>
            <p className="text-slate-400 mb-6">
              Please configure an API key for {provider} to use PyVax AI.
            </p>
            <div className="bg-slate-950/50 rounded-lg p-6 text-left mb-6">
              <h3 className="text-sm font-bold text-blue-400 mb-2">Quick Setup:</h3>
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                <li>Get an API key from your provider ({provider})</li>
                <li>Open Settings (gear icon)</li>
                <li>Add your API key</li>
                <li>Start chatting!</li>
              </ol>
            </div>
            <Button
              onClick={() => {
                // TODO: Open settings modal
                alert('Settings modal will open here. Add API key management UI.')
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
            >
              Open Settings
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-blue-500/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            PyVax AI
          </h1>
          <span className="text-xs text-slate-500">
            {provider} • {model}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleWorkbench}
            className="bg-slate-800 border-slate-700"
          >
            {showWorkbench ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            <span className="ml-2">{showWorkbench ? 'Hide' : 'Show'} Workbench</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area - Full implementation in Phase 5.2 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl">
                  <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome to PyVax AI
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Build production-ready dApps using natural language.
                    I can generate Python smart contracts, React frontends, and deploy to Avalanche.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    {[
                      'Create an ERC-20 token contract',
                      'Build a DeFi staking dApp',
                      'Generate an NFT marketplace',
                      'Audit my smart contract',
                    ].map((example) => (
                      <Card
                        key={example}
                        className="p-4 bg-slate-900/50 border-slate-700 hover:border-blue-500/50 cursor-pointer transition-colors"
                        onClick={() => sendMessage(example)}
                      >
                        <p className="text-sm text-slate-300">{example}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <Card
                  key={msg.id}
                  className={`p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-900/20 border-blue-500/30 ml-auto max-w-2xl'
                      : 'bg-slate-900/50 border-slate-700 max-w-3xl'
                  }`}
                >
                  <p className="text-slate-200 whitespace-pre-wrap">{msg.content}</p>
                </Card>
              ))
            )}
            {isStreaming && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
            {error && (
              <Card className="p-4 bg-red-900/20 border-red-500/30">
                <p className="text-red-400">Error: {error.message}</p>
              </Card>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe what you want to build..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    sendMessage(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                disabled={isStreaming}
              />
              <Button
                disabled={isStreaming}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
              </Button>
            </div>
          </div>
        </div>

        {/* Workbench - Shown when toggled */}
        {showWorkbench && (
          <div className="w-1/2 border-l border-slate-800 bg-slate-900/50">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-blue-400" />
                  Workbench
                </h3>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <p className="text-slate-400 text-sm">
                  Full workbench implementation with Monaco Editor, Terminal, and Preview coming in Phase 5.2-5.4
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isBooted ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span>WebContainer: {isBooted ? 'Ready' : 'Booting'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>API Key: {hasKey ? 'Configured' : 'Missing'}</span>
          </div>
        </div>
        <div>
          PyVax AI • Unified Interface • Phase 5 Integration
        </div>
      </div>
    </div>
  )
}
