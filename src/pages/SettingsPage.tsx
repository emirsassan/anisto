import { Component, createEffect, createSignal, For, onMount, Show } from "solid-js";
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

const SettingsPage: Component = () => {
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
      <Show when={showVideo()}>
        <div class="z-50 absolute top-0 left-0">
          <ChromaKeyVideo
            src="/videos/stuff.mp4"
            colorToRemove="#23cc00"
            smoothness={0.1}
            similarity={0.4}
            class="w-screen h-screen"
          />
        </div>
      </Show>

      <div class="text-text p-2">
        <Tabs
          tabs={[
            { id: "general", label: "General", content: <GeneralSettings setShowVideo={setShowVideo} /> },
            { id: "compiler", label: "Compiler", content: <CompilerSettings /> },
          ]}
        />
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

const GeneralSettings: Component<{ setShowVideo: (show: boolean) => void }> = (props) => {
  const [appDataDirPath, setAppDataDirPath] = createSignal("");
  const [checked, setChecked] = createSignal(false);

  onMount(async () => {
    setAppDataDirPath((await invoke("get_app_data_dir")) + "\\projects");
  });

  const [notification, setNotification] = createStore({
    message: "",
    open: false,
  });

  const [alert, setAlert] = createStore({
    open: false,
    title: "",
    message: "",
  });

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
        </div>

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

      <NotificationV
        message={notification.message}
        isOpen={notification.open}
        onClose={() => setNotification({ open: false })}
      />

      <Alert
        isOpen={alert.open}
        onOk={() => setAlert({ open: false })}
        onClose={() => setAlert({ open: false })}
      >
        <p>{alert.message}</p>
      </Alert>
    </>
  );
};

export default SettingsPage;
