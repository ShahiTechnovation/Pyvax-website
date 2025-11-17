'use client'

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'

interface IntroScreenProps {
  onComplete: () => void
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [startVisible, setStartVisible] = useState(false)
  
  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-50">
      {/* Spiral Animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>
      
      {/* PyVax Logo/Title and Enter Button */}
      <div 
        className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-1500 ease-out flex flex-col items-center gap-8
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* PyVax Title */}
        <h1 className="text-6xl md:text-8xl font-bold gradient-text font-mono">
          PyVax
        </h1>
        
        {/* Subtitle */}
        <p className="text-white/70 text-lg md:text-xl tracking-wider">
          Build Full Stack Dapps
        </p>
        
        {/* Enter Button */}
        <button 
          onClick={onComplete}
          className="
            mt-8 text-white text-xl md:text-2xl tracking-[0.2em] uppercase font-extralight
            transition-all duration-700 px-8 py-3 border border-white/30 rounded-lg
            hover:tracking-[0.3em] hover:border-white/60 hover:bg-white/5
            animate-pulse hover:animate-none
          "
        >
          Enter
        </button>
      </div>
    </div>
  )
}
