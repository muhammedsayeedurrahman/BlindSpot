import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Sparkles } from '@react-three/drei'
import { useMemo, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

/* ── Animated water surface ────────────────────────────────── */
function WaterPlane() {
  const meshRef = useRef()
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(14, 14, 24, 24)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      pos.setY(i, Math.sin(x * 0.5 + t) * 0.08 + Math.cos(z * 0.4 + t * 0.7) * 0.06)
    }
    pos.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geo} position={[0, 0, 0]}>
      <meshPhysicalMaterial
        color="#004466"
        transparent
        opacity={0.35}
        roughness={0.1}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ── Glowing skill node (sphere) ───────────────────────────── */
function SkillNode({ position, label, color, glowColor, size = 0.18, status }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  const emissiveIntensity = hovered ? 2.5 : 1.2

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.scale.setScalar(
      hovered ? 1.4 : 1 + Math.sin(t * 2 + position[0]) * 0.08
    )
  })

  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh>
        <sphereGeometry args={[size * 2.2, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={hovered ? 0.2 : 0.08} />
      </mesh>

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, size + 0.25, 0]}
        fontSize={hovered ? 0.22 : 0.16}
        color={hovered ? '#ffffff' : color}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.01}
        outlineColor="#000000"
        font={undefined}
      >
        {label}
      </Text>

      {/* Status indicator on hover */}
      {hovered && status && (
        <Text
          position={[0, size + 0.48, 0]}
          fontSize={0.1}
          color={glowColor}
          anchorX="center"
          anchorY="bottom"
        >
          {status.replace('_', ' ').toUpperCase()}
        </Text>
      )}

      {/* Point light for glow effect */}
      <pointLight color={glowColor} intensity={hovered ? 1.5 : 0.4} distance={2} />
    </group>
  )
}

/* ── Connection line between nodes ──────────────────────────── */
function ConnectionLine({ start, end, color }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1
  })

  const points = useMemo(() => {
    const mid = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.2,
      (start[2] + end[2]) / 2,
    ]
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    )
    return curve.getPoints(20)
  }, [start, end])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.2} />
    </line>
  )
}

/* ── Iceberg body (stylized geometry) ──────────────────────── */
function IcebergBody() {
  const aboveRef = useRef()
  const belowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (aboveRef.current) {
      aboveRef.current.position.y = 0.9 + Math.sin(t * 0.5) * 0.05
      aboveRef.current.rotation.y = t * 0.1
    }
    if (belowRef.current) {
      belowRef.current.position.y = -1.4 + Math.sin(t * 0.5) * 0.03
      belowRef.current.rotation.y = t * 0.1
    }
  })

  return (
    <>
      {/* Above water — visible tip */}
      <mesh ref={aboveRef} position={[0, 0.9, 0]}>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshPhysicalMaterial
          color="#40e0d0"
          transparent
          opacity={0.55}
          roughness={0.15}
          metalness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#00f0ff"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Below water — massive hidden mass */}
      <mesh ref={belowRef} position={[0, -1.4, 0]}>
        <dodecahedronGeometry args={[2.0, 1]} />
        <meshPhysicalMaterial
          color="#1a1a4e"
          transparent
          opacity={0.4}
          roughness={0.3}
          metalness={0.5}
          emissive="#b44aff"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Ice core glow */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.06} />
      </mesh>
    </>
  )
}

/* ── Underwater particles ──────────────────────────────────── */
function UnderwaterParticles() {
  return (
    <group position={[0, -2, 0]}>
      <Sparkles
        count={60}
        scale={[8, 4, 8]}
        size={1.5}
        speed={0.3}
        color="#b44aff"
        opacity={0.3}
      />
    </group>
  )
}

/* ── Above-water sparkles ──────────────────────────────────── */
function SurfaceSparkles() {
  return (
    <group position={[0, 1.5, 0]}>
      <Sparkles
        count={30}
        scale={[6, 2, 6]}
        size={1}
        speed={0.5}
        color="#00f0ff"
        opacity={0.4}
      />
    </group>
  )
}

