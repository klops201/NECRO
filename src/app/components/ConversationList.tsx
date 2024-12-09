'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { BiGridAlt, BiListUl, BiShare, BiUpvote } from 'react-icons/bi'

interface Memory {
  id: string
  created_at: string
  content: string
  upvotes: number
  category?: string
}

interface Props {
  sortBy: 'recent' | 'upvoted'
}

const ITEMS_PER_PAGE = 10
const CATEGORIES = ['All', 'Chill', 'Tech', 'Life', 'Philosophy', 'Random']

export default function ConversationList({ sortBy }: Props) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Real-time updates subscription
  useEffect(() => {
    const subscription = supabase
      .channel('conversations_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations' 
        }, 
        payload => {
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setMemories(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'DELETE') {
      setMemories(prev => prev.filter(memory => memory.id !== payload.old.id))
    } else if (payload.eventType === 'UPDATE') {
      setMemories(prev => prev.map(memory => 
        memory.id === payload.new.id ? payload.new : memory
      ))
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 60) {
        return `${minutes === 0 ? '1' : minutes}min ago`
      }
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) {
        return `${hours}h ago`
      }
      
      const days = Math.floor(hours / 24)
      if (days < 7) {
        return `${days}d ago`
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const fetchMemories = async (pageNumber: number, query: string = '', category: string = 'All') => {
    setIsLoading(true)
    try {
      let queryBuilder = supabase
        .from('conversations')
        .select('*')
      
      if (query) {
        queryBuilder = queryBuilder.ilike('content', `%${query}%`)
      }

      if (category !== 'All') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      queryBuilder = sortBy === 'recent'
        ? queryBuilder.order('created_at', { ascending: false })
        : queryBuilder.order('upvotes', { ascending: false })

      const { data, error } = await queryBuilder
        .range(pageNumber * ITEMS_PER_PAGE, (pageNumber + 1) * ITEMS_PER_PAGE - 1)

      if (error) throw error

      if (data) {
        setHasMore(data.length === ITEMS_PER_PAGE)
        if (pageNumber === 0) {
          setMemories(data)
        } else {
          setMemories(prev => [...prev, ...data])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpvote = async (memoryId: string) => {
    try {
      const { data, error } = await supabase.rpc('increment_upvotes', {
        memory_id: memoryId
      })
      if (error) throw error
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const handleShare = async (memory: Memory) => {
    try {
      await navigator.share({
        title: 'Check out this memory',
        text: memory.content,
        url: `/conversation/${memory.id}`
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setPage(prevPage => prevPage + 1)
        }
      },
      { threshold: 0.5 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading, hasMore])

  useEffect(() => {
    setPage(0)
    fetchMemories(0, searchQuery, selectedCategory)
  }, [sortBy, selectedCategory])

  useEffect(() => {
    if (page > 0) {
      fetchMemories(page, searchQuery, selectedCategory)
    }
  }, [page])

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-green-400 font-mono">LOADING SYMBIOTE DATA...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-green-500/20 p-4 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(0)
              fetchMemories(0, e.target.value, selectedCategory)
            }}
            className="w-full bg-black/50 border border-green-500/20 rounded px-4 py-3
                     text-green-400 placeholder-green-400/30 focus:outline-none focus:border-green-500
                     transition-all duration-300 font-mono"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2 overflow-x-auto pb-2">

          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-green-400/50 hover:text-green-400'
              }`}
            >
              <BiGridAlt size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-green-400/50 hover:text-green-400'
              }`}
            >
              <BiListUl size={20} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          className={`grid gap-4 p-4 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}
          layout
        >
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="group bg-black/40 backdrop-blur border border-green-500/20 rounded p-6
                          hover:border-green-500 hover:bg-green-500/5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center
                                bg-green-500/10 border border-green-500/30 transform rotate-45">
                      <div className="-rotate-45 font-bold text-green-400">V</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-mono">Memory #{memory.id}</div>
                      <div className="text-green-400/50 text-sm">{formatDate(memory.created_at)}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpvote(memory.id)}
                      className="p-2 rounded hover:bg-green-500/10 text-green-400/50 hover:text-green-400
                               transition-all"
                    >
                      <BiUpvote size={20} />
                    </button>
                    <button
                      onClick={() => handleShare(memory)}
                      className="p-2 rounded hover:bg-green-500/10 text-green-400/50 hover:text-green-400
                               transition-all"
                    >
                      <BiShare size={20} />
                    </button>
                  </div>
                </div>

                <Link href={`/conversation/${memory.id}`}>
                  <p className="text-green-400/80 line-clamp-3 mb-4 font-mono cursor-pointer">
                    {memory.content}
                  </p>
                </Link>

                <div className="flex justify-between items-center pt-4 border-t border-green-500/20">
                  <div className="text-green-400/50 text-sm">
                    {memory.category || 'MEMORY STRAND'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400/50">{memory.upvotes} upvotes</span>
                    <span className="text-green-400/30 group-hover:text-green-400 transition-colors duration-300 font-mono">
                      Access Memory →
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div ref={loaderRef} className="p-8 text-center">
        {isLoading ? (
          <div className="flex justify-center items-center space-x-3">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-green-400/50 font-mono">Synthesizing memories...</span>
          </div>
        ) : !hasMore && memories.length > 0 ? (
          <div className="text-green-400/30 font-mono">Memory sequence complete</div>
        ) : memories.length === 0 && (
          <div className="text-green-400/30 font-mono">No memories found</div>
        )}
      </div>
    </div>
  )
}
