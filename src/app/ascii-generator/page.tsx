'use client'

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

export default function ASCIIGenerator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const outputRef = useRef<HTMLPreElement>(null)

  const generatePattern = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setError(null)
    setOutput('')

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': '$AiGuy ASCII Generator'
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-opus-20240229",
          messages: [
            {
              role: "system",
              content: "Generate AiGuy-themed ASCII art patterns. Output raw pattern only."
            },
            {
              role: "user",
              content: `Create a AiGuy-themed ASCII art pattern for: ${input}`
            }
          ],
          temperature: 0.8,
        })
      })

      if (!response.ok) throw new Error('Generation Failed')

      const data = await response.json()
      setOutput(data.choices[0].message.content.trim())
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'System Error')
    } finally {
      setIsProcessing(false)
    }
  }

  const exportPattern = async () => {
    if (!output || !outputRef.current) return

    try {
      const canvas = await html2canvas(outputRef.current, {
        backgroundColor: '#000000',
      })
      
      const link = document.createElement('a')
      link.download = `AiGuy-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      setError('Export Failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Quick Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-green-400/70"
          >
            <h2 className="text-2xl font-bold text-green-400 mb-4">ASCII Art Generator</h2>

          </motion.div>

          <div className="w-full space-y-6">
            {/* Input Section */}
            <motion.div 
              className="bg-black/40 border border-green-500/20 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generatePattern()}
                  placeholder="Enter your prompt..."
                  className="flex-1 bg-black/60 border border-green-500/30 rounded px-4 py-2 text-green-400 placeholder-green-400/30 focus:outline-none focus:border-green-400 font-mono"
                />
                <motion.button
                  onClick={generatePattern}
                  disabled={isProcessing || !input.trim()}
                  className={`px-6 py-2 bg-green-500/10 border border-green-500/30 rounded font-mono 
                    ${isProcessing || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500/20'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2 text-green-400">
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Generate</span>
                    )}
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Output Display */}
            <AnimatePresence>
              {output && (
                <motion.div 
                  className="bg-black/40 border border-green-500/20 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-green-400/60 font-mono text-sm">Output</div>
                    <motion.button
                      onClick={exportPattern}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded hover:bg-green-500/20 font-mono text-sm text-green-400"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Export
                    </motion.button>
                  </div>
                  <pre
                    ref={outputRef}
                    className="p-4 bg-black/60 border border-green-500/30 rounded font-mono text-green-400 overflow-x-auto"
                  >
                    {output}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-red-400 font-mono text-sm">{error}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
