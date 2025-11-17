'use client'

/**
 * API Key Banner - Inline API key input (Bolt.diy style)
 * Shows at the top of the chat when no API key is configured
 */

import { useState } from 'react'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Key, X, Check, Eye, EyeOff } from 'lucide-react'

interface APIKeyBannerProps {
  provider: string
  onDismiss?: () => void
}

export function APIKeyBanner({ provider, onDismiss }: APIKeyBannerProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const setAPIKey = useSettingsStore((state) => state.setAPIKey)

  const handleSave = async () => {
    if (!apiKey.trim()) return

    setIsSaving(true)
    
    // Save to store (persists to localStorage)
    setAPIKey(provider, apiKey.trim())
    
    // Show success feedback
    setSaved(true)
    
    setTimeout(() => {
      setIsSaving(false)
      onDismiss?.()
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  const getProviderInfo = (provider: string) => {
    const info: Record<string, { name: string; url: string; placeholder: string }> = {
      openai: {
        name: 'OpenAI',
        url: 'https://platform.openai.com/api-keys',
        placeholder: 'sk-...',
      },
      anthropic: {
        name: 'Anthropic',
        url: 'https://console.anthropic.com/account/keys',
        placeholder: 'sk-ant-...',
      },
      google: {
        name: 'Google AI',
        url: 'https://aistudio.google.com/app/apikey',
        placeholder: 'AIza...',
      },
      mistral: {
        name: 'Mistral AI',
        url: 'https://console.mistral.ai/api-keys',
        placeholder: '...',
      },
      cohere: {
        name: 'Cohere',
        url: 'https://dashboard.cohere.com/api-keys',
        placeholder: '...',
      },
      openrouter: {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/keys',
        placeholder: 'sk-or-...',
      },
      groq: {
        name: 'Groq',
        url: 'https://console.groq.com/keys',
        placeholder: 'gsk_...',
      },
    }
    
    return info[provider] || { name: provider, url: '#', placeholder: '...' }
  }

  const providerInfo = getProviderInfo(provider)

  if (saved) {
    return (
      <Card className="bg-green-900/20 border-green-500/30 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-400">
                API Key Saved!
              </p>
              <p className="text-xs text-slate-400">
                You can now start chatting with {providerInfo.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-blue-900/20 border-blue-500/30 p-4 mb-4">
      <div className="flex items-start gap-3">
        <Key className="w-5 h-5 text-blue-400 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">
              {providerInfo.name} API Key Required
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-slate-400 mb-3">
            Get your API key from{' '}
            <a
              href={providerInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {providerInfo.name}
            </a>
            {' '}and enter it below to start using PyVax AI.
          </p>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder={providerInfo.placeholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={handleKeyPress}
                className="bg-slate-900 border-slate-700 text-white pr-10"
                disabled={isSaving}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
      </div>
    </Card>
  )
}
