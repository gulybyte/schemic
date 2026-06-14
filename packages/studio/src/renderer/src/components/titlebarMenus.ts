import { runCommand } from "../commands/registry";
import { useStudio } from "../store";
import type { MenuItem } from "./MenuRow";

// App-menu inventory for the titlebar, per design/specs/titlebar.md "Menu inventory" + the
// "Menu Bar Contents" board (app.pen HGHYd). Shared by C (menu bar) and B (collapsed "Menu").
// Live actions are wired; actions whose flow isn't built yet render disabled+muted (the
// disabled-until-built convention). Shortcuts use the mono "Cmd/Shift/Opt" word style.

// Run a Monaco action on the focused editor (Edit menu). Uses the dev/runtime __monaco seam.
type FocusableEditor = {
  hasTextFocus(): boolean;
  trigger(source: string, id: string, payload?: unknown): void;
};
function editorAction(actionId: string): void {
  const mon = (
    window as unknown as {
      __monaco?: { editor: { getEditors(): FocusableEditor[] } };
    }
  ).__monaco;
  if (!mon) return;
  const eds = mon.editor.getEditors();
  (eds.find((e) => e.hasTextFocus()) ?? eds[0])?.trigger("menu", actionId);
}

const out = (t: "surrealql" | "result" | "terminal" | "problems") => () =>
  useStudio.getState().setOutputType(t);
const openExternal = (url: string) => () =>
  void window.studio?.shell.openExternal(url);

export interface AppMenu {
  label: string;
  items: MenuItem[];
}

export const APP_MENUS: AppMenu[] = [
  {
    label: "File",
    items: [
      { label: "New Project", shortcut: "Cmd N", disabled: true },
      {
        label: "Open Folder",
        shortcut: "Cmd O",
        onClick: () => runCommand("project.open"),
      },
      { label: "Open Recent", submenu: true, disabled: true },
      "sep",
      { label: "Pull from DB", disabled: true },
      { label: "Push to DB", disabled: true },
      "sep",
      { label: "Settings", shortcut: "Cmd ,", disabled: true },
      {
        label: "Quit Reverie",
        shortcut: "Cmd Q",
        onClick: () => window.studio?.window.close(),
      },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", onClick: () => editorAction("undo") },
      { label: "Redo", onClick: () => editorAction("redo") },
      "sep",
      {
        label: "Cut",
        onClick: () => editorAction("editor.action.clipboardCutAction"),
      },
      {
        label: "Copy",
        onClick: () => editorAction("editor.action.clipboardCopyAction"),
      },
      {
        label: "Paste",
        onClick: () => editorAction("editor.action.clipboardPasteAction"),
      },
      "sep",
      {
        label: "Find",
        shortcut: "Cmd F",
        onClick: () => editorAction("actions.find"),
      },
      {
        label: "Replace",
        onClick: () => editorAction("editor.action.startFindReplaceAction"),
      },
      { label: "Find in Project", disabled: true },
      "sep",
      {
        label: "Format Document",
        onClick: () => editorAction("editor.action.formatDocument"),
      },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "Command Palette",
        shortcut: "Cmd K",
        onClick: () => runCommand("command.palette"),
      },
      "sep",
      {
        label: "Explorer",
        shortcut: "Cmd 1",
        onClick: () => useStudio.getState().toggleExplorer(),
      },
      { label: "Terminal", shortcut: "Cmd J", onClick: out("terminal") },
      { label: "Problems", onClick: out("problems") },
      "sep",
      { label: "SurrealQL Preview", onClick: out("surrealql") },
      { label: "Linked Highlight", disabled: true },
      "sep",
      { label: "Titlebar Style", submenu: true, disabled: true },
      "sep",
      { label: "Zoom In", disabled: true },
      { label: "Zoom Out", disabled: true },
      { label: "Reset Zoom", disabled: true },
    ],
  },
  {
    label: "Schema",
    items: [
      { label: "Generate SurrealQL", onClick: out("surrealql") },
      { label: "Apply Schema to DB", disabled: true },
      "sep",
      { label: "New Migration", disabled: true },
      { label: "Run Migrations", submenu: true, disabled: true },
      { label: "Migration Status", disabled: true },
      "sep",
      { label: "Pull Schema from DB", disabled: true },
      { label: "Show Drift / Diff", disabled: true },
      "sep",
      { label: "Validate Schema", disabled: true },
      { label: "Open Schema Explorer", disabled: true },
    ],
  },
  {
    label: "Connection",
    items: [
      { label: "Connect", disabled: true },
      { label: "Disconnect", disabled: true },
      "sep",
      { label: "Switch Environment", submenu: true, disabled: true },
      { label: "Manage Connections", disabled: true },
      "sep",
      { label: "Open Query Console", disabled: true },
      { label: "Reset Sandbox (mem://)", disabled: true },
      "sep",
      { label: "Connection Info", disabled: true },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Documentation",
        onClick: openExternal(
          "https://github.com/msanchezdev/surreal-zod#readme",
        ),
      },
      {
        label: "SurrealQL Reference",
        onClick: openExternal("https://surrealdb.com/docs/surrealql"),
      },
      { label: "Keyboard Shortcuts", shortcut: "Cmd /", disabled: true },
      "sep",
      {
        label: "Release Notes",
        onClick: openExternal(
          "https://github.com/msanchezdev/surreal-zod/releases",
        ),
      },
      {
        label: "Report an Issue",
        onClick: openExternal(
          "https://github.com/msanchezdev/surreal-zod/issues/new",
        ),
      },
      "sep",
      { label: "About Reverie", disabled: true },
      { label: "Check for Updates", disabled: true },
    ],
  },
];
