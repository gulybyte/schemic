import type { ComponentType } from "react";

// Status-bar segment registry (D38). Each segment is a registered, addressable piece;
// which segments show (and on which side, in what order) is driven by the
// `statusbar.segments` setting. Multi-status rendering lives inside each Component
// (design-expert designs the per-segment states).

export type SegmentSide = "left" | "right";

export interface SegmentDef {
  id: string;
  side: SegmentSide; // default side (the setting is the source of truth for placement)
  group?: string; // a thin divider is drawn between adjacent segments of different groups
  title: string; // human label (for the settings toggle UI later)
  Component: ComponentType;
}

const registry = new Map<string, SegmentDef>();

export function registerSegment(def: SegmentDef): SegmentDef {
  registry.set(def.id, def);
  return def;
}

export function getSegment(id: string): SegmentDef | undefined {
  return registry.get(id);
}

export function allSegments(): SegmentDef[] {
  return [...registry.values()];
}
