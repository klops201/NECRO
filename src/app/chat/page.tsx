'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from "../components/Navbar"
import { Scene3D } from "../components/Scene"
import ChatComponent from "../components/ChatComponent"

interface BloodDrop {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  length: number;
}

export default function ChatPage() {
  const [bloodDrops, setBloodDrops] = useState<BloodDrop[]>([])
  
  useEffect(() => {
    const initialDrops = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -(Math.random() * 100),
      size: Math.random() * 3 + 2,
      speed: Math.random() * 0.2 + 0.1,
      opacity: Math.random() * 0.4 + 0.6,
      length: Math.random() * 30 + 20
    }))
    setBloodDrops(initialDrops)

    const dropInterval = setInterval(() => {
      setBloodDrops(prev => prev.map(drop => ({
        ...drop,
        y: drop.y >= 100 ? -(Math.random() * 20) : drop.y + drop.speed
      })))
    }, 16)

    return () => clearInterval(dropInterval)
  }, [])

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-black overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 bg-red-900/5 backdrop-blur-sm z-10" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black z-20" />
        
        {/* Blood Drops
        <div className="fixed inset-0 z-15 overflow-hidden pointer-events-none">
          {bloodDrops.map(drop => (
            <div
              key={drop.id}
              className="absolute"
              style={{
                left: `${drop.x}%`,
                top: `${drop.y}%`,
                width: `${drop.size}px`,
                height: `${drop.length}px`,
                background: 'linear-gradient(180deg, rgba(255,0,0,0.8) 0%, rgba(139,0,0,1) 100%)',
                borderRadius: '40% 40% 45% 45%',
                opacity: drop.opacity,
                transform: 'translateZ(0)',
                willChange: 'transform',
                boxShadow: '0 0 4px rgba(139,0,0,0.3)'
              }}
            />
          ))}
        </div> */}

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-25" />
        
        {/* 3D Scene */}
        <Scene3D />

        {/* Title Overlay */}
        <motion.div 
          className="fixed top-24 w-full z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-red-400 text-center max-w-6xl mx-auto px-4 whitespace-nowrap drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">
            Chat me if you dare...
          </h1>
        </motion.div>

        {/* Chat Component */}
        <div className="relative z-30 container mx-auto px-4 mt-32"> {/* Added margin-top */}
          <div className="max-h-[70vh] overflow-y-auto"> {/* Added max height */}
            <ChatComponent />
          </div>
        </div>
      </main>
    </>
  )
}
