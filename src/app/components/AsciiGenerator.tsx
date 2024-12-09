'use client'

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

interface Log {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export default function ASCIIGenerator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<Log[]>([])
  const outputRef = useRef<HTMLPreElement>(null)

  const addLog = (message: string, type: Log['type'] = 'info') => {
    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      message,
      type
    }
    setLogs(prev => [...prev.slice(-6), newLog])
  }

  const generateASCII = async () => {
    if (!input.trim()) {
      addLog('Please enter something to generate ASCII art', 'warning')
      return
    }

    setIsProcessing(true)
    setError(null)
    setOutput('')
    addLog('Generating ASCII art...', 'info')

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ASCII Art Generator'
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-opus-20240229",
          messages: [
            {
              role: "user",
              content: `Create ASCII art for: ${input}`
            }
          ],
          temperature: 0.8,
        })
      })

      if (!response.ok) throw new Error('Failed to generate ASCII art')

      const data = await response.json()
      setOutput(data.choices[0].message.content.trim())
      addLog('ASCII art generated successfully', 'success')
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Generation failed')
      addLog('Failed to generate ASCII art', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const saveASCII = async () => {
    if (!output) return
    addLog('Saving ASCII art...', 'info')

    try {
      if (outputRef.current) {
        const canvas = await html2canvas(outputRef.current, {
          backgroundColor: '#ffffff',
        })
        
        const link = document.createElement('a')
        link.download = `ASCII-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        addLog('ASCII art saved successfully', 'success')
      }
    } catch (err) {
      setError('Failed to save ASCII art')
      addLog('Save failed', 'error')
    }
  }

  return (
    <div className="w-full space-y-6">
      <motion.div 
        className="bg-white/5 border border-gray-700 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateASCII()}
            placeholder="Describe what you want to generate..."
            className="flex-1 bg-black/20 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <motion.button
            onClick={generateASCII}
            disabled={isProcessing || !input.trim()}
            className={`px-6 py-2 bg-white/5 border border-gray-700 rounded
              ${isProcessing || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2 text-white">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating</span>
                </>
              ) : (
                <span>Generate</span>
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="bg-white/5 border border-gray-700 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-gray-400 text-xs mb-2">Logs:</div>
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`text-xs ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-400'
                }`}
              >
                [{log.time}] {log.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {output && (
          <motion.div 
            className="bg-white/5 border border-gray-700 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-400 text-sm">Generated ASCII Art</div>
              <motion.button
                onClick={saveASCII}
                className="px-4 py-2 bg-white/5 border border-gray-700 rounded hover:bg-white/10 text-sm text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save
              </motion.button>
            </div>
            <pre
              ref={outputRef}
              className="p-4 bg-black/20 border border-gray-700 rounded font-mono text-white overflow-x-auto"
            >
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  )
}
