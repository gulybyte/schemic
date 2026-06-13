import type { ComponentType } from 'react'

export type RailItem = {
  id: string
  icon: ComponentType<{ size?: number }>
  label: string
}

// The activity rail starts EMPTY. Module nav items are added here only as each
// module is actually implemented in the app — the app surfaces only what exists.
// Track status in packages/studio/PROGRESS.md. Styling matches canonical shell A
// (36px items, accent-border + tint on active) so added items drop in cleanly.
const RAIL_TOP: RailItem[] = []
const RAIL_BOTTOM: RailItem[] = []

export function ActivityRail({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  const renderItem = (item: RailItem) => {
    const Icon = item.icon
    return (
      <button
        type="button"
        key={item.id}
        title={item.label}
        className={`rail-item${item.id === active ? ' active' : ''}`}
        onClick={() => onSelect(item.id)}
      >
        <Icon size={18} />
      </button>
    )
  }
  return (
    <nav className="rail">
      <div className="rail-group">{RAIL_TOP.map(renderItem)}</div>
      <div className="rail-group">{RAIL_BOTTOM.map(renderItem)}</div>
    </nav>
  )
}
