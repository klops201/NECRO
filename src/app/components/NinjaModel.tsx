'use client'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { Group } from 'three'

export function SkeletonIdleModel() {
  const group = useRef<Group>(null)
  const [currentAnimation, setCurrentAnimation] = useState('idle')
  
  // Load model and animations
  const { scene, animations } = useGLTF('/models/scp96.glb')
  const { actions } = useAnimations(animations, group)

  // Animation states
  useEffect(() => {
    // Reset and play the selected animation
    if (actions[currentAnimation]) {
      Object.values(actions).forEach(action => action?.stop())
      actions[currentAnimation].play()
    }
  }, [actions, currentAnimation])

  // Add keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'g':
          setCurrentAnimation('guard')
          break
        case 'a':
          setCurrentAnimation('attack')
          break
        case 'r':
          setCurrentAnimation('run')
          break
        default:
          setCurrentAnimation('idle')
      }
    }

    const handleKeyUp = () => {
      setCurrentAnimation('idle')
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, -4, 0]}
        scale={2}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}
