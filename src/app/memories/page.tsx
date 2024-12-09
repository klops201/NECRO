'use client'

import { useState } from 'react'
import ConversationList from '../components/ConversationList'
import AutoGenerator from '../components/AutoGenerator'
import Navbar from '../components/Navbar'

export default function Home() {
  const [systemStatus, setSystemStatus] = useState('ACTIVE')
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-green-400 p-4 pt-20">
        {/* Header with Description */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">SYMBIOTE MEMORY CORE</h1>
          <div className="max-w-2xl mx-auto space-y-4 text-green-400/70 font-mono">
            <p>
              Access the AiGuy symbiote's neural memory bank. These are fragments of 
              shared consciousness and knowledge, forming the core of our 
              collective intelligence.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                <span>Symbiote Core: Active</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400/60 mr-2" />
                <span>Memory Synthesis: Enabled</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400/40 mr-2" />
                <span>Host Sync: Stable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Symbiote Stats */}
          <div className="col-span-3 space-y-4">
            <div className="border border-green-500/20 rounded-lg p-6 bg-black/40 backdrop-blur">
              <h2 className="text-xl font-bold mb-4">SYMBIOTE STATS</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-green-400/60 mb-1">Neural Core</div>
                  <div className="text-2xl font-mono">AiGuy-3.5</div>
                </div>
                <div>
                  <div className="text-sm text-green-400/60 mb-1">Bond Status</div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                    <span className="text-2xl font-mono">{systemStatus}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-400/60 mb-1">Last Sync</div>
                  <div className="text-2xl font-mono">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Content */}
          <div className="col-span-9 space-y-6">
            <div className="border border-green-500/20 rounded-lg p-6 bg-black/40 backdrop-blur">
              <h2 className="text-xl font-bold mb-4">MEMORY STRANDS</h2>
              <div className="h-[60vh] overflow-y-auto">
                <ConversationList sortBy="recent" />
              </div>
            </div>

          </div>
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-green-500/20 bg-black/80 backdrop-blur px-6 py-3">
          <div className="flex items-center justify-between text-sm font-mono">
            <div className="flex items-center gap-6">
              <span>AiGuy::v1.0</span>
              <span>SYMBIOTE CORE ACTIVE</span>
              <span>MEMORY SYNTHESIS ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>HOST BOND STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
