import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { WeatherKind } from '../../data/biomes'

type Props = {
  weather: WeatherKind
}

const ARENA = 22

function makeBuffer(count: number, yMin: number, yMax: number): {
  geometry: THREE.BufferGeometry
  positions: Float32Array
  velocities: Float32Array
} {
  const pos = new Float32Array(count * 3)
  const vel = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    pos[i * 3] = (Math.random() - 0.5) * ARENA * 2
    pos[i * 3 + 1] = yMin + Math.random() * (yMax - yMin)
    pos[i * 3 + 2] = (Math.random() - 0.5) * ARENA * 2
    vel[i * 3] = (Math.random() - 0.5) * 0.8
    vel[i * 3 + 1] = -0.35 - Math.random() * 1.2
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.8
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return { geometry: geo, positions: pos, velocities: vel }
}

function WindLayers() {
  const LEAF = 520
  const GRASS = 380
  const leafRef = useRef<THREE.Points>(null)
  const grassRef = useRef<THREE.Points>(null)
  const leafVel = useRef<Float32Array | null>(null)
  const grassVel = useRef<Float32Array | null>(null)

  const leafGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(LEAF, 2, 22)
    const v = velocities
    for (let i = 0; i < LEAF; i += 1) {
      v[i * 3] = 1.2 + Math.random() * 0.9
      v[i * 3 + 1] = -0.15 - Math.random() * 0.35
      v[i * 3 + 2] = 0.4 + Math.random() * 0.5
    }
    leafVel.current = v
    return geometry
  }, [])

  const grassGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(GRASS, 0.15, 1.8)
    const v = velocities
    for (let i = 0; i < GRASS; i += 1) {
      v[i * 3] = 0.6 + Math.random() * 0.4
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.08
      v[i * 3 + 2] = 0.2 + Math.random() * 0.3
    }
    grassVel.current = v
    return geometry
  }, [])

  useFrame((_, dt) => {
    const w = 1.8
    const windZ = 0.5
    if (leafRef.current && leafVel.current) {
      const posAttr = leafRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const vel = leafVel.current
      for (let i = 0; i < LEAF; i += 1) {
        const iM = i * 3
        pos[iM] += (vel[iM] + w) * dt
        pos[iM + 1] += vel[iM + 1] * dt
        pos[iM + 2] += (vel[iM + 2] + windZ) * dt
        if (pos[iM + 1] < 0.5 || Math.abs(pos[iM]) > ARENA || Math.abs(pos[iM + 2]) > ARENA) {
          pos[iM] = (Math.random() - 0.5) * ARENA * 2
          pos[iM + 1] = 8 + Math.random() * 18
          pos[iM + 2] = (Math.random() - 0.5) * ARENA * 2
        }
      }
      posAttr.needsUpdate = true
    }
    if (grassRef.current && grassVel.current) {
      const posAttr = grassRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const vel = grassVel.current
      for (let i = 0; i < GRASS; i += 1) {
        const iM = i * 3
        pos[iM] += (vel[iM] + w * 0.45) * dt
        pos[iM + 2] += (vel[iM + 2] + windZ * 0.35) * dt
        if (Math.abs(pos[iM]) > ARENA || Math.abs(pos[iM + 2]) > ARENA) {
          pos[iM] = (Math.random() - 0.5) * ARENA * 2
          pos[iM + 1] = 0.2 + Math.random() * 1.2
          pos[iM + 2] = (Math.random() - 0.5) * ARENA * 2
        }
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <>
      <points ref={leafRef} geometry={leafGeo}>
        <pointsMaterial
          color="#5a8c46"
          size={0.11}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
      <points ref={grassRef} geometry={grassGeo}>
        <pointsMaterial
          color="#7cba6a"
          size={0.06}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </points>
    </>
  )
}

function SandstormLayers() {
  const COUNT = 1400
  const DUST = 500
  const mainRef = useRef<THREE.Points>(null)
  const dustRef = useRef<THREE.Points>(null)
  const mainVel = useRef<Float32Array | null>(null)
  const dustVel = useRef<Float32Array | null>(null)

  const mainGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(COUNT, 4, 22)
    mainVel.current = velocities
    return geometry
  }, [])

  const dustGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(DUST, 0.5, 2.2)
    const v = velocities
    for (let i = 0; i < DUST; i += 1) {
      v[i * 3 + 1] *= 0.15
    }
    dustVel.current = v
    return geometry
  }, [])

  useFrame((_, dt) => {
    const windX = 2.2
    const windZ = 0.05
    const step = (
      ref: RefObject<THREE.Points | null>,
      vel: RefObject<Float32Array | null>,
      n: number,
      lowResetY: number,
      highResetY: number
    ) => {
      if (!ref.current || !vel.current) {
        return
      }
      const posAttr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const va = vel.current
      for (let i = 0; i < n; i += 1) {
        const i3 = i * 3
        pos[i3] += (va[i3] + windX) * dt * 1.15
        pos[i3 + 1] += va[i3 + 1] * dt
        pos[i3 + 2] += (va[i3 + 2] + windZ) * dt * 1.15
        if (pos[i3 + 1] < 0.2) {
          pos[i3] = (Math.random() - 0.5) * ARENA * 2
          pos[i3 + 1] = lowResetY + Math.random() * (highResetY - lowResetY)
          pos[i3 + 2] = (Math.random() - 0.5) * ARENA * 2
        }
        if (Math.abs(pos[i3]) > ARENA || Math.abs(pos[i3 + 2]) > ARENA) {
          pos[i3] = (Math.random() - 0.5) * ARENA * 2
          pos[i3 + 2] = (Math.random() - 0.5) * ARENA * 2
        }
      }
      posAttr.needsUpdate = true
    }
    step(mainRef, mainVel, COUNT, 14, 26)
    step(dustRef, dustVel, DUST, 0.6, 2.0)
  })

  return (
    <>
      <points ref={mainRef} geometry={mainGeo}>
        <pointsMaterial
          color="#d4b896"
          size={0.055}
          transparent
          opacity={0.58}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          color="#c4a882"
          size={0.22}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </points>
    </>
  )
}

