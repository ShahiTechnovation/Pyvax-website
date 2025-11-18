'use client'

/**
 * Provider Selector - Choose AI provider and model
 * Displays in header for quick provider switching
 */

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
    console.log('Switching to:', newProvider, newModel)
    setProvider(newProvider, newModel)
  }

  const currentModel = allModels.find((m) => m.id === model && m.provider === provider)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
        >
          <span className="text-xs truncate max-w-[150px]">
            {currentModel?.name || 'Select Model'}
          </span>
          <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-72 max-h-[500px] overflow-y-auto bg-slate-900 border-slate-700 text-white"
        align="end"
      >
        {providers.map((prov, provIndex) => (
          <div key={prov}>
            <DropdownMenuLabel className="text-xs text-slate-400 uppercase flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <span>{prov}</span>
              {!hasAPIKey(prov) && (
                <span className="text-xs text-red-400 normal-case">(No Key)</span>
              )}
            </DropdownMenuLabel>

            {groupedModels[prov].map((m) => {
              const isSelected = m.id === model && m.provider === provider
              const isDisabled = !hasAPIKey(m.provider)

              return (
                <DropdownMenuItem
                  key={`${m.provider}-${m.id}`}
                  onClick={() => !isDisabled && handleSelectModel(m.provider, m.id)}
                  className={`text-sm cursor-pointer ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed text-slate-500' 
                      : 'text-white hover:bg-slate-800'
                  } ${isSelected ? 'bg-slate-800' : ''}`}
                  disabled={isDisabled}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>{(m.contextWindow / 1000).toFixed(0)}K tokens</span>
                        {m.pricing && (
                          <span className="text-slate-500">
                            ${m.pricing.input.toFixed(2)}/${m.pricing.output.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}

            {provIndex < providers.length - 1 && (
              <DropdownMenuSeparator className="bg-slate-700 my-1" />
            )}
          </div>
        ))}

        <DropdownMenuSeparator className="bg-slate-700 my-1" />
        <div className="px-2 py-2 text-xs text-slate-500 text-center">
          💡 Add API keys to unlock more models
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
