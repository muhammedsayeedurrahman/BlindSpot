import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sparkles } from '@react-three/drei'
import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js'

/* ── Helpers ──────────────────────────────────────────────── */

/** Seeded random for deterministic iceberg shape */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Build BufferGeometry and face centroids from ConvexHull in a single pass */
function buildHullData(points) {
  const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  const hull = new ConvexHull().setFromPoints(vectors)

  const vertices = []
  const normals = []
  const centroids = []

  for (const face of hull.faces) {
    let edge = face.edge
    const faceVerts = []
    const cx = new THREE.Vector3()
    let count = 0
    do {
      const pt = edge.head().point
      faceVerts.push(pt)
      cx.add(pt)
      count++
      edge = edge.next
    } while (edge !== face.edge)

    // Face centroid pushed outward for skill node visibility
    cx.divideScalar(count)
    const offset = face.normal.clone().multiplyScalar(0.08)
    cx.add(offset)
    centroids.push([cx.x, cx.y, cx.z])

    // Triangulate (fan from first vertex — QuickHull produces triangles)
    const n = face.normal
    for (let i = 1; i < faceVerts.length - 1; i++) {
      vertices.push(
        faceVerts[0].x, faceVerts[0].y, faceVerts[0].z,
        faceVerts[i].x, faceVerts[i].y, faceVerts[i].z,
        faceVerts[i + 1].x, faceVerts[i + 1].y, faceVerts[i + 1].z
      )
      normals.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  return { geometry: geo, centroids }
}

/* ── Procedural iceberg points ────────────────────────────── */

function generateIcebergPoints(seed = 42) {
  const rng = seededRandom(seed)

  // Above-water: narrow peaked cone (~20 points)
  const abovePoints = []
  for (let i = 0; i < 22; i++) {
    const t = rng()
    const y = t * 1.3 + 0.05 // 0.05 to 1.35
    const widthAtY = (1 - t * 0.7) * 0.75 // narrower at top
    const angle = rng() * Math.PI * 2
    const r = rng() * widthAtY
    abovePoints.push([
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r,
    ])
  }
  // Add explicit peak points
  abovePoints.push([0, 1.4, 0])
  abovePoints.push([0.1, 1.25, 0.05])
  abovePoints.push([-0.08, 1.3, -0.06])
  // Add waterline base ring for width
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + rng() * 0.3
    const r = 0.6 + rng() * 0.3
    abovePoints.push([Math.cos(angle) * r, rng() * 0.1, Math.sin(angle) * r])
  }

  // Below-water: wide irregular blob (~45 points)
  const belowPoints = []
  // Upper part (near waterline) - wide
  for (let i = 0; i < 12; i++) {
    const angle = rng() * Math.PI * 2
    const r = 1.0 + rng() * 0.8
    belowPoints.push([
      Math.cos(angle) * r,
      -(rng() * 0.5),
      Math.sin(angle) * r,
    ])
  }
  // Middle belly - widest
  for (let i = 0; i < 18; i++) {
    const angle = rng() * Math.PI * 2
    const r = 0.8 + rng() * 1.0
    const y = -(0.5 + rng() * 1.5)
    belowPoints.push([Math.cos(angle) * r, y, Math.sin(angle) * r])
  }
  // Deep bottom - narrows
  for (let i = 0; i < 12; i++) {
    const angle = rng() * Math.PI * 2
    const r = 0.3 + rng() * 0.7
    const y = -(2.0 + rng() * 1.2)
    belowPoints.push([Math.cos(angle) * r, y, Math.sin(angle) * r])
  }
  // Bottom tip
  belowPoints.push([0, -3.3, 0])
  belowPoints.push([0.15, -3.1, 0.1])
  belowPoints.push([-0.1, -3.0, -0.12])

  return { abovePoints, belowPoints }
}

/* ── Animated water surface ───────────────────────────────── */

function WaterPlane() {
  const meshRef = useRef()
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(20, 20, 32, 32)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  // Dispose geometry on unmount
  useEffect(() => () => geo.dispose(), [geo])

  // Store original positions for wave displacement
  const originalY = useMemo(() => {
    const pos = geo.attributes.position
    const arr = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i++) {
      arr[i] = pos.getY(i)
    }
    return arr
  }, [geo])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Multi-frequency waves
      const primary = Math.sin(x * 0.3 + t * 0.8) * 0.15
      const secondary = Math.cos(z * 0.5 + t * 1.2) * 0.08
      const detail = Math.sin(x * 2 + z * 1.5 + t * 2) * 0.02
      pos.setY(i, originalY[i] + primary + secondary + detail)
    }
    pos.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} geometry={geo} position={[0, 0, 0]}>
      <meshPhysicalMaterial
        color="#0a3d5c"
        transparent
        opacity={0.45}
        roughness={0.1}
        metalness={0.8}
        side={THREE.DoubleSide}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

/* ── Caustic light rays ───────────────────────────────────── */

