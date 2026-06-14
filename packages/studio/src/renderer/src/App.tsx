import { PanelLeft } from "lucide-react";
import { useState } from "react";
import { ActivityRail } from "./components/ActivityRail";
import { Chrome } from "./components/Chrome";
import { CommandPalette } from "./components/CommandPalette";
import { FileExplorer } from "./components/FileExplorer";
import { Keybindings } from "./components/Keybindings";
import { StatusBar } from "./components/StatusBar";
import { useStudio } from "./store";
import { Workbench } from "./workbench/Workbench";

export function App() {
  const [active, setActive] = useState("code");
  const [explorerWidth, setExplorerWidth] = useState(264);
  const explorerCollapsed = useStudio((s) => s.explorerCollapsed);
  const setExplorerCollapsed = useStudio((s) => s.setExplorerCollapsed);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = explorerWidth;
    const move = (ev: MouseEvent) =>
      setExplorerWidth(
        Math.min(480, Math.max(180, startW + ev.clientX - startX)),
      );
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const showExplorer = active === "code";

  return (
    <div className="app">
      <Keybindings />
      <Chrome />
      <div className="body">
        <ActivityRail active={active} onSelect={setActive} />
        {showExplorer &&
          (explorerCollapsed ? (
            <button
              type="button"
              className="explorer-reopen"
              title="Open Explorer"
              onClick={() => setExplorerCollapsed(false)}
            >
              <PanelLeft size={16} />
            </button>
          ) : (
            <>
              <div className="explorer-wrap" style={{ width: explorerWidth }}>
                <FileExplorer onCollapse={() => setExplorerCollapsed(true)} />
              </div>
              <button
                type="button"
                className="explorer-resizer"
                aria-label="Resize Explorer"
                onMouseDown={startResize}
              />
            </>
          ))}
        <main className="workbench">
          <Workbench />
        </main>
      </div>
      <StatusBar />
      <CommandPalette />
    </div>
  );
}
