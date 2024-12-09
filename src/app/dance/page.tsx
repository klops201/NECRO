'use client'
import { motion } from 'framer-motion'
import Navbar from "../components/Navbar"
import { Scene3D } from "../components/DanceScene"

export default function DancePage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-black">
        {/* 3D Scene */}
        <Scene3D />

        {/* Title Overlay */}
        <motion.div 
          className="fixed top-24 w-full z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-red-400 text-center max-w-6xl mx-auto px-4 whitespace-nowrap">
            Watch the eternal dance of the undead
          </h1>
        </motion.div>

        {/* Bottom Text */}
        <div className="fixed bottom-8 w-full z-30">  {/* Changed positioning here */}
          <motion.p 
            className="text-red-400/60 text-center max-w-2xl mx-auto px-4"  
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            "When it's time to die, let us not discover that we have never lived." — Henry David Thoreau 
          </motion.p>
        </div>
      </main>
    </>
  )
}
