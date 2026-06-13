// Built-in setting definitions. Importing this module registers them (side effect).
// More are added here (or contributed by features) as the app grows.
import { defineSetting } from "./registry";

export const TITLEBAR_VARIANT = defineSetting({
  key: "titlebar.variant",
  type: "enum",
  enum: ["C", "B"],
  default: "C",
  scope: "user",
  title: "Title bar style",
  description: "Two-tier context bar (C) or switcher-centric single bar (B).",
});

export type StatusBarLayout = { left: string[]; right: string[] };

export const STATUSBAR_SEGMENTS = defineSetting<StatusBarLayout>({
  key: "statusbar.segments",
  type: "json",
  scope: "user",
  // D38 composition (canonical, design/app.pen).
  default: {
    left: ["branch", "migrations", "ns-db", "problems"],
    right: ["language", "cursor", "indentation", "encoding"],
  },
  title: "Status bar segments",
  description:
    "Which segments show in the status bar, on which side, and in what order.",
});
