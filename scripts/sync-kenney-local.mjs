/**
 * Copy GLBs from a local Kenney extract (e.g. tmp-kenney/extracted) into public/models/.
 * Run after unzipping the Tower Defense kit, or point at any folder containing Models/GLB format.
 *
 * Usage:
 *   node scripts/sync-kenney-local.mjs
 *   node scripts/sync-kenney-local.mjs path/to/extracted
 */
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyKenneyAssets, findGlbRoot } from './kenney-copy-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const arg = process.argv[2]
const extractDir = arg ? resolve(process.cwd(), arg) : join(projectRoot, 'tmp-kenney', 'extracted')

const glbRoot = findGlbRoot(extractDir)
if (!glbRoot) {
  console.error('[sync-kenney] No "Models/GLB format" under:', extractDir)
  console.error('  Expected e.g. tmp-kenney/extracted/Models/GLB format/')
  process.exit(1)
}

console.log('[sync-kenney] GLB root:', glbRoot)
copyKenneyAssets(glbRoot, projectRoot)
console.log('[sync-kenney] Done.')
