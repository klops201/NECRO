'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Track {
  id: string
  title: string
  duration: string
  genre: string
  mood: string
  file_name: string
  created_at: string
  bpm: number
  energy_level: number
}

interface SystemMetrics {
  bass_resonance: number
  harmony_sync: number
  rhythm_stability: number
}

const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  bass_resonance: 85,
  harmony_sync: 92,
  rhythm_stability: 88
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: 'CYB001',
    title: 'Neon Pulse',
    duration: '4:23',
    genre: 'Cyberpunk',
    mood: 'Dark',
    file_name: '/track1.mp3',
    created_at: '2024-03-15T10:30:00Z',
    bpm: 128,
    energy_level: 85
  },
  {
    id: 'CYB002',
    title: 'Digital Shadows',
    duration: '3:57',
    genre: 'Synthwave',
    mood: 'Mysterious',
    file_name: '/track2.mp3',
    created_at: '2024-03-15T10:29:00Z',
    bpm: 110,
    energy_level: 72
  },
  {
    id: 'CYB003',
    title: 'Neural Dance',
    duration: '5:15',
    genre: 'Electronic',
    mood: 'Energetic',
    file_name: '/track3.mp3',
    created_at: '2024-03-15T09:15:00Z',
    bpm: 140,
    energy_level: 95
  }
]

export default function MusicLab() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [tracks] = useState<Track[]>(SAMPLE_TRACKS)
  const [activeTrack, setActiveTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM_METRICS)
  const [visualizer, setVisualizer] = useState<number[]>(Array(32).fill(50))
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setIsInitialized(true)
    
    // Symulacja wizualizacji audio
    const visualizerInterval = setInterval(() => {
      if (isPlaying) {
        setVisualizer(prev => 
          prev.map(() => Math.min(100, Math.max(20, 50 + (Math.random() - 0.5) * 60)))
        )
      }
    }, 100)

    // Symulacja metryk systemu
    const metricsInterval = setInterval(() => {
      if (isPlaying) {
        setMetrics(prev => ({
          bass_resonance: Math.max(60, Math.min(100, prev.bass_resonance + (Math.random() - 0.5) * 10)),
          harmony_sync: Math.max(70, Math.min(100, prev.harmony_sync + (Math.random() - 0.5) * 8)),
          rhythm_stability: Math.max(75, Math.min(100, prev.rhythm_stability + (Math.random() - 0.5) * 5))
        }))
      }
    }, 1000)

    return () => {
      clearInterval(visualizerInterval)
      clearInterval(metricsInterval)
    }
  }, [isPlaying])

  const handlePlay = (track: Track) => {
    setActiveTrack(track)
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ff00e5] text-2xl font-mono animate-pulse">
          INITIALIZING AUDIO SYSTEMS...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#ff00e5] font-mono p-4">
      {/* Header with System Metrics */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 border-b border-[#ff00e5]/20 p-4 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-[#ff00e5] animate-pulse" />
            <span className="text-xl">CYBER_AUDIO_LAB</span>
          </div>
          <div className="flex space-x-8">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="text-sm">
                <div className="text-[#ff00e5]/60 uppercase mb-1">{key.replace('_', ' ')}</div>
                <div className="w-32 h-1 bg-[#ff00e5]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ff00e5] transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track List */}
        <div className="lg:col-span-2 space-y-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all duration-300
                ${activeTrack?.id === track.id ? 
                  'border-[#ff00e5] bg-[#ff00e5]/10' : 
                  'border-[#ff00e5]/30 hover:border-[#ff00e5]/60'
                }
              `}
              onClick={() => handlePlay(track)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold">{track.title}</div>
                  <div className="text-[#ff00e5]/60 text-sm">
                    {track.genre} • {track.mood} • {track.duration}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">BPM: {track.bpm}</div>
                  <div className="text-[#ff00e5]/60 text-sm">
                    Energy: {track.energy_level}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Track & Visualizer */}
        <div className="space-y-6">
          {activeTrack ? (
            <>
              <div className="border border-[#ff00e5]/30 rounded-lg p-4">
                <h2 className="text-xl mb-4">NOW PLAYING</h2>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{activeTrack.title}</div>
                  <div className="text-[#ff00e5]/60">
                    {activeTrack.genre} • {activeTrack.mood}
                  </div>
                  <audio
                    ref={audioRef}
                    src={`/music/${activeTrack.file_name}`}
                    className="w-full mt-4"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              </div>

              {/* Audio Visualizer */}
              <div className="border border-[#ff00e5]/30 rounded-lg p-4">
                <div className="flex items-end justify-between h-32 space-x-1">
                  {visualizer.map((height, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-[#ff00e5] rounded-t transition-all duration-100"
                      style={{ 
                        height: `${height}%`,
                        opacity: isPlaying ? 0.6 + (height/200) : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="border border-[#ff00e5]/30 rounded-lg p-4 h-48 flex items-center justify-center text-[#ff00e5]/40">
              SELECT TRACK TO BEGIN
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
