import { Braces } from "lucide-react";
import type { ComponentType } from "react";

export type NavItemDef = {
  id: string;
  icon: ComponentType<{ size?: number }>;
  label: string;
};

// Canonical Nav Item spec from design/app.pen (design-expert). The rail surfaces only
// implemented features — module items are added as each ships; system items
// (Settings/Help) are held until their pages exist (Manuel). P1 = Code only.
const MODULES: NavItemDef[] = [{ id: "code", icon: Braces, label: "Code" }];
const SYSTEM: NavItemDef[] = [];

function NavItem({
  item,
  active,
  onSelect,
}: {
  item: NavItemDef;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={`nav-item${active ? " active" : ""}`}
      title={item.label}
      onClick={() => onSelect(item.id)}
    >
      <Icon size={20} />
      <span className="nav-label">{item.label}</span>
    </button>
  );
}

export function ActivityRail({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  const render = (item: NavItemDef) => (
    <NavItem
      key={item.id}
      item={item}
      active={item.id === active}
      onSelect={onSelect}
    />
  );
  return (
    <nav className="rail">
      <div className="rail-group">{MODULES.map(render)}</div>
      <div className="rail-spacer" />
      <div className="rail-group">{SYSTEM.map(render)}</div>
    </nav>
  );
}
