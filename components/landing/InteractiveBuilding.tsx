'use client'

import { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Colors from logo
const COLORS = {
  navy: '#1A2B50',
  crimson: '#9A212D',
  gold: '#C5A059',
  white: '#FFFFFF',
}

// Simple Building Model
function Building() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle auto-rotation
      groupRef.current.rotation.y += 0.002
      // Subtle floating effect
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  // Wall material with edge highlight
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.navy,
    roughness: 0.7,
    metalness: 0.1,
  })

  const interiorWallMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.crimson,
    roughness: 0.8,
    metalness: 0.05,
  })

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.8,
  })

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#2a3a5a',
    roughness: 0.9,
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[8, 6]} />
      </mesh>

      {/* Exterior Walls */}
      {/* Front Wall */}
      <mesh position={[0, 1, -3]} material={wallMaterial}>
        <boxGeometry args={[8, 2.2, 0.15]} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 1, 3]} material={wallMaterial}>
        <boxGeometry args={[8, 2.2, 0.15]} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-4, 1, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[6, 2.2, 0.15]} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[4, 1, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[6, 2.2, 0.15]} />
      </mesh>

      {/* Interior Walls */}
      {/* Vertical Interior Wall */}
      <mesh position={[-1, 1, 0]} rotation={[0, Math.PI / 2, 0]} material={interiorWallMaterial}>
        <boxGeometry args={[4, 2.2, 0.1]} />
      </mesh>

      {/* Horizontal Interior Wall */}
      <mesh position={[1.5, 1, -1]} material={interiorWallMaterial}>
        <boxGeometry args={[5, 2.2, 0.1]} />
      </mesh>

      {/* Windows */}
      {/* Front Windows */}
      <mesh position={[-2, 1.2, -2.9]} material={windowMaterial}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
      </mesh>
      <mesh position={[2, 1.2, -2.9]} material={windowMaterial}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[-3.9, 1.2, -1]} rotation={[0, Math.PI / 2, 0]} material={windowMaterial}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
      </mesh>
      <mesh position={[3.9, 1.2, 1]} rotation={[0, Math.PI / 2, 0]} material={windowMaterial}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.9, 2.9]} material={windowMaterial}>
        <boxGeometry args={[0.9, 1.8, 0.05]} />
      </mesh>

      {/* Edge Highlights */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(8, 2.2, 6)]} />
        <lineBasicMaterial color={COLORS.gold} linewidth={2} />
      </lineSegments>
    </group>
  )
}

// Grid Helper with Custom Style
function BlueprintFloor() {
  return (
    <group position={[0, -0.1, 0]}>
      <gridHelper args={[20, 20, COLORS.gold, '#2a3a5a']} />
    </group>
  )
}

// Lighting Setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color={COLORS.gold} />
      <pointLight position={[5, 3, 5]} intensity={0.3} color={COLORS.crimson} />
    </>
  )
}

// Loading Fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={COLORS.navy} wireframe />
    </mesh>
  )
}

export default function InteractiveBuilding() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={45} />
        <Suspense fallback={<LoadingFallback />}>
          <Lighting />
          <Building />
          <BlueprintFloor />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Interaction hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-primary-gold/60">
        드래그하여 회전
      </div>
    </div>
  )
}
