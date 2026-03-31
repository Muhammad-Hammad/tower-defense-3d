import { useMemo } from 'react'
import { TOWER_ABILITIES } from '../../data/towerAbilities'
import { enemyConfigs } from '../../data/enemies'
import { getEnemyAbilities } from '../../data/enemyAbilities'
import {
  getTowerConfig,
  scaledAttackSpeed,
  scaledTowerDamage,
  scaledTowerRange,
} from '../../data/towers'
import { TOWER_COLORS } from '../../game/entities/TowerModel'
import { useGameStore } from '../../store/gameStore'

function StatRow({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-800/80 py-0.5 text-[10px]" title={hint}>
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  )
}

export function InfoCard() {
  const selectedEntity = useGameStore((s) => s.selectedEntity)
  const towers = useGameStore((s) => s.towers)
  const enemies = useGameStore((s) => s.enemies)
  const gold = useGameStore((s) => s.gold)
  const clearSelection = useGameStore((s) => s.clearSelection)
  const upgradeSelectedTower = useGameStore((s) => s.upgradeSelectedTower)

  const towerView = useMemo(() => {
    if (selectedEntity?.kind !== 'tower') {
      return null
    }
    const tower = towers.find((t) => t.id === selectedEntity.id)
    if (!tower) {
      return null
    }
    const cfg = getTowerConfig(tower.type)
    const up = tower.upgradeLevel
    const dmgB = cfg.baseDamage
    const dmgU = scaledTowerDamage(cfg, up)
    const rngB = cfg.baseRange
    const rngU = scaledTowerRange(cfg, up)
    const spdB = cfg.baseAttackSpeed
    const spdU = scaledAttackSpeed(cfg, up)
    const ability = TOWER_ABILITIES[tower.type]
    const nextCost = up < 2 ? cfg.upgradeCostBase * (up + 1) : null
    const canUpgrade = up < 2 && nextCost != null && gold >= nextCost

    return (
      <div className="rounded border border-amber-900/50 bg-slate-950/95 p-2 shadow-lg">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-slate-600"
              style={{ backgroundColor: TOWER_COLORS[tower.type] }}
              title={cfg.damageKind}
            />
            <span className="text-xs font-semibold text-slate-100">{cfg.name}</span>
            <span className="text-[10px] text-amber-200/90">Lv {up}/2</span>
          </div>
          <button
            type="button"
            className="rounded px-1.5 text-sm leading-none text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            title="Close"
            onClick={() => clearSelection()}
          >
            ×
          </button>
        </div>

        <div className="mb-1.5 space-y-0">
          <StatRow
            label="Damage"
            value={`${dmgB.toFixed(0)} → ${dmgU.toFixed(1)}`}
            hint="Base damage, then current with upgrade multiplier (+22% per level)"
          />
          <StatRow
            label="Range"
            value={`${rngB.toFixed(1)}u → ${rngU.toFixed(2)}u`}
            hint="Attack radius in world units; upgrades add +6% range per level"
          />
          <StatRow
            label="Attack speed"
            value={
              spdB <= 0
                ? '— (aura / spawner)'
                : `${spdB.toFixed(2)} → ${spdU.toFixed(2)}/s`
            }
            hint="Shots or cycles per second where applicable; +8% per upgrade level"
          />
          <StatRow
            label="Damage type"
            value={cfg.damageKind}
            hint="Physical / magic / etc. Checked against enemy resistances"
          />
        </div>

        {ability ? (
          <p className="mb-1.5 text-[10px] text-sky-200/90" title={ability.detail}>
            <span className="font-semibold text-sky-300">{ability.label}:</span> {ability.detail}
          </p>
        ) : null}

        {nextCost != null ? (
          <button
            type="button"
            disabled={!canUpgrade}
            className="w-full rounded bg-amber-700 px-2 py-1 text-[10px] font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
            title="Applies +22% damage, +range & attack speed per level"
            onClick={() => {
              void upgradeSelectedTower()
            }}
          >
            Upgrade — {nextCost}g (+22% dmg)
          </button>
        ) : (
          <p className="text-[10px] text-slate-500">Max upgrade reached</p>
        )}
      </div>
    )
  }, [selectedEntity, towers, gold, clearSelection, upgradeSelectedTower])

  const enemyView = useMemo(() => {
    if (selectedEntity?.kind !== 'enemy') {
      return null
    }
    const enemy = enemies.find((e) => e.id === selectedEntity.id)
    if (!enemy) {
      return null
    }
    const cfg = enemyConfigs[enemy.type]
    const badges = getEnemyAbilities(cfg)
    const hpPct = enemy.maxHp > 0 ? Math.max(0, enemy.hp / enemy.maxHp) : 0

    return (
      <div className="rounded border border-rose-900/40 bg-slate-950/95 p-2 shadow-lg">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-100">{cfg.name}</span>
          <button
            type="button"
            className="rounded px-1.5 text-sm leading-none text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            title="Close"
            onClick={() => clearSelection()}
          >
            ×
          </button>
        </div>
        <div className="mb-2 h-2 overflow-hidden rounded bg-slate-800">
          <div
            className="h-full bg-rose-600 transition-[width]"
            style={{ width: `${hpPct * 100}%` }}
          />
        </div>
        <p className="mb-1 text-[10px] text-slate-400">
          HP {Math.ceil(enemy.hp)} / {enemy.maxHp}
        </p>
        <div className="mb-1.5 space-y-0">
          <StatRow label="Speed" value={cfg.speed.toFixed(1)} hint="Movement units per second" />
          <StatRow
            label="Physical resist"
            value={`${Math.round(cfg.physicalResist * 100)}%`}
            hint="Reduces physical damage"
          />
          <StatRow
            label="Magic resist"
            value={`${Math.round(cfg.magicResist * 100)}%`}
            hint="Reduces magic / elemental damage"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {badges.map((b) => (
            <span
              key={b.label}
              className="cursor-help rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-300"
              title={b.detail}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
    )
  }, [selectedEntity, enemies, clearSelection])

  if (towerView) {
    return towerView
  }
  if (enemyView) {
    return enemyView
  }
  return null
}
