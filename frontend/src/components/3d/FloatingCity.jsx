import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, Environment, MeshReflectorMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function Building({ position, size, color, speed = 1 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.elapsedTime * speed * 0.2) * 0.08
  })
  const [w, h, d] = size
  return (
    <Float speed={speed} floatIntensity={0.4} rotationIntensity={0.1}>
      <group ref={ref} position={position}>
        {/* Main body */}
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Windows grid */}
        {Array.from({ length: Math.floor(h / 0.4) }).map((_, row) =>
          Array.from({ length: Math.floor(w / 0.3) }).map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[
                -w / 2 + 0.2 + col * 0.3,
                -h / 2 + 0.25 + row * 0.4,
                d / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[0.15, 0.2]} />
              <meshStandardMaterial
                color={Math.random() > 0.3 ? '#fffde7' : '#1a237e'}
                emissive={Math.random() > 0.3 ? '#fffde7' : '#000'}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))
        )}
      </group>
    </Float>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        color="#0d1117"
        metalness={0.8}
        roughness={0.2}
        mirror={0.5}
      />
    </mesh>
  )
}

const BUILDINGS = [
  { position: [0,   0.5,  0],   size: [1.2, 5, 1.2], color: '#E8532A', speed: 0.8 },
  { position: [2.5, 0,    -1],  size: [1,   4, 1],   color: '#C9A96E', speed: 1.2 },
  { position: [-2.5,0.2,  0.5], size: [1,   4.5,1],  color: '#2c3e50', speed: 1.0 },
  { position: [4.5, -0.5, 1],   size: [0.8, 3, 0.8], color: '#8e44ad', speed: 1.4 },
  { position: [-4.5,-0.3,-0.5], size: [0.9, 3.5,0.9],color: '#16a085', speed: 0.9 },
  { position: [1.5, -0.8, 2.5], size: [0.7, 2.5,0.7],color: '#c0392b', speed: 1.6 },
  { position: [-1.5,-0.6,-2.5], size: [0.8, 3, 0.8], color: '#2980b9', speed: 1.1 },
]

export default function FloatingCity() {
  return (
    <Canvas
      camera={{ position: [0, 2, 10], fov: 55 }}
      shadows
      gl={{ antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <pointLight position={[0, 5, 0]} color="#E8532A" intensity={1} />
      <pointLight position={[-5, 3, -5]} color="#C9A96E" intensity={0.6} />
      <Stars radius={120} depth={60} count={4000} factor={3} fade />
      <Environment preset="night" />
      <Ground />
      {BUILDINGS.map((b, i) => <Building key={i} {...b} />)}
    </Canvas>
  )
}