function CausticRays() {
  const groupRef = useRef()
  const rayCount = 5
  const rays = useMemo(() => {
    const arr = []
    for (let i = 0; i < rayCount; i++) {
      arr.push({
        x: (i - 2) * 1.4,
        z: Math.sin(i * 1.7) * 1.2,
        rotZ: (i - 2) * 0.08,
        phase: i * 1.3,
      })
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const ray = rays[i]
      child.position.x = ray.x + Math.sin(t * 0.3 + ray.phase) * 0.8
      child.material.opacity = 0.04 + Math.sin(t * 0.5 + ray.phase) * 0.03
    })
  })

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {rays.map((ray, i) => (
        <mesh key={i} position={[ray.x, 0, ray.z]} rotation={[0, 0, ray.rotZ]}>
          <coneGeometry args={[0.3, 4, 4, 1, true]} />
          <meshBasicMaterial
            color="#88ccff"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Skill node embedded in ice ───────────────────────────── */

function SkillNode({ position, label, color, glowColor, size = 0.1, status, isUnderwater }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    if (isUnderwater) {
      // Pulsing danger glow
      const pulse = 0.8 + Math.sin(t * 2.5 + position[0] * 3) * 0.4
      meshRef.current.material.emissiveIntensity = hovered ? 3.0 : pulse
    } else {
      meshRef.current.material.emissiveIntensity = hovered ? 2.5 : 1.2
    }
    const s = hovered ? 1.5 : 1 + Math.sin(t * 1.5 + position[1]) * 0.1
    meshRef.current.scale.setScalar(s)
  })

  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[size * 2.5, 12, 12]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={hovered ? 0.25 : isUnderwater ? 0.1 : 0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Core dot */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Label on hover */}
      {hovered && (
        <>
          <Text
            position={[0, size + 0.2, 0]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {label}
          </Text>
          {status && (
            <Text
              position={[0, size + 0.42, 0]}
              fontSize={0.1}
              color={glowColor}
              anchorX="center"
              anchorY="bottom"
            >
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          )}
        </>
      )}

      {/* Point light */}
      <pointLight
        color={glowColor}
        intensity={hovered ? 1.5 : 0.3}
        distance={1.5}
      />
    </group>
  )
}

/* ── Iceberg body with entry animation ────────────────────── */

function IcebergBody({ aboveGeo, belowGeo, aboveFaceCentroids, belowFaceCentroids, survivalData }) {
  const groupRef = useRef()
  const coreRef = useRef()
  const entryProgress = useRef(0)

  // Classify skills
  const { aboveSkills, belowSkills, abovePositions, belowPositions } = useMemo(() => {
    const above = survivalData.filter(
      (s) => s.status === 'thriving' || s.status === 'stable'
    )
    const below = survivalData.filter(
      (s) => s.status === 'at_risk' || s.status === 'critical'
    )

    // Distribute skills across available face centroids
    const pickPositions = (centroids, count) => {
      if (centroids.length === 0 || count === 0) return []
      const step = Math.max(1, Math.floor(centroids.length / count))
      const result = []
      for (let i = 0; i < count; i++) {
        const idx = (i * step) % centroids.length
        result.push(centroids[idx])
      }
      return result
    }

    return {
      aboveSkills: above,
      belowSkills: below,
      abovePositions: pickPositions(aboveFaceCentroids, above.length),
      belowPositions: pickPositions(belowFaceCentroids, below.length),
    }
  }, [survivalData, aboveFaceCentroids, belowFaceCentroids])

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Entry animation: rise from below
    if (entryProgress.current < 1) {
      entryProgress.current = Math.min(1, entryProgress.current + delta * 0.5)
    }
    const ease = 1 - Math.pow(1 - entryProgress.current, 3) // easeOutCubic
    const entryY = THREE.MathUtils.lerp(-3, 0, ease)

    // Bobbing
    const bob = Math.sin(t * 0.3) * 0.08
    // Tilt
    const tiltX = Math.sin(t * 0.2) * 0.015
    const tiltZ = Math.cos(t * 0.25) * 0.01

    groupRef.current.position.y = entryY + bob
    groupRef.current.rotation.x = tiltX
    groupRef.current.rotation.z = tiltZ

    // Core glow pulse
    if (coreRef.current) {
      coreRef.current.material.opacity = 0.05 + Math.sin(t * 0.8) * 0.03
    }
  })

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Above-water: crystalline frosted ice */}
      <mesh geometry={aboveGeo}>
        <meshPhysicalMaterial
          color="#c8e6f0"
          flatShading
          transparent
          opacity={0.7}
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.3}
          emissive="#1a6fa0"
          emissiveIntensity={0.15}
          envMapIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Below-water: deep translucent ice */}
      <mesh geometry={belowGeo}>
        <meshPhysicalMaterial
          color="#1a3a5c"
          flatShading
          transparent
          opacity={0.5}
          roughness={0.2}
          metalness={0.15}
          emissive="#4a1942"
          emissiveIntensity={0.12}
          envMapIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner core glow */}
      <mesh ref={coreRef} position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Above-water skill nodes */}
      {aboveSkills.map((s, i) => {
        if (!abovePositions[i]) return null
        return (
          <SkillNode
            key={`above-${s.skill}`}
            position={abovePositions[i]}
            label={s.skill}
            color={s.status === 'thriving' ? '#34D399' : '#38BDF8'}
            glowColor={s.status === 'thriving' ? '#34D399' : '#38BDF8'}
            size={s.status === 'thriving' ? 0.12 : 0.09}
            status={s.status}
            isUnderwater={false}
          />
        )
      })}

      {/* Below-water skill nodes */}
      {belowSkills.map((s, i) => {
        if (!belowPositions[i]) return null
        return (
          <SkillNode
            key={`below-${s.skill}`}
            position={belowPositions[i]}
            label={s.skill}
            color={s.status === 'critical' ? '#FB7185' : '#FB923C'}
            glowColor={s.status === 'critical' ? '#FB7185' : '#FB923C'}
            size={s.status === 'critical' ? 0.08 : 0.1}
            status={s.status}
            isUnderwater
          />
        )
      })}
    </group>
  )
}

