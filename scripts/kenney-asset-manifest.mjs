/**
 * Kenney Tower Defense Kit — GLB filenames inside "Models/GLB format/".
 * CC0 — https://kenney.nl/assets/tower-defense-kit
 */

/** game tower id → source GLB in the Kenney pack */
export const TOWER_MAP = {
  archer: 'weapon-ballista.glb',
  cannon: 'weapon-cannon.glb',
  mage: 'tower-round-crystals.glb',
  tesla: 'weapon-turret.glb',
  sniper: 'tower-round-top-a.glb',
  barracks: 'wood-structure.glb',
  freeze: 'snow-detail-crystal-large.glb',
  mortar: 'weapon-catapult.glb',
}

/**
 * game enemy id → source GLB (only enemy-ufo-a..d exist; spread types for silhouette variety).
 */
export const ENEMY_MAP = {
  grunt: 'enemy-ufo-a.glb',
  runner: 'enemy-ufo-b.glb',
  armored: 'enemy-ufo-c.glb',
  flyer: 'enemy-ufo-d.glb',
  brute: 'enemy-ufo-b.glb',
  wraith: 'enemy-ufo-d.glb',
  splitter: 'enemy-ufo-c.glb',
  medic: 'enemy-ufo-a.glb',
  tank: 'enemy-ufo-c.glb',
  kamikaze: 'enemy-ufo-d.glb',
  runt: 'enemy-ufo-a.glb',
}

/**
 * Decorative props → copied to public/models/props/<basename> (skipped if missing).
 * Curated for biomes; harmless if a filename differs slightly across Kenney zip versions.
 */
export const KENNEY_PROP_FILES = [
  'detail-tree-large.glb',
  'detail-tree-small.glb',
  'rock-large.glb',
  'rock-flat.glb',
  'snow-detail-tree.glb',
  'snow-detail-crystal-large.glb',
  'snow-detail-dirt-large.glb',
  'tower-round-bottom-a.glb',
  'tower-square-bottom-a.glb',
  'wood-log.glb',
  'weapon-arrow.glb',
  'selection-a.glb',
  'selection-b.glb',
  'detail-crystal-large.glb',
  'tile-grass.glb',
  'tile-rock.glb',
]