/* ── Main iceberg scene ────────────────────────────────────── */
function IcebergScene({ survivalData }) {
  const { above, below, abovePositions, belowPositions } = useMemo(() => {
    const aboveWater = survivalData.filter(
      (s) => s.status === 'thriving' || s.status === 'stable'
    )
    const belowWater = survivalData.filter(
      (s) => s.status === 'at_risk' || s.status === 'critical'
    )

    // Arrange nodes in layered rings around the iceberg
    const arrangeLayered = (items, yBase, baseRadius, yStep, direction = 1) => {
      const maxPerRing = 6
      return items.map((_, i) => {
        const ring = Math.floor(i / maxPerRing)
        const indexInRing = i % maxPerRing
        const countInRing = Math.min(maxPerRing, items.length - ring * maxPerRing)
        const angle = (indexInRing / countInRing) * Math.PI * 2 + ring * 0.5
        const radius = baseRadius + ring * 0.6
        const y = yBase + ring * yStep * direction
        return [
          Math.sin(angle) * radius,
          y,
          Math.cos(angle) * radius,
        ]
      })
    }

    return {
      above: aboveWater,
      below: belowWater,
      abovePositions: arrangeLayered(aboveWater, 1.2, 2.5, 0.8, 1),
      belowPositions: arrangeLayered(belowWater, -1.0, 2.8, 0.7, -1),
    }
  }, [survivalData])

  return (
    <group>
      {/* Iceberg body */}
      <IcebergBody />

      {/* Water surface */}
      <WaterPlane />

      {/* Skill nodes above water */}
      {above.map((s, i) => (
        <Float key={s.skill} speed={1.5} floatIntensity={0.3} rotationIntensity={0}>
          <SkillNode
            position={abovePositions[i]}
            label={s.skill}
            color="#39ff14"
            glowColor="#39ff14"
            size={s.status === 'thriving' ? 0.22 : 0.16}
            status={s.status}
          />
        </Float>
      ))}

      {/* Skill nodes below water */}
      {below.map((s, i) => (
        <Float key={s.skill} speed={0.8} floatIntensity={0.15} rotationIntensity={0}>
          <SkillNode
            position={belowPositions[i]}
            label={s.skill}
            color={s.status === 'critical' ? '#ff2d7c' : '#ff6a00'}
            glowColor={s.status === 'critical' ? '#ff2d7c' : '#ff6a00'}
            size={s.status === 'critical' ? 0.14 : 0.18}
            status={s.status}
          />
        </Float>
      ))}

      {/* Connection lines between above-water nodes */}
      {above.length > 1 &&
        above.slice(0, -1).map((_, i) => (
          <ConnectionLine
            key={`above-${i}`}
            start={abovePositions[i]}
            end={abovePositions[i + 1]}
            color="#39ff14"
          />
        ))}

      {/* Connection lines between below-water nodes */}
      {below.length > 1 &&
        below.slice(0, -1).map((_, i) => (
          <ConnectionLine
            key={`below-${i}`}
            start={belowPositions[i]}
            end={belowPositions[i + 1]}
            color="#ff6a00"
          />
        ))}

      {/* Atmosphere */}
      <SurfaceSparkles />
      <UnderwaterParticles />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 4, 0]} color="#00f0ff" intensity={0.8} distance={10} />
      <pointLight position={[0, -4, 0]} color="#b44aff" intensity={0.5} distance={10} />
      <pointLight position={[3, 0, 3]} color="#39ff14" intensity={0.3} distance={8} />
      <pointLight position={[-3, 0, -3]} color="#ff2d7c" intensity={0.3} distance={8} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0a1a', 8, 18]} />
    </group>
  )
}

/* ── Legend overlay ─────────────────────────────────────────── */
function IcebergLegend({ survivalData }) {
  const { above, below } = useMemo(() => ({
    above: survivalData.filter(
      (s) => s.status === 'thriving' || s.status === 'stable'
    ),
    below: survivalData.filter(
      (s) => s.status === 'at_risk' || s.status === 'critical'
    ),
  }), [survivalData])

  return (
    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#39ff14]" />
          <span className="theme-text-tertiary">Thriving ({above.filter(s => s.status === 'thriving').length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_6px_#00f0ff]" />
          <span className="theme-text-tertiary">Stable ({above.filter(s => s.status === 'stable').length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-orange shadow-[0_0_6px_#ff6a00]" />
          <span className="theme-text-tertiary">At Risk ({below.filter(s => s.status === 'at_risk').length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_6px_#ff2d7c]" />
          <span className="theme-text-tertiary">Critical ({below.filter(s => s.status === 'critical').length})</span>
        </span>
      </div>
      <span className="theme-text-muted text-[10px]">drag to rotate</span>
    </div>
  )
}

/* ── Exported component ─────────────────────────────────────── */
export default function Iceberg({ survivalData }) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 9], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <IcebergScene survivalData={survivalData} />
        <OrbitControls
          enableZoom={true}
          minDistance={4}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.15}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      <IcebergLegend survivalData={survivalData} />
    </div>
  )
}
