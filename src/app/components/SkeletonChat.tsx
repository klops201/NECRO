'use client'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Group, MeshStandardMaterial, Color, Mesh } from 'three'
import * as THREE from 'three'

export function SkeletonIdleModel() {
  const group = useRef<Group>(null)
  
  const { scene, animations } = useGLTF('/models/skeletonidle.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    // Log the name of the first animation
    console.log('Animations:', animations.map(anim => anim.name))
    
    // Apply new material to all mesh children
    scene.traverse((child) => {
      if (child instanceof Mesh) {  // Changed type check here
        const newMaterial = new MeshStandardMaterial({
          color: new Color('#FF0000'), // Red color
          metalness: 0.7,
          roughness: 0.1,
          emissive: new Color('#FF0000'),
          emissiveIntensity: 0.1,
          transparent: true,
          opacity: 0.9,
        })
        child.material = newMaterial
      }
    })
    
    // Get the first animation
    const firstAnimationName = animations[0]?.name
    console.log('First animation name:', firstAnimationName)

    if (firstAnimationName && actions[firstAnimationName]) {
      const action = actions[firstAnimationName]
      action.reset()
      action.setEffectiveTimeScale(1)
      action.setEffectiveWeight(1)
      action.fadeIn(0.5)
      action.play()
      action.setLoop(THREE.LoopRepeat, Infinity)
      console.log('Playing animation:', firstAnimationName)
    }
  }, [actions, animations, scene])

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, -2, 0]}
        scale={2}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}

useGLTF.preload('/models/skeletonidle.glb')
