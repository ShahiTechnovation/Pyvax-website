import { BottomDockMenu } from "@/components/bottom-dock-menu"
import { ProjectGenerator } from "@/components/pyvax-ai/project-generator"
import { Logo } from "@/components/ui/logo"

export default function PyVaxAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
      
      <BottomDockMenu />
      
      <main className="relative min-h-screen pt-4 px-4 pb-4">
        <div className="max-w-[1800px] mx-auto flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-3">
              <Logo size={48} showText={false} />
              <div>
                <h1 className="text-4xl font-bold text-white">
                  PyVax <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Generate production-ready smart contracts and dApps with AI
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 pb-8">
            <ProjectGenerator />
          </div>
        </div>
      </main>
    </div>
  )
}
