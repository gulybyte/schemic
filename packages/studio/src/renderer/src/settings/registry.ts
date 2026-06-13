// VSCode-like settings registry (D36). Features register definitions; the registry
// is the source of truth for type/default/UI. The settings *page* is built off this
// later — adding a setting makes it appear automatically.

export type SettingScope = "user" | "project";
export type SettingType = "boolean" | "number" | "string" | "enum" | "json";

export interface SettingDef<T = unknown> {
  key: string;
  type: SettingType;
  default: T;
  scope: SettingScope;
  enum?: readonly string[];
  title: string;
  description?: string;
}

const registry = new Map<string, SettingDef>();

export function defineSetting<T>(def: SettingDef<T>): SettingDef<T> {
  registry.set(def.key, def as SettingDef);
  return def;
}

export function getSettingDef(key: string): SettingDef | undefined {
  return registry.get(key);
}

export function allSettings(): SettingDef[] {
  return [...registry.values()];
}
