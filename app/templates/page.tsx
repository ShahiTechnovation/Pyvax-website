import { Footer } from "@/components/footer"
import { BottomDockMenu } from "@/components/bottom-dock-menu"
import { TemplateGrid } from "@/components/template-grid"
import { TemplateCategories } from "@/components/template-categories"
import { TemplateSearch } from "@/components/template-search"

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <BottomDockMenu />
      <main className="space-y-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-red-500/10" />

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-mono font-bold text-white mb-6">
              Smart Contract <span className="gradient-text">Templates</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed">
              Jump-start your development with battle-tested smart contract templates written in Python
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 transform hover:scale-105">
                Browse Templates
              </button>
              <button className="border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 bg-transparent">
                Submit Template
              </button>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <TemplateSearch />
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">Template Categories</h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Explore templates organized by use case and complexity
              </p>
            </div>
            <TemplateCategories />
          </div>
        </section>

        {/* Template Grid */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">Popular Templates</h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Most used and highly rated templates from the community
              </p>
            </div>
            <TemplateGrid />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