/* ── Atmospheric particles ────────────────────────────────── */

function Atmosphere() {
  return (
    <>
      {/* Surface mist */}
      <group position={[0, 0.3, 0]}>
        <Sparkles
          count={40}
          scale={[10, 1, 10]}
          size={3}
          speed={0.15}
          color="#ffffff"
          opacity={0.15}
        />
      </group>

      {/* Underwater bubbles */}
      <group position={[0, -2, 0]}>
        <Sparkles
          count={50}
          scale={[6, 4, 6]}
          size={1.2}
          speed={0.4}
          color="#66ccff"
          opacity={0.25}
        />
      </group>

      {/* Snow near tip */}
      <group position={[0, 2, 0]}>
        <Sparkles
          count={20}
          scale={[4, 3, 4]}
          size={0.8}
          speed={0.1}
          color="#ffffff"
          opacity={0.3}
        />
      </group>

      {/* Waterline foam sparkles */}
      <group position={[0, 0.05, 0]}>
        <Sparkles
          count={30}
          scale={[5, 0.3, 5]}
          size={1.5}
          speed={0.3}
          color="#ffffff"
          opacity={0.2}
        />
      </group>
    </>
  )
}

/* ── Lighting rig ─────────────────────────────────────────── */

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      {/* Sun — top right */}
      <directionalLight position={[5, 10, 3]} intensity={1.0} color="#ffffff" />
      {/* Rim light — behind */}
      <directionalLight position={[-3, 2, -5]} intensity={0.3} color="#66ccee" />
      {/* Underwater glow */}
      <pointLight position={[0, -3, 0]} color="#8844aa" intensity={0.4} distance={12} />
      {/* Above-water cool light */}
      <pointLight position={[0, 3, 0]} color="#aaccff" intensity={0.5} distance={10} />
      {/* Accent lights */}
      <pointLight position={[3, 0, 3]} color="#34D399" intensity={0.15} distance={6} />
      <pointLight position={[-3, 0, -3]} color="#FB7185" intensity={0.15} distance={6} />
    </>
  )
}

/* ── Main scene ───────────────────────────────────────────── */

function IcebergScene({ survivalData }) {
  const { aboveGeo, belowGeo, aboveFaceCentroids, belowFaceCentroids } = useMemo(() => {
    const { abovePoints, belowPoints } = generateIcebergPoints(42)
    const above = buildHullData(abovePoints)
    const below = buildHullData(belowPoints)
    return {
      aboveGeo: above.geometry,
      belowGeo: below.geometry,
      aboveFaceCentroids: above.centroids,
      belowFaceCentroids: below.centroids,
    }
  }, [])

  // Dispose hull geometries on unmount
  useEffect(() => () => {
    aboveGeo.dispose()
    belowGeo.dispose()
  }, [aboveGeo, belowGeo])

  return (
    <group>
      <IcebergBody
        aboveGeo={aboveGeo}
        belowGeo={belowGeo}
        aboveFaceCentroids={aboveFaceCentroids}
        belowFaceCentroids={belowFaceCentroids}
        survivalData={survivalData}
      />

      <WaterPlane />
      <CausticRays />
      <Atmosphere />
      <Lighting />

      {/* Fog for depth */}
      <fog attach="fog" args={['#050a15', 10, 25]} />
    </group>
  )
}

/* ── Legend overlay ────────────────────────────────────────── */

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
          <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#34D399]" />
          <span className="theme-text-tertiary">Thriving ({above.filter(s => s.status === 'thriving').length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_6px_#38BDF8]" />
          <span className="theme-text-tertiary">Stable ({above.filter(s => s.status === 'stable').length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-orange shadow-[0_0_6px_#FB923C]" />
          <span className="theme-text-tertiary">At Risk ({below.filter(s => s.status === 'at_risk').length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_6px_#FB7185]" />
          <span className="theme-text-tertiary">Critical ({below.filter(s => s.status === 'critical').length})</span>
        </span>
      </div>
      <span className="theme-text-muted text-[10px]">drag to rotate</span>
    </div>
  )
}

/* ── Exported component ───────────────────────────────────── */

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
          enableZoom
          minDistance={5}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.3}
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
