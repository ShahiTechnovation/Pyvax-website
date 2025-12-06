'use client'

/**
 * PyVax AI Page - Embedded Bolt.diy Clone
 * Full-featured AI coding assistant with WebContainer support
 */

import { useEffect, useState } from 'react'
import { Loader2, Sparkles, ExternalLink, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PyVaxAIPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isServerRunning, setIsServerRunning] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  // Embedded project runs on port 5173 (Vite default for Remix)
  const EMBEDDED_URL = 'http://localhost:5173'

  // Check if the embedded server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(EMBEDDED_URL, { method: 'HEAD' })
        if (response.ok) {
          setIsServerRunning(true)
          setIsLoading(false)
        }
      } catch (error) {
        setIsServerRunning(false)
        setIsLoading(false)
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/80 border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-lg">Checking AI Server...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!isServerRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-900/80 border-blue-500/20 backdrop-blur-sm max-w-2xl">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              PyVax AI Server Not Running
            </h1>
            <p className="text-slate-400 mb-6">
              The AI coding assistant needs to be started separately. Please run the following commands:
            </p>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 mb-6 text-left">
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{`# Navigate to the AI project
cd hacked3.0-main

# Install dependencies (first time only)
pnpm install

# Start the AI server
pnpm run dev`}</code>
              </pre>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              The AI server will start on <span className="text-blue-400 font-mono">{EMBEDDED_URL}</span>
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
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
            PyVax AI - Coding Assistant
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="bg-slate-800 border-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(EMBEDDED_URL, '_blank')}
            className="bg-slate-800 border-slate-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Embedded AI Interface */}
      <div className="flex-1 relative">
        <iframe
          key={iframeKey}
          src={EMBEDDED_URL}
          className="w-full h-full border-0"
          title="PyVax AI Coding Assistant"
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>AI Server: Running</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-blue-400">{EMBEDDED_URL}</span>
          </div>
        </div>
        <div>
          PyVax AI • Full-Stack Coding Assistant • Powered by WebContainer
        </div>
      </div>
    </div>
  )
}
