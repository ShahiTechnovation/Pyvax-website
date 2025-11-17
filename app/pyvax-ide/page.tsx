'use client'

import { BottomDockMenu } from "@/components/bottom-dock-menu"
import { UnifiedIDE } from "@/components/pyvax-ai/unified-ide"

export default function PyVaxIDEPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      
      {/* Bottom Navigation */}
      <BottomDockMenu />
      
      {/* IDE */}
      <div className="relative flex flex-col h-screen pt-0">
        <UnifiedIDE />
      </div>
    </div>
  )
}
