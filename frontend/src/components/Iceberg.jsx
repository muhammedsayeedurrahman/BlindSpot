import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useMemo } from 'react'

function IcebergMesh({ survivalData }) {
  const { above, below } = useMemo(() => {
    const aboveWater = survivalData.filter(
      (s) => s.status === 'thriving' || s.status === 'stable'
    )
    const belowWater = survivalData.filter(
      (s) => s.status === 'at_risk' || s.status === 'critical'
    )
    return { above: aboveWater, below: belowWater }
  }, [survivalData])

  return (
    <group>
      {/* Water plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#003344" transparent opacity={0.3} />
      </mesh>

      {/* Above water - visible (thriving/stable skills) */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[1.2, 1.6, 6]} />
        <meshStandardMaterial color="#00f0ff" transparent opacity={0.7} />
      </mesh>

      {/* Below water - hidden (at_risk/critical skills) */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[2.5, 3, 6]} />
        <meshStandardMaterial color="#1a1a4e" transparent opacity={0.5} />
      </mesh>

      {/* Skill labels above */}
      {above.map((s, i) => (
        <Text
          key={s.skill}
          position={[
            Math.sin((i / Math.max(above.length, 1)) * Math.PI * 2) * 2.5,
            1.5 + i * 0.4,
            Math.cos((i / Math.max(above.length, 1)) * Math.PI * 2) * 0.5,
          ]}
          fontSize={0.2}
          color="#39ff14"
          anchorX="center"
        >
          {s.skill}
        </Text>
      ))}

      {/* Skill labels below */}
      {below.map((s, i) => (
        <Text
          key={s.skill}
          position={[
            Math.sin((i / Math.max(below.length, 1)) * Math.PI * 2) * 2.5,
            -0.5 - i * 0.4,
            Math.cos((i / Math.max(below.length, 1)) * Math.PI * 2) * 0.5,
          ]}
          fontSize={0.2}
          color="#ff2d7c"
          anchorX="center"
        >
          {s.skill}
        </Text>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 3, 0]} color="#00f0ff" intensity={0.5} />
      <pointLight position={[0, -3, 0]} color="#b44aff" intensity={0.3} />
    </group>
  )
}

export default function Iceberg({ survivalData }) {
  return (
    <Canvas camera={{ position: [0, 1, 6], fov: 50 }}>
      <IcebergMesh survivalData={survivalData} />
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
    </Canvas>
  )
}
