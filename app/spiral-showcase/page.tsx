"use client"

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { Code, Zap, Shield, Cpu, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SpiralShowcase() {
  const features = [
    {
      icon: Code,
      title: "Python-First",
      description: "Write smart contracts in Python",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Compile in milliseconds",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Built-in security checks",
    },
    {
      icon: Cpu,
      title: "EVM Compatible",
      description: "Deploy anywhere",
    },
  ]

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Spiral Animation Background */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          {/* Hero Text */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-mono font-bold text-white tracking-tight">PyVax</h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light">Dotted</p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Transform your Python code into optimized Solidity contracts with AI-powered agents
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/ai"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Build with AI
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/"
              className="px-8 py-3 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-mono rounded-lg transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid - Bottom Section */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 text-center hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="flex justify-center mb-2">
                  <feature.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-sm font-mono text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none z-5" />
    </div>
  )
}