function SnowLayers() {
  const SNOW = 900
  const SPARK = 420
  const snowRef = useRef<THREE.Points>(null)
  const sparkRef = useRef<THREE.Points>(null)
  const snowVel = useRef<Float32Array | null>(null)
  const sparkVel = useRef<Float32Array | null>(null)
  const sparkPhase = useRef<Float32Array | null>(null)

  const snowGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(SNOW, 3, 20)
    snowVel.current = velocities
    return geometry
  }, [])

  const sparkGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(SPARK, 0.08, 0.45)
    for (let i = 0; i < SPARK; i += 1) {
      velocities[i * 3 + 1] *= 0.05
    }
    const phases = new Float32Array(SPARK)
    for (let i = 0; i < SPARK; i += 1) {
      phases[i] = Math.random() * Math.PI * 2
    }
    sparkPhase.current = phases
    sparkVel.current = velocities
    return geometry
  }, [])

  useFrame(({ clock }, dt) => {
    if (snowRef.current && snowVel.current) {
      const posAttr = snowRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const vel = snowVel.current
      const windX = 0.15
      const windZ = 0.08
      for (let i = 0; i < SNOW; i += 1) {
        const i3 = i * 3
        pos[i3] += (vel[i3] + windX) * dt
        pos[i3 + 1] += vel[i3 + 1] * dt * 0.85
        pos[i3 + 2] += (vel[i3 + 2] + windZ) * dt
        if (pos[i3 + 1] < 0.15) {
          pos[i3] = (Math.random() - 0.5) * ARENA * 2
          pos[i3 + 1] = 16 + Math.random() * 10
          pos[i3 + 2] = (Math.random() - 0.5) * ARENA * 2
        }
      }
      posAttr.needsUpdate = true
    }
    if (sparkRef.current && sparkVel.current && sparkPhase.current) {
      const t = clock.elapsedTime
      const posAttr = sparkRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const phases = sparkPhase.current
      const mat = sparkRef.current.material as THREE.PointsMaterial
      for (let i = 0; i < SPARK; i += 1) {
        const i3 = i * 3
        const flicker = 0.65 + 0.35 * Math.sin(t * 4 + phases[i])
        pos[i3 + 1] = 0.1 + flicker * 0.25 + (Math.sin(t * 1.7 + i) * 0.03)
      }
      mat.opacity = 0.35 + 0.25 * Math.sin(t * 2.2)
      posAttr.needsUpdate = true
    }
  })

  return (
    <>
      <points ref={snowRef} geometry={snowGeo}>
        <pointsMaterial
          color="#eef6ff"
          size={0.14}
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={sparkRef} geometry={sparkGeo}>
        <pointsMaterial
          color="#ffffff"
          size={0.04}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

function VolcanicFlameColumns({
  positions,
}: {
  positions: readonly (readonly [number, number, number])[]
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) {
      return
    }
    const t = clock.elapsedTime
    g.children.forEach((ch, i) => {
      const pulse = 0.75 + 0.25 * Math.sin(t * 3.2 + i * 1.7)
      ch.scale.set(0.55 * 0.7 * pulse, 1.1 * pulse, 0.55 * 0.7 * pulse)
      ch.position.y = 0.15 + pulse * 0.25
    })
  })

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <group key={i} position={[p[0], 0, p[2]]}>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.45, 1.8, 8]} />
            <meshStandardMaterial
              color="#ff4400"
              emissive="#ff2200"
              emissiveIntensity={1.8}
              transparent
              opacity={0.88}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function AshEmberFlames() {
  const ASH = 900
  const EMBER = 380
  const ashRef = useRef<THREE.Points>(null)
  const emberRef = useRef<THREE.Points>(null)
  const ashVel = useRef<Float32Array | null>(null)
  const emberVel = useRef<Float32Array | null>(null)

  const ashGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(ASH, 4, 20)
    for (let i = 0; i < ASH; i += 1) {
      velocities[i * 3 + 1] = -0.5 - Math.random() * 1.2
    }
    ashVel.current = velocities
    return geometry
  }, [])

  const emberGeo = useMemo(() => {
    const { geometry, velocities } = makeBuffer(EMBER, 0.4, 8)
    for (let i = 0; i < EMBER; i += 1) {
      velocities[i * 3 + 1] = 0.6 + Math.random() * 1.4
      velocities[i * 3] *= 0.4
      velocities[i * 3 + 2] *= 0.4
    }
    emberVel.current = velocities
    return geometry
  }, [])

  const flamePositions = useMemo(
    () => [
      [ARENA * 0.85, 0, ARENA * 0.35] as const,
      [-ARENA * 0.75, 0, -ARENA * 0.55] as const,
      [ARENA * 0.2, 0, -ARENA * 0.88] as const,
    ],
    []
  )

  useFrame((_, dt) => {
    const windX = 0.3
    const windZ = 0.4
    if (ashRef.current && ashVel.current) {
      const posAttr = ashRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const vel = ashVel.current
      for (let i = 0; i < ASH; i += 1) {
        const i3 = i * 3
        pos[i3] += (vel[i3] + windX) * dt
        pos[i3 + 1] += vel[i3 + 1] * dt
        pos[i3 + 2] += (vel[i3 + 2] + windZ) * dt
        if (pos[i3 + 1] < 0.2) {
          pos[i3] = (Math.random() - 0.5) * ARENA * 2
          pos[i3 + 1] = 16 + Math.random() * 10
          pos[i3 + 2] = (Math.random() - 0.5) * ARENA * 2
        }
      }
      posAttr.needsUpdate = true
    }
    if (emberRef.current && emberVel.current) {
      const posAttr = emberRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const vel = emberVel.current
      for (let i = 0; i < EMBER; i += 1) {
        const i3 = i * 3
        pos[i3] += vel[i3] * dt * 0.6
        pos[i3 + 1] += vel[i3 + 1] * dt
        pos[i3 + 2] += vel[i3 + 2] * dt * 0.6
        if (pos[i3 + 1] > 14 || pos[i3 + 1] < 0.15) {
          pos[i3] = (Math.random() - 0.5) * ARENA * 1.8
          pos[i3 + 1] = 0.2 + Math.random() * 0.8
          pos[i3 + 2] = (Math.random() - 0.5) * ARENA * 1.8
        }
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <>
      <points ref={ashRef} geometry={ashGeo}>
        <pointsMaterial
          color="#8a8a8a"
          size={0.07}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={emberRef} geometry={emberGeo}>
        <pointsMaterial
          color="#ff6622"
          size={0.08}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <VolcanicFlameColumns positions={flamePositions} />
    </>
  )
}

function NightmareFogLightning() {
  const COUNT = 900
  const pointsRef = useRef<THREE.Points>(null)
  const velocities = useRef<Float32Array | null>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const nextFlash = useRef(0)
  const flashUntil = useRef(0)

  const geometry = useMemo(() => {
    const { geometry: geo, velocities: vel } = makeBuffer(COUNT, 2, 24)
    for (let i = 0; i < COUNT; i += 1) {
      vel[i * 3 + 1] *= 0.5
    }
    velocities.current = vel
    return geo
  }, [])

  useFrame((state, dt) => {
    if (pointsRef.current && velocities.current) {
      const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array
      const vel = velocities.current
      const windX = 0.55
      const windZ = -0.35
      for (let i = 0; i < COUNT; i += 1) {
        const i3 = i * 3
        pos[i3] += (vel[i3] + windX) * dt
        pos[i3 + 1] += vel[i3 + 1] * dt
        pos[i3 + 2] += (vel[i3 + 2] + windZ) * dt
        if (pos[i3 + 1] < 0.2) {
          pos[i3] = (Math.random() - 0.5) * ARENA * 2
          pos[i3 + 1] = 10 + Math.random() * 16
          pos[i3 + 2] = (Math.random() - 0.5) * ARENA * 2
        }
      }
      posAttr.needsUpdate = true
    }

    const now = state.clock.elapsedTime
    const light = lightRef.current
    if (light) {
      if (now >= nextFlash.current) {
        nextFlash.current = now + 3 + Math.random() * 5
        flashUntil.current = now + 0.05
        light.position.set(
          (Math.random() - 0.5) * ARENA * 1.4,
          8 + Math.random() * 6,
          (Math.random() - 0.5) * ARENA * 1.4
        )
      }
      light.intensity = now < flashUntil.current ? 420 : 0
    }
  })

  return (
    <>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          color="#6a4a9e"
          size={0.05}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight ref={lightRef} color="#ffffff" distance={80} decay={2} intensity={1} />
    </>
  )
}

export function WeatherParticles({ weather }: Props) {
  switch (weather) {
    case 'wind':
      return <WindLayers />
    case 'sandstorm':
      return <SandstormLayers />
    case 'snow':
      return <SnowLayers />
    case 'ash':
      return <AshEmberFlames />
    case 'darkfog':
      return <NightmareFogLightning />
    default:
      return null
  }
}
