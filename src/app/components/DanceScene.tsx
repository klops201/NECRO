'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { SkeletonModel } from './Dance' // Using the model we created earlier
import { Suspense } from 'react'

export function Scene3D() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        background: 'black'
      }}
    >
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, -6]} />
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.1}
          penumbra={1}
          color="red"
        />
        <SkeletonModel />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}  // This disables manual rotation
          autoRotate={false}  // This is not needed since we're removing auto-rotation
        />
      </Suspense>
    </Canvas>
  )
}
