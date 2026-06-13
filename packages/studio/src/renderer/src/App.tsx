import { useState } from "react";
import { ActivityRail } from "./components/ActivityRail";
import { Chrome } from "./components/Chrome";
import { CommandPalette } from "./components/CommandPalette";
import { Keybindings } from "./components/Keybindings";
import { StatusBar } from "./components/StatusBar";
import { Workbench } from "./workbench/Workbench";

export function App() {
  const [active, setActive] = useState("code");
  return (
    <div className="app">
      <Keybindings />
      <Chrome />
      <div className="body">
        <ActivityRail active={active} onSelect={setActive} />
        <main className="workbench">
          <Workbench />
        </main>
      </div>
      <StatusBar />
      <CommandPalette />
    </div>
  );
}
