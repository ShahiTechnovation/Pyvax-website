'use client'

/**
 * PyVax AI Page
 * Full-featured AI agent for building dApps
 * Uses Bolt.diy (hacked3.0-main) running on port 5173
 */

import { useEffect, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PyVaxAIPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isServerRunning, setIsServerRunning] = useState(false)

  useEffect(() => {
    checkAIServer()
  }, [])

  const checkAIServer = async () => {
    try {
      const response = await fetch('http://localhost:5173', { mode: 'no-cors' })
      setIsServerRunning(true)
      setIsLoading(false)
    } catch (error) {
      setIsServerRunning(false)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/80 border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-lg">Checking AI server...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!isServerRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center p-8">
        <Card className="p-8 bg-slate-900/80 border-yellow-500/20 backdrop-blur-sm max-w-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">🤖 PyVax AI Server Not Running</h1>
            <p className="text-slate-400 mb-6">
              The AI server needs to be started separately. Follow these steps:
            </p>
            
            <div className="bg-slate-950/50 rounded-lg p-6 text-left space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-blue-400 mb-2">Step 1: Open New Terminal</h3>
                <p className="text-xs text-slate-400">Open a new terminal/command prompt window</p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-blue-400 mb-2">Step 2: Navigate to AI Folder</h3>
                <code className="block bg-slate-900 p-2 rounded text-xs text-green-400">
                  cd c:\Users\nothi\Downloads\pyvax-website\hacked3.0-main
                </code>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-blue-400 mb-2">Step 3: Start AI Server</h3>
                <code className="block bg-slate-900 p-2 rounded text-xs text-green-400">
                  pnpm run dev
                </code>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-blue-400 mb-2">Step 4: Wait for Server</h3>
                <p className="text-xs text-slate-400">Wait for "Local: http://localhost:5173" message</p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-blue-400 mb-2">Step 5: Refresh This Page</h3>
                <p className="text-xs text-slate-400">Come back here and refresh the page</p>
              </div>
            </div>

            <Button
              onClick={checkAIServer}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
            >
              Check Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-blue-500/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            PyVax AI Agent
          </h1>
          <span className="text-xs text-slate-500">Powered by Bolt.diy</span>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="http://localhost:5173" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </a>
          <a href="/playground">
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700">
              Back to IDE
            </Button>
          </a>
        </div>
      </div>

      {/* AI Interface (iframe) */}
      <iframe
        src="http://localhost:5173"
        className="flex-1 w-full border-0"
        title="PyVax AI Agent"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}
