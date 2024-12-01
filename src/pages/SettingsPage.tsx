import { Component, createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

const SettingsPage: Component = () => {
  const [appDataDirPath, setAppDataDirPath] = createSignal("");

  onMount(async () => {
    setAppDataDirPath(await invoke("get_app_data_dir") + "\\projects");
  });

  return (
    <div class="text-text p-2">
      <h1 class="text-xl font-medium">Settings</h1>
      <p class="text-sm text-zinc-400">
        Settings are automatically saved. (Will be implemented in the future)
      </p>

      <div class="flex flex-col gap-2 mt-4">

        <div id="project-path">
          <h3 class="text-md font-medium">Project Path</h3>
          <p class="text-sm text-zinc-400">
            The path to the project directory.
          </p>
          <input value={appDataDirPath()} type="text" class="w-full p-1 bg-primary border border-zinc-800 focus:outline-none max-w-[30rem]" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
