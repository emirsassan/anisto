import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import Input from "../components/ui/Input";
import NotificationV from "../components/ui/Notification";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { createStore } from "solid-js/store";
import Tabs from "../components/ui/Tabs";
import KeybindListener from "../components/KeybindListener";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "../components/ui/Table";
import Switch from "../components/ui/Switch";
import ChromaKeyVideo from "../components/experiments/ChromaKeyVideo";
import FocusModal from "../components/ui/FocusModal";
import FileTree from "../components/FileTree";
import { WindowControls } from "../components/WindowControls";
import { getCurrentWindow } from "@tauri-apps/api/window";

const SettingsPage: Component = () => {
  const appWindow = getCurrentWindow();
  const [showVideo, setShowVideo] = createSignal(false);

  createEffect(() => {
    if (showVideo()) {
      setTimeout(() => {
        setShowVideo(false);
      }, 4000);
    }
  });

  return (
    <>
      <div class="flex flex-col font-outfit h-screen">
        {/* App Header */}
        <header
          class="h-[30px] bg-secondary flex items-center select-none border-b border-zinc-800"
          data-tauri-drag-region
        >
          <div class="text-text text-md px-[0.6rem]">Anisto</div>

          {/* Window Controls */}
          <WindowControls appWindow={appWindow} />
        </header>

        {/* Main Content */}
        <main class="flex flex-1">
          <Show when={showVideo()}>
            <div class="z-50 absolute top-0 left-0">
              <ChromaKeyVideo
                src="/videos/trans_joker_ong_regreen_2.qt"
                colorToRemove="#00ff00"
                smoothness={0}
                similarity={0.7}
                class="w-screen h-screen"
              />
            </div>
          </Show>

          <div class="text-text p-2 w-full">
            <Tabs
              tabs={[
                {
                  id: "general",
                  label: "General",
                  content: <GeneralSettings />,
                },
                {
                  id: "compiler",
                  label: "Compiler",
                  content: <CompilerSettings />,
                },
                {
                  id: "ui",
                  label: "Experiments",
                  content: <UiExperiments setShowVideo={setShowVideo} />,
                },
                {
                  id: "feature-flags",
                  label: "Feature Flags",
                  content: <FeatureFlags />,
                },
              ]}
            />
          </div>
        </main>
      </div>
    </>
  );
};

