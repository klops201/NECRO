'use client'

import { useState } from 'react'
import Link from 'next/link'
import CoinAnalysis from '../components/CoinAnalysis'
import ChatAnalyzer from '../components/ChatAnalyzer'
import { SolanaService } from '@/lib/solanaService'

interface CoinData {
  mint: string
  input: string
  name: string
  symbol: string
  image?: string
  address?: string
  price?: number
  marketCap?: number
  volume24h?: number
  holders?: {
    count: number
    topHolders: {
      address: string
      amount: string
      percentage: number
    }[]
  }
}

const CoinAnalyzer = () => {
  const [input, setInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState<CoinData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const startAnalysis = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setErrorMessage('')
    setAnalysisResult(null)

    try {
      const service = new SolanaService()
      const result = await service.analyzeCoin(input)
      setAnalysisResult({
        ...result,
        mint: input,
        input: input
      } as CoinData)
    } catch (error) {
      setErrorMessage('Analysis failed. Please try again.')
      console.error('Error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black/95 to-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-[#00fff2]/20 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-[#00fff2]/80 hover:text-[#00fff2] transition-colors">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">←</span>
                <span className="text-sm tracking-wider font-mono">BACK</span>
              </div>
            </Link>
            <div className="text-[#00fff2] font-mono text-sm">
              SOLANA COIN ANALYZER
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-24">
        {/* Description */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#00fff2] mb-4">Solana Token Analysis</h1>
          <p className="text-[#00fff2]/70 font-mono max-w-2xl mx-auto">
            Paste any Solana token address from pump.fun to analyze its metrics, 
            market data, and potential risks. Powered by advanced analysis algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/40 backdrop-blur rounded border border-[#00fff2]/20 p-6">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter Solana token address..."
                className="w-full bg-black/60 border border-[#00fff2]/20 rounded px-4 py-3 
                         text-[#00fff2] placeholder-[#00fff2]/40 focus:outline-none 
                         focus:border-[#00fff2] transition-all duration-300 font-mono"
              />
              <button
                onClick={startAnalysis}
                disabled={isProcessing || !input.trim()}
                className={`mt-4 w-full py-3 rounded transition-all duration-300 
                         flex items-center justify-center space-x-2 font-mono ${
                           isProcessing || !input.trim()
                             ? 'bg-[#00fff2]/5 text-[#00fff2]/40 cursor-not-allowed'
                             : 'bg-[#00fff2]/10 hover:bg-[#00fff2]/20 text-[#00fff2] border border-[#00fff2]/20'
                         }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#00fff2] border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Analyze Token</span>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-4 font-mono text-red-500">
                {errorMessage}
              </div>
            )}

            {analysisResult && (
              <div className="space-y-6">
                <CoinAnalysis data={analysisResult} />
                <ChatAnalyzer tokenData={analysisResult} />
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur rounded border border-[#00fff2]/20 p-6">
              <h2 className="text-[#00fff2] font-mono text-lg mb-4">How to Use</h2>
              <div className="space-y-4 text-[#00fff2]/70 font-mono text-sm">
                <p>1. Visit pump.fun</p>
                <p>2. Find a token you want to analyze</p>
                <p>3. Copy its Solana address</p>
                <p>4. Paste the address above</p>
                <p>5. Click Analyze Token</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinAnalyzer
