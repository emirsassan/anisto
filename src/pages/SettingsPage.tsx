import { Component, createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import Input from "../components/ui/Input";
import NotificationV from "../components/ui/Notification";
import Button from "../components/ui/Button";

const SettingsPage: Component = () => {
  const [appDataDirPath, setAppDataDirPath] = createSignal("");

  onMount(async () => {
    setAppDataDirPath((await invoke("get_app_data_dir")) + "\\projects");
  });

  const [notificationOpen, setNotificationOpen] = createSignal(false);
  const [notificationMessage, setNotificationMessage] = createSignal("");

  const showNotification = (
    message: string
  ) => {
    setNotificationMessage(message);
    setNotificationOpen(true);

    setTimeout(() => {
      setNotificationOpen(false);
    }, 3000);
  };

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
          <Input
            value={appDataDirPath()}
            type="text"
            size="full"
            class="max-w-[30rem]"
          />
        </div>

        <Button class="max-w-96" onClick={() => showNotification("Settings saved")}>Test notification</Button>
      </div>

      <NotificationV message={notificationMessage()} isOpen={notificationOpen()} onClose={() => setNotificationOpen(false)} />
    </div>
  );
};

export default SettingsPage;
