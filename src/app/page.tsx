'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaGithub, FaRocket, FaChartLine } from 'react-icons/fa'
import { TbXboxXFilled } from "react-icons/tb";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import { Skull } from './components/Skull'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { Vector2 } from 'three'

interface Link {
  href: string;
  text: string;
  icon: React.ReactNode;
}

interface GlossyButtonProps {
  link: Link;
  side: 'left' | 'right';
  index: number;
  totalButtons: number;
}


const getButtonStyle = (index: number) => {
  const styles = [
    'border-red-500/50 hover:border-red-500 text-red-400 bg-gradient-to-br from-red-900/20 to-black/20',
    'border-yellow-500/50 hover:border-yellow-500 text-yellow-400 bg-gradient-to-br from-yellow-900/20 to-black/20',
    'border-green-500/50 hover:border-green-500 text-green-400 bg-gradient-to-br from-green-900/20 to-black/20',
    'border-purple-500/50 hover:border-purple-500 text-purple-400 bg-gradient-to-br from-purple-900/20 to-black/20',
  ];
  return styles[index % styles.length];
}


const allLinks = [
  {
    href: '/chat',
    text: "Chat me",
    icon: <IoChatboxEllipsesOutline className="w-6 h-6" />,
  },
  {
    href: "https://pump.fun/profile/NecroCoin",
    text: "Pump Fun",
    icon: <FaRocket className="w-6 h-6" />,
  },
  // {
  //   href: "https://x.com/AiGuySolana",
  //   text: "Twitter",
  //   icon: <TbXboxXFilled className="w-6 h-6" />,
  // },
  {
    href: "/dance",
    text: "Dance",
    icon: <FaChartLine className="w-6 h-6" />,
  },
  {
    href: "https://x.com/Necro_000",
    text: "Twitter",
    icon: <TbXboxXFilled className="w-6 h-6" />,
  },
]

'use client'

const GlossyButton: React.FC<GlossyButtonProps> = ({ link, index, totalButtons }) => {
  const [responsiveRadius, setResponsiveRadius] = useState(370);
  const [scale, setScale] = useState('scale-100');

  useEffect(() => {
    const updateRadius = () => {
      const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
      const baseRadius = smallerDimension * 0.25;
      setResponsiveRadius(baseRadius);
      setScale(window.innerWidth < 640 ? 'scale-75' : 'scale-100');
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const angle = (index / totalButtons) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * responsiveRadius - 60;
  const y = Math.sin(angle) * responsiveRadius;

  return (
    <motion.a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`
        flex items-center justify-center
        bg-black/80
        backdrop-blur-md
        px-4 py-2
        rounded-full
        transition-all duration-300
        group
        min-w-[120px]
        border border-red-500/30
        hover:border-red-500/60
        text-red-400
        hover:text-red-300
        hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]
        ${scale}
      `}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <span className="transition-colors duration-300">
          {link.icon}
        </span>
        <span className="text-sm transition-colors duration-300">
          {link.text}
        </span>
      </div>
    </motion.a>
  );
};



const HomePage = () => {
  return (
    <main className="min-h-screen bg-black relative overflow-hidden font-mono">      <Navbar />
      
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, -10], fov: 45 }} style={{ background: 'black', width: '100vw', height: '100vh', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[-5, 0, -5]} intensity={1} color="#ff0000" />
          <pointLight position={[5, 0, -5]} intensity={1} color="#00ff00" />
          <spotLight
            position={[0, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            castShadow
            color="#ffffff"
          />
          <pointLight position={[0, -5, 0]} intensity={0.5} color="#ff4400" />
          <fog attach="fog" args={['black', 5, 15]} />
          <Environment preset="night" />
          
          <group scale={0.3}>
            <Skull />
            <mesh position={[0, 0, -0.1]} scale={1.02}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.1} />
            </mesh>
          </group>

          <OrbitControls 
            enableZoom={false}
            autoRotate
            // enableRotate={false}
            autoRotateSpeed={0.8}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />

          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
            />
            <ChromaticAberration 
              offset={new Vector2(0.002, 0.002)}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Content Overlay with Side Buttons */}
      <div className="fixed inset-0 flex flex-col items-center justify-center z-10">
        {/* Title */}
        <motion.h1 
          className="absolute top-32 text-4xl md:text-6xl font-bold text-red-400"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          $Necro
        </motion.h1>

        {/* Circular Buttons */}
        <div className="relative w-screen h-screen flex items-center justify-center">
          <div className="absolute" style={{ width: '400px', height: '400px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            {allLinks.map((link, index) => (
              <GlossyButton 
                key={link.href}
                link={link}
                index={index}
                totalButtons={allLinks.length} side={'left'}  
                           />
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="absolute bottom-8 text-center text-red-400/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>© 2024 $Necro. All rights reserved.</p>
        </motion.div>
      </div>
    </main>
  )
}

export default HomePage
