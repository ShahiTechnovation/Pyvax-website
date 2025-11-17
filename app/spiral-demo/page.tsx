"use client"

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function SpiralDemoPage() {
  const [startVisible, setStartVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Spiral Animation Background */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Overlay Content */}
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center z-10
          transition-all duration-1500 ease-out
          ${startVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-light tracking-widest text-white">PyVax AI</h1>
          <p className="text-xl text-gray-300 tracking-wide">Agentic AI dApps Building Platform</p>

          <div className="flex gap-6 justify-center pt-8">
            <Link
              href="/pyvax-ai"
              className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              Build dApp
            </Link>
            <Link href="/" className="px-8 py-3 bg-white text-black hover:bg-gray-200 transition-all duration-300">
              Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
