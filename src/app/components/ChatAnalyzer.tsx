'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
  timestamp: string
  mode?: 'analyze' | 'predict' | 'risk'
}

interface TokenAnalyzerProps {
  tokenData: {
    name: string
    symbol: string
    image?: string
    input: string
    holders?: {
      count: number
      topHolders: {
        address: string
        amount: string
        percentage: number
      }[]
    }
  }
}

const ANALYSIS_COOLDOWN = 60

const TokenAnalyzer: React.FC<TokenAnalyzerProps> = ({ tokenData }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [analysisMode, setAnalysisMode] = useState<'analyze' | 'predict' | 'risk'>('analyze')
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null)
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    startAnalysis()
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current)
      }
    }
  }, [tokenData])

  const startCooldown = () => {
    setCooldown(ANALYSIS_COOLDOWN)
    cooldownIntervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const generatePrompt = () => {
    const analysisTime = new Date().toISOString()
    
    return `
      Token Analysis Request
      Time: ${analysisTime}
      Mode: ${analysisMode.toUpperCase()}
      
      Token Metrics:
      - Name: ${tokenData.name}
      - Symbol: ${tokenData.symbol}
      - Total Holders: ${tokenData.holders?.count || 'UNKNOWN'}
      
      Holder Distribution:
      ${tokenData.holders?.topHolders.slice(0, 5).map((holder, i) => 
        `Holder ${i + 1}: ${holder.percentage.toFixed(2)}% (${Number(holder.amount).toLocaleString()})`
      ).join('\n') || 'No distribution data available'}
      
      Analysis Requirements:
      1. Market Analysis
      2. Risk Assessment
      3. Distribution Analysis
      4. Future Predictions
      5. Investment Considerations
    `
  }

  const startAnalysis = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL!,
          'X-Title': 'Token Analyzer'
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-opus-20240229",
          messages: [
            {
              role: 'system',
              content: `You are an advanced token analysis system. Analyze tokens and provide detailed insights.`
            },
            {
              role: 'user',
              content: generatePrompt()
            }
          ],
          max_tokens: 3000,
          temperature: 0.7
        })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: data.choices[0].message.content,
        timestamp: new Date().toLocaleTimeString(),
        mode: analysisMode
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: 'Analysis failed. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        mode: analysisMode
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  // UI remains largely the same, just updated terminology
  return (
    <div className="min-h-[600px] bg-black/90 rounded border border-[#00fff2]/20">
      {/* Header with analysis modes */}
      <div className="flex border-b border-[#00fff2]/20">
        {[
          { id: 'analyze', label: 'Market Analysis', icon: '📊' },
          { id: 'predict', label: 'Price Prediction', icon: '📈' },
          { id: 'risk', label: 'Risk Assessment', icon: '⚠️' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setAnalysisMode(mode.id as any)}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 font-mono
                     transition-all duration-300 ${
                       analysisMode === mode.id
                         ? 'bg-[#00fff2]/10 text-[#00fff2]'
                         : 'text-[#00fff2]/50 hover:bg-[#00fff2]/5'
                     }`}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="h-[400px] overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="bg-black/60 rounded border border-[#00fff2]/20 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#00fff2]/60 text-sm font-mono">
                {message.type === 'user' ? 'User Query' : 'AI Analysis'}
              </span>
              <span className="text-[#00fff2]/40 text-xs font-mono">{message.timestamp}</span>
            </div>
            <div className="text-[#00fff2] whitespace-pre-wrap font-mono">
              {message.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00fff2] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Analysis Controls */}
      <div className="border-t border-[#00fff2]/20 p-4">
        <button
          onClick={startAnalysis}
          disabled={isProcessing || cooldown > 0}
          className="w-full py-3 rounded font-mono
                   bg-[#00fff2]/10 hover:bg-[#00fff2]/20 
                   border border-[#00fff2]/20 text-[#00fff2]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300"
        >
          {isProcessing ? 'Analyzing...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Start Analysis'}
        </button>
      </div>
    </div>
  )
}

export default TokenAnalyzer
