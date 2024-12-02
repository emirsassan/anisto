import { Component, createSignal, For, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import Input from "../components/ui/Input";
import NotificationV from "../components/ui/Notification";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { createStore } from "solid-js/store";
import Tabs from "../components/ui/Tabs";

const SettingsPage: Component = () => {
  return (
    <div class="text-text p-2">
      <Tabs
        tabs={[
          { id: "general", label: "General", content: <GeneralSettings /> },
          { id: "compiler", label: "Compiler", content: <CompilerSettings /> },
        ]}
      />
    </div>
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

  return (
    <div class="flex flex-row">
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
          onClick={() => setCompilerOptions({ edit: !compilerOptions.edit })}
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
          onClick={() => showNotification("Settings saved")}
        >
          Test notification
        </Button>
        <Button
          class="max-w-96"
          onClick={() => showAlert("Test alert", "This is a test alert")}
        >
          Test alert
        </Button>
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
