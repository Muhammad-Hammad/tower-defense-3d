import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore'

/** Runs deterministic simulation; avoid subscribing this component to the store. */
export function GameLoop() {
  useFrame((_, delta) => {
    useGameStore.getState().tick(delta)
  })

  return null
}
