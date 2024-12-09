// Skull.tsx
'use client'
import { useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react' // Add useEffect import
import { Group, Mesh, MeshStandardMaterial } from 'three' // Add necessary types

export function Skull() {
  const group = useRef<Group>(null)
  const { scene } = useGLTF('/models/skull.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) { // Use instanceof instead of isMesh
        // Type assertion for material
        const material = child.material as MeshStandardMaterial
        if (material) {
          material.metalness = 0.8
          material.roughness = 0.1
          material.color.set('#ffffff')
        }
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])


  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={0.3} // Try a very small number like 0.1 or even 0.05
        position={[0, -4, 0]} // Adjust position if needed
        rotation={[Math.PI / 2, Math.PI, 0]} // Adjust rotation if needed
      />
    </group>
  )
}