const CompilerSettings: Component = () => {
  const [compilerOptions, setCompilerOptions] = createStore({
    flags: "-Compile -OutFormat V1BE -Library P5R",
    edit: false,
  });

  const [compilerOutput, setCompilerOutput] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleTestCompiler = async () => {
    setLoading(true);
    const output = await invoke("test_compiler");
    console.log(output);
    setCompilerOutput(output as string);
    setLoading(false);
  };

  const handleSaveSetting = async () => {
    try {
      await invoke("set_string_setting", {
        key: "compiler_flags",
        value: compilerOptions.flags,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  createEffect(async () => {
    const setting: { String: string } = await invoke("get_setting", {
      key: "compiler_flags",
    });
    setCompilerOptions({ flags: setting.String });
  });

  return (
    <div class="flex flex-row">
      <KeybindListener
        actions={{
          s: () => {
            handleSaveSetting();
          },
        }}
      />
      <div class="flex flex-col gap-2">
        <p class="text-sm text-zinc-400">
          Settings for the compiler. (work in progress)
        </p>
        <textarea
          class="w-96 bg-primary resize-none text-text p-2 border border-zinc-800 focus:outline-none"
          rows={3}
          readOnly={!compilerOptions.edit}
          value={compilerOptions.flags}
          onInput={(e) => setCompilerOptions({ flags: e.currentTarget.value })}
        />

        <Button
          onClick={() => {
            setCompilerOptions({ edit: !compilerOptions.edit });
            if (compilerOptions.edit) {
              handleSaveSetting();
            }
          }}
          class="max-w-96"
          variant="secondary"
        >
          {compilerOptions.edit ? "Save" : "Edit"}
        </Button>
      </div>

      <div class="absolute right-32">
        <p class="text-sm text-zinc-400">Test compiler flags</p>
        <div class="flex flex-col font-sans bg-primary overflow-y-auto p-2 border border-zinc-800 w-[35rem] h-[30rem] min-w-[35rem] min-h-[30rem] gap-2">
          <p class="text-sm text-text">{compilerOutput()}</p>
        </div>
        <Button
          variant="secondary"
          class="w-full mt-2 disabled:opacity-50"
          onClick={handleTestCompiler}
          disabled={loading()}
        >
          Test compiler
        </Button>
      </div>
    </div>
  );
};

const GeneralSettings: Component = () => {
  const [appDataDirPath, setAppDataDirPath] = createSignal("");
  const [autoSaveNotifications, setAutoSaveNotifications] = createSignal<
    boolean | any
  >();

  onMount(async () => {
    setAppDataDirPath((await invoke("get_app_data_dir")) + "\\projects");
  });

  createEffect(async () => {
    try {
      const setting: { Boolean: boolean } = await invoke("get_setting", {
        key: "auto_save_notifications",
      });
      if (setting.Boolean) {
        setAutoSaveNotifications(setting.Boolean);
      }
    } catch (error) {
      console.error("Failed to load feature flags:", error);
    }
  });

  const handleFlagChange = async (checked: boolean) => {
    setAutoSaveNotifications(checked);
    try {
      await invoke("set_boolean_setting", {
        key: "auto_save_notifications",
        value: autoSaveNotifications(),
      });
    } catch (error) {
      console.error("Failed to save feature flags:", error);
    }
  };

  return (
    <>
      <div class="flex flex-col gap-2">
        <div id="project-path">
          <h3 class="text-md font-medium">Project Path</h3>
          <p class="text-sm text-zinc-400">
            The path to the project directory. (work in progress)
          </p>
          <Input
            value={appDataDirPath()}
            type="text"
            size="full"
            class="max-w-[30rem]"
          />

          <div class="mt-4">
            <Switch
              checked={autoSaveNotifications()}
              label="Auto-save notifications"
              onChange={handleFlagChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const UiExperiments: Component<{ setShowVideo: (show: boolean) => void }> = (
  props
) => {
  const [notification, setNotification] = createStore({
    message: "",
    open: false,
  });

  const [Aalert, setAlert] = createStore({
    open: false,
    title: "",
    message: "",
  });

  const [showFocusModal, setShowFocusModal] = createSignal(false);

  const [checked, setChecked] = createSignal(false);

  const showNotification = (message: string) => {
    setNotification({
      message,
      open: true,
    });

    setTimeout(() => {
      setNotification({ open: false });
    }, 3000);
  };

  const showAlert = (title: string, message: string) => {
    setAlert({ open: true, title, message });
  };

  const handleSwitchChange = (checked: boolean) => {
    setChecked(checked);
    if (checked) {
      props.setShowVideo(true);
      setTimeout(() => {
        setChecked(false);
      }, 4000);
    }
  };

  const items = [
    {
      id: "1",
      name: "src",
      type: "folder" as const,
      children: [
        {
          id: "2",
          name: "components",
          type: "folder" as const,
          children: [
            {
              id: "3",
              name: "FileTree.tsx",
              type: "file" as const,
            },
          ],
        },
        {
          id: "4",
          name: "App.tsx",
          type: "file" as const,
        },
      ],
    },
    {
      id: "5",
      name: "package.json",
      type: "file" as const,
    },
  ];

  return (
    <>
      <div>
        <h3 class="text-md font-medium">UI Experiments</h3>
        <p class="text-sm text-zinc-400">Some experiments with the UI</p>
      </div>
      <div class="flex flex-col gap-2">
        <Button
          class="max-w-96"
          onClick={() => {
            showNotification("Settings saved");
          }}
        >
          Test notification
        </Button>

        <Button
          class="max-w-96"
          onClick={() => showAlert("Test alert", "This is a test alert")}
        >
          Test alert
        </Button>

        <Button class="max-w-96" onClick={() => setShowFocusModal(true)}>
          Test focus modal
        </Button>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Light Mode</TableCell>
              <TableCell>
                <Switch
                  checked={checked()}
                  label="JONKLER"
                  onChange={handleSwitchChange}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <FocusModal
        isOpen={showFocusModal()}
        onClose={() => setShowFocusModal(false)}
        title="Test focus modal"
      >
        <div class="p-4">
          <h2 class="text-text font-medium text-xl">Test modal</h2>
          <p class="text-zinc-400 text-sm mt-1">This is a test modal</p>

          <FileTree
            items={items}
            onFileSelect={(file) => {
              console.log("Selected file:", file);
            }}
            selectedFileId="3" // ID of currently selected file
          />
        </div>
      </FocusModal>

      <NotificationV
        message={notification.message}
        isOpen={notification.open}
        onClose={() => setNotification({ open: false })}
      />

      <Alert
        isOpen={Aalert.open}
        onOk={() => setAlert({ open: false })}
        onClose={() => setAlert({ open: false })}
      >
        <p>{Aalert.message}</p>
      </Alert>
    </>
  );
};

const FeatureFlags: Component = () => {
  interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    checked: boolean;
  }

  const [flags, setFlags] = createSignal<FeatureFlag[]>([
    {
      id: "message-box-live-preview",
      name: "Message box live preview",
      description:
        "Enables live preview of message boxes in the message editor.",
      checked: false,
    },
    {
      id: "wip-editor",
      name: "WIP Editor",
      description:
        "Enables the work-in-progress editor with improved features and UI (No saving).",
      checked: false,
    },
  ]);

  createEffect(async () => {
    try {
      const setting: { String: string } = await invoke("get_setting", {
        key: "feature_flags",
      });
      if (setting.String) {
        const savedFlags = JSON.parse(setting.String);
        setFlags(
          flags().map((flag) => ({
            ...flag,
            checked:
              savedFlags.find((f: FeatureFlag) => f.id === flag.id)?.checked ??
              flag.checked,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load feature flags:", error);
    }
  });

  const handleFlagChange = async (id: string, checked: boolean) => {
    setFlags((prev) =>
      prev.map((flag) => (flag.id === id ? { ...flag, checked } : flag))
    );

    try {
      await invoke("set_string_setting", {
        key: "feature_flags",
        value: JSON.stringify(flags()),
      });
    } catch (error) {
      console.error("Failed to save feature flags:", error);
    }
  };

  return (
    <div>
      <div class="mb-2">
        <h3 class="text-md font-medium">Feature Flags</h3>
        <p class="text-sm text-zinc-400">
          Some feature flags might require a restart to take effect.
        </p>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <For each={flags()}>
          {(item) => (
            <div class="relative bg-secondary p-2 border border-zinc-800 rounded-md">
              <h4 class="text-md font-medium">{item.name}</h4>
              <p class="text-sm text-zinc-400 max-w-[20rem]">
                {item.description}
              </p>

              <div class="absolute bottom-2 right-2">
                <Switch
                  checked={item.checked}
                  onChange={(checked) => handleFlagChange(item.id, checked)}
                />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default SettingsPage;
