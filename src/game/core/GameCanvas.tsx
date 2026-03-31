import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { useSettingsStore } from '../../store/settingsStore'
import { GameScene } from './GameScene'

export function GameCanvas() {
  const showFps = useSettingsStore((s) => s.showFps)

  return (
    <Canvas
      shadows={false}
      camera={{ position: [22, 22, 22], fov: 45, near: 0.1, far: 220 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }}
    >
      {import.meta.env.DEV && showFps ? <Stats /> : null}
      <GameScene />
    </Canvas>
  )
}
