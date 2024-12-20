import { createSignal } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Editor } from "./components/Editor/Editor";
import { WindowControls } from "./components/WindowControls";
import { ProjectMenu } from "./components/ProjectMenu";

function App() {
  const appWindow = getCurrentWindow();
  const [menubar, setMenubar] = createSignal("");

  return (
    <div class="flex flex-col font-outfit h-screen">
      {/* App Header */}
      <header
        class="h-[30px] bg-secondary flex items-center select-none border-b border-zinc-800"
        data-tauri-drag-region
      >
        <div class="text-text text-md px-[0.6rem]">Anisto</div>

        {/* Project Menu */}
        <ProjectMenu
          isOpen={menubar() === "project"}
          onToggle={() => setMenubar((m) => (m === "project" ? "" : "project"))}
        />

        {/* Window Controls */}
        <WindowControls appWindow={appWindow} />
      </header>

      {/* Main Content */}
      <main class="flex flex-1">
        <Editor />
      </main>
    </div>
  );
}

export default App;
