import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { AICapabilities } from "@/components/ai-capabilities"
import { AIWorkflowDemo } from "@/components/ai-workflow-demo"
import { AIComparison } from "@/components/ai-comparison"
import { AICTASection } from "@/components/ai-cta-section"
import { BottomDockMenu } from "@/components/bottom-dock-menu"

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <BottomDockMenu />
      <main className="relative z-10">
        <HeroSection />
        <AICapabilities />
        <AIWorkflowDemo />
        <AIComparison />
        <AICTASection />
      </main>
      <Footer />
    </div>
  )
}
