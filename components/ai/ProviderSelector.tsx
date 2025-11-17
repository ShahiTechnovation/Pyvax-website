'use client'

/**
 * Provider Selector - Choose AI provider and model
 * Displays in header for quick provider switching
 */

import { useState } from 'react'
import { useAIProvider } from '@/lib/ai'
import { LLMManager } from '@/lib/ai/llm-manager'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ProviderSelector() {
  const { provider, model, setProvider, hasAPIKey } = useAIProvider()
  const [open, setOpen] = useState(false)

  // Get all available models
  const allModels = LLMManager.getAllModels()

  // Group by provider
  const groupedModels = allModels.reduce((acc, m) => {
    if (!acc[m.provider]) {
      acc[m.provider] = []
    }
    acc[m.provider].push(m)
    return acc
  }, {} as Record<string, typeof allModels>)

  const providers = Object.keys(groupedModels)

  const handleSelectModel = (newProvider: string, newModel: string) => {
    setProvider(newProvider, newModel)
    setOpen(false)
  }

  const currentModel = allModels.find((m) => m.id === model && m.provider === provider)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
        >
          <span className="text-xs">
            {currentModel?.name || 'Select Model'}
          </span>
          <ChevronDown className="w-3 h-3 ml-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto bg-slate-900 border-slate-700">
        {providers.map((prov) => (
          <div key={prov}>
            <DropdownMenuLabel className="text-xs text-slate-400 uppercase">
              {prov}
              {!hasAPIKey(prov) && (
                <span className="ml-2 text-red-400">(No Key)</span>
              )}
            </DropdownMenuLabel>

            {groupedModels[prov].map((m) => (
              <DropdownMenuItem
                key={m.id}
                onClick={() => handleSelectModel(m.provider, m.id)}
                className="text-sm text-white hover:bg-slate-800 cursor-pointer"
                disabled={!hasAPIKey(m.provider)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-slate-400">
                      {m.contextWindow.toLocaleString()} tokens
                      {m.pricing && (
                        <span className="ml-2">
                          ${m.pricing.input}/{m.pricing.output}
                        </span>
                      )}
                    </div>
                  </div>
                  {m.id === model && m.provider === provider && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="bg-slate-700" />
          </div>
        ))}

        <DropdownMenuLabel className="text-xs text-slate-500">
          Add API keys to enable more providers
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
