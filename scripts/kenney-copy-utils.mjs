/**
 * Copy Kenney GLBs from an extracted "Models/GLB format" folder into public/models.
 */
import { mkdirSync, copyFileSync, existsSync, cpSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { ENEMY_MAP, KENNEY_PROP_FILES, TOWER_MAP } from './kenney-asset-manifest.mjs'

export function findGlbRoot(extractDir) {
  const models = join(extractDir, 'Models')
  if (!existsSync(models)) {
    return null
  }
  const glbDir = join(models, 'GLB format')
  if (existsSync(glbDir)) {
    return glbDir
  }
  return null
}

/**
 * Kenney GLBs often reference `Textures/colormap.png` relative to the .glb.
 * Resolve pack layout: .../GLB format/Textures or .../Models/Textures.
 * @param {string} glbRoot
 * @returns {string | null}
 */
export function resolveKenneyTexturesDir(glbRoot) {
  const inGlb = join(glbRoot, 'Textures')
  if (existsSync(inGlb)) {
    try {
      if (statSync(inGlb).isDirectory()) {
        return inGlb
      }
    } catch {
      /* ignore */
    }
  }
  const sibling = join(dirname(glbRoot), 'Textures')
  if (existsSync(sibling)) {
    try {
      if (statSync(sibling).isDirectory()) {
        return sibling
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

/**
 * @param {string} glbRoot absolute path to ".../Models/GLB format"
 * @param {string} projectRoot absolute path to tower-defense-3d
 */
export function copyKenneyAssets(glbRoot, projectRoot) {
  const outTowers = join(projectRoot, 'public/models/towers')
  const outEnemies = join(projectRoot, 'public/models/enemies')
  const outProps = join(projectRoot, 'public/models/props')

  mkdirSync(outTowers, { recursive: true })
  mkdirSync(outEnemies, { recursive: true })
  mkdirSync(outProps, { recursive: true })

  const texturesSrc = resolveKenneyTexturesDir(glbRoot)
  if (texturesSrc) {
    for (const dest of [outTowers, outEnemies, outProps]) {
      cpSync(texturesSrc, join(dest, 'Textures'), { recursive: true })
    }
    console.log('[kenney] copied Textures → public/models/{towers,enemies,props}/Textures')
  } else {
    console.warn('[kenney] No Textures folder found next to GLBs — expect missing colormap / pink materials')
  }

  let towers = 0
  let enemies = 0
  let props = 0

  for (const [id, file] of Object.entries(TOWER_MAP)) {
    const src = join(glbRoot, file)
    if (!existsSync(src)) {
      console.warn('[kenney] missing tower source:', file)
      continue
    }
    copyFileSync(src, join(outTowers, `${id}.glb`))
    towers += 1
    console.log('tower', id)
  }

  for (const [id, file] of Object.entries(ENEMY_MAP)) {
    const src = join(glbRoot, file)
    if (!existsSync(src)) {
      console.warn('[kenney] missing enemy source:', file)
      continue
    }
    copyFileSync(src, join(outEnemies, `${id}.glb`))
    enemies += 1
    console.log('enemy', id)
  }

  for (const file of KENNEY_PROP_FILES) {
    const src = join(glbRoot, file)
    if (!existsSync(src)) {
      continue
    }
    copyFileSync(src, join(outProps, file))
    props += 1
    console.log('prop', file)
  }

  console.log(`[kenney] copied towers=${towers} enemies=${enemies} props=${props}`)
  return { towers, enemies, props }
}
