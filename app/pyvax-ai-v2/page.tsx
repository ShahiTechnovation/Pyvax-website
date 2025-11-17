'use client'

import { useState } from 'react'
import { MinimalEditor } from '@/components/pyvax-ai-v2/minimal-editor'
import { MinimalChat } from '@/components/pyvax-ai-v2/minimal-chat'
import { MinimalHeader } from '@/components/pyvax-ai-v2/minimal-header'
import { Logo } from '@/components/ui/logo'

export default function PyVaxAIv2Page() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code)
    setIsGenerating(false)
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Minimal Header */}
      <MinimalHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden border-t">
        {/* Left: Chat Panel */}
        <div className="w-96 border-r flex flex-col bg-gray-50">
          <MinimalChat
            onCodeGenerated={handleCodeGenerated}
            onGeneratingChange={setIsGenerating}
          />
        </div>

        {/* Right: Code Editor */}
        <div className="flex-1 flex flex-col">
          <MinimalEditor 
            code={generatedCode}
            onChange={setGeneratedCode}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}
