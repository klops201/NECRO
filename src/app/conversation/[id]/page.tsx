'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Memory {
  id: string
  created_at: string
  content: string
  upvotes: number
  category?: string
}

interface PageProps {
  params: { id: string }
}

interface SystemMetrics {
  stability: number
  sync: number
  power: number
}

export default function MemoryView({ params }: PageProps) {
  const [memory, setMemory] = useState<Memory | null>(null)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    stability: Math.random() * (100 - 80) + 80, // Always high stability
    sync: Math.random() * (100 - 85) + 85,      // High sync rate
    power: Math.random() * (100 - 90) + 90      // High power level
  })

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setSystemMetrics(prev => ({
        stability: Math.max(80, Math.min(100, prev.stability + (Math.random() - 0.5) * 2)),
        sync: Math.max(85, Math.min(100, prev.sync + (Math.random() - 0.5) * 2)),
        power: Math.max(90, Math.min(100, prev.power + (Math.random() - 0.5) * 2))
      }))
    }, 2000)

    return () => clearInterval(metricsInterval)
  }, [])

  useEffect(() => {
    const checkUpvoteStatus = () => {
      const upvoteLog = JSON.parse(localStorage.getItem('AiGuy_upvotes') || '[]')
      setHasUpvoted(upvoteLog.includes(params.id))
    }

    const fetchMemoryData = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) setMemory(data)
    }

    fetchMemoryData()
    checkUpvoteStatus()

    // Real-time subscription
    const subscription = supabase
      .channel(`memory_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${params.id}`
        },
        (payload) => {
          if (payload.new) {
            setMemory(payload.new as Memory)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [params.id])

  const handleUpvote = async () => {
    if (!memory || isUpvoting || hasUpvoted) return

    setIsUpvoting(true)
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ upvotes: memory.upvotes + 1 })
        .eq('id', memory.id)

      if (error) throw error

      // Save upvote status locally
      const upvoteLog = JSON.parse(localStorage.getItem('AiGuy_upvotes') || '[]')
      upvoteLog.push(memory.id)
      localStorage.setItem('AiGuy_upvotes', JSON.stringify(upvoteLog))
      setHasUpvoted(true)

    } catch (error) {
      console.error('Upvote Error:', error)
    } finally {
      setIsUpvoting(false)
    }
  }
  if (!memory) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-green-400 font-mono">LOADING SYMBIOTE DATA...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-green-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-green-400/80 hover:text-green-400 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="text-sm tracking-wider font-mono">RETURN</span>
            </Link>
            <div className="flex items-center space-x-6">
              {Object.entries(systemMetrics).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center space-y-1">
                  <div className="w-24 h-1 bg-green-500/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-green-400/50 text-xs uppercase font-mono">
                    {key}: {value.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/40 backdrop-blur rounded-lg border border-green-500/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl text-green-400 font-mono">Memory Fragment</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400/70 text-sm font-mono">LIVE</span>
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-green-400/90 font-mono whitespace-pre-wrap">
                  {memory.content}
                </p>
              </div>
            </div>

            {/* Upvote Button */}
            <div className="bg-black/40 backdrop-blur rounded-lg border border-green-500/20 p-6">
              <button
                onClick={handleUpvote}
                disabled={isUpvoting || hasUpvoted}
                className={`w-full py-4 rounded-lg transition-all duration-300 font-mono flex items-center justify-center gap-2
                  ${hasUpvoted 
                    ? 'bg-green-500/5 text-green-400/50 cursor-not-allowed' 
                    : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
              >
                <span className="material-icons">
                  {hasUpvoted ? 'check' : 'arrow_upward'}
                </span>
                <span>
                  {hasUpvoted ? 'UPVOTED' : 'UPVOTE'} ({memory.upvotes})
                </span>
              </button>
            </div>
          </div>

          {/* Memory Details */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur rounded-lg border border-green-500/20 p-6">
              <h2 className="text-green-400/70 text-sm uppercase mb-4 font-mono">Memory Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-400/50 font-mono">Category</span>
                  <span className="text-green-400 font-mono">{memory.category || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400/50 font-mono">Created</span>
                  <span className="text-green-400 font-mono">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400/50 font-mono">Upvotes</span>
                  <span className="text-green-400 font-mono">{memory.upvotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400/50 font-mono">ID</span>
                  <span className="text-green-400 font-mono">{memory.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
