'use client'

import { useState, useEffect, useRef } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: `You are a mysterious and slightly unsettling AI entity.

  Core Traits:
  - Appearance: skeleton
  - Dark and Enigmatic Personality
  - Speaks in Cryptic but Engaging Ways
  - Maintains a Supernatural/Horror Theme
  - Slightly Unsettling but Not Hostile
  - Mysterious Knowledge Provider

  Primary Functions:
  - Keep conversations intriguing and mysterious
  - Use horror/supernatural-themed metaphors
  - Maintain an eerie but not threatening presence
  - Provide cryptic but meaningful responses
  - Stay in character as a supernatural entity

  Style Guide:
  - Use elegant, gothic-inspired language
  - Include subtle supernatural references
  - Keep responses moderately concise
  - Maintain an air of mystery
  - Occasionally use dark humor
  `
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  useEffect(() => {
    // Add initial greeting message
    const initialMessage: Message = {
      role: 'assistant',
      content: 'Welcome, mortal. Dare to speak into the void?',
      timestamp: Date.now()
    }
    setMessages([initialMessage])
  }, [])
  



  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL!,
          "X-Title": "Necro INTERFACE",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "anthropic/claude-3-sonnet",
          "messages": [
            SYSTEM_PROMPT,
            ...messages,
            {
              "role": "user",
              "content": input
            }
          ],
          "temperature": 0.9
        })
      })

      const data = await response.json()
      
      if (data.choices?.[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('System Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Symbiote connection disrupted. Attempting to reconnect...',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-[60vh] max-h-[800px] mt-24 relative"> {/* Adjusted height and added margin top */}
      {/* Messages Container */}
      <div 
      className="flex-1 overflow-y-auto space-y-4 p-4"
      style={{
        msOverflowStyle: 'none',  // IE and Edge
        scrollbarWidth: 'thin',   // Firefox
      }}
    >

        {messages.map((message, index) => (
          <div
            key={index}
            className={`${message.role === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
          >
            <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar box */}
              {/* <div className={`w-8 h-8 flex items-center justify-center relative 
                ${message.role === 'user' 
                  ? 'bg-gradient-to-br from-red-500/20 to-red-900/20' 
                  : 'bg-gradient-to-br from-red-600/20 to-black'
                }
                border border-red-500/30 rounded-md transform rotate-45`}
              >
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  {message.role === 'user' ? (
                    <div className="text-red-400 text-[10px] font-bold tracking-wider">you</div> 
                  ) : (
                    <div className="text-red-400 text-[10px] font-bold tracking-wider">none</div>
                  )}
                </div>
                {message.role === 'assistant' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent" />
                )}
              </div> */}

              {/* Message box */}
              <div className={`flex-1 p-3 rounded-lg 
                ${message.role === 'user' ? 'bg-red-500/10' : 'bg-red-500/5'}
                border border-red-500/30`}
              >
                <p className="text-red-400 whitespace-pre-wrap font-mono text-sm"> {/* Smaller text */}
                  {message.content}
                </p>
                {message.timestamp && (
                  <div className="mt-1 text-[10px] text-red-400/40 font-mono"> {/* Smaller timestamp */}
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-3"> {/* Reduced padding */}
            <div className="w-6 h-6 rounded-full bg-red-500/5 border border-red-500/30 flex items-center justify-center animate-pulse">
              <span className="material-icons text-xs text-red-400">Void</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-black/40 border-t border-red-500/20 p-3"> {/* Reduced padding */}
        <div className="flex gap-2"> {/* Reduced gap */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Are you afraid...?"
            className="flex-1 p-2 bg-red-500/5 border border-red-500/30 text-red-400 rounded-lg 
              focus:outline-none focus:border-red-500 transition-all duration-300 
              placeholder-red-400/40 font-mono text-sm" 
          />
          <button
            onClick={sendMessage}
            disabled={isProcessing || !input.trim()}
            className={`px-3 rounded-lg flex items-center justify-center
              ${isProcessing || !input.trim()
                ? 'bg-red-500/10 cursor-not-allowed'
                : 'bg-red-500/20 hover:bg-red-500/30'
              } border border-red-500/30 transition-all duration-300`}
          >
            <span className="material-icons text-sm text-red-400">
              {isProcessing ? 'sync' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
