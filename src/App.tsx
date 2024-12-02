import { Cog, FilePenLine, Folder, KeyboardMusic } from "lucide-solid";
import "./App.css";
import { Show, createEffect, createSignal } from "solid-js";
import Modal from "./components/Modal";
import Dropdown from "./components/Dropdown";
import { BoxTypes, DPadOptions, HighlightColors } from "./utils/options";
import ContextMenu from "./components/TestStuff";
import { getCurrentWindow } from "@tauri-apps/api/window";
import SettingsPage from "./pages/SettingsPage";
import ProjectList from "./components/ProjectList";
import { useProject } from "./context/projectProvider";
import { ProjectManager } from "./lib/projectManagment";
import { confidantPointCalculator } from "./utils/helpers";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import KeybindListener from "./components/KeybindListener";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import { createStore } from "solid-js/store";
import NotificationV from "./components/ui/Notification";
import Alert from "./components/ui/Alert";

function App() {
  const appWindow = getCurrentWindow();

  const [string, setString] = createSignal("");

  const [modalOpen, setModalOpen] = createSignal(false);

  const [boxType, setBoxType] = createSignal("MSG");

  const [val, setVal] = createSignal("");

  const [highlightColor, setHighlightColor] = createSignal<string | null>(null);

  const [contextMenu, setContextMenu] = createSignal<{
    x: number;
    y: number;
  } | null>(null);

  const [lipsync, setLipsync] = createSignal(false);

  const [highlightModal, setHighlightModal] = createSignal(false);
  const [highlightText, setHighlightText] = createSignal("");

  const [showSettings, setShowSettings] = createSignal(false);

  const [menubar, setMenubar] = createSignal("");

  const [newFileModal, setNewFileModal] = createSignal(false);

  const [newFileName, setNewFileName] = createSignal("");

  const [confidantPoint, setConfidantPoint] = createSignal(false);

  const [confidantPointModal, setConfidantPointModal] = createSignal(false);

  const [characterCheckbox, setCharacterCheckbox] = createSignal(false);

  const [characterName, setCharacterName] = createSignal("");

  const [confidantInfo, setConfidantInfo] = createSignal<{
    confidantId: number;
    pointsGained: number;
    modelId: number;
  } | null>(null);

  const [selectedFile, setSelectedFile] = createSignal<{
    id: number;
    name: string;
    text: string;
    output?: string;
    attributes?: any;
  } | null>(null);

  const [notification, setNotification] = createStore<{
    message: string;
    open: boolean;
  }>({
    message: "",
    open: false
  });

  const [compileModal, setCompileModal] = createSignal(false);

  const [compileFilePath, setCompileFilePath] = createSignal("");

  const [proj, { setProject }] = useProject();

  createEffect(async () => {
    const projectId = localStorage.getItem("project_id");
    if (!projectId) return;
    const project = await ProjectManager.getProject(projectId!);
    if ("error" in project) return;
    setProject(project);
  });

  const handleCloseProject = async () => {
    localStorage.removeItem("project_id");
    setProject(null);
    setSelectedFile(null);
    setMenubar("");
  };

  const handleAddNewFile = async () => {
    const currentProject = proj();
    if (!currentProject) return;

    setProject({
      ...currentProject,
      files: [
        ...(currentProject.files || []),
        {
          id: Date.now().toString(),
          name: newFileName(),
          text: "",
          attributes: {
            lipsync: false,
            confidantPoint: false,
            boxType: "MSG",
          },
        },
      ],
    });
    setNewFileModal(false);
    setNewFileName("");
  };

  const handleSaveFile = async (auto = false) => {
    const currentProject = proj();
    const currentFile = selectedFile();
    if (!currentProject || !currentFile) return;

    const updatedFiles = currentProject.files.map(
      (file: {
        id: number;
        name: string;
        text: string;
        output?: string;
        attributes?: any;
      }) =>
        file.id === currentFile.id
          ? {
              ...file,
              text: string(),
              output: processLivePreview(),
              attributes: {
                lipsync: lipsync(),
                confidantPoint: confidantPoint(),
                boxType: boxType().valueOf(),
                confidantId: confidantInfo()?.confidantId || null,
                pointsGained: confidantInfo()?.pointsGained || null,
                modelId: confidantInfo()?.modelId || null,
                characterName: characterName(),
                characterCheckbox: characterCheckbox(),
              },
            }
          : file
    );

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updated_at: new Date(),
    };

    await ProjectManager.saveProject(updatedProject);
    setProject(updatedProject);
    setNotification({
      message: auto ? "File automatically saved" : "File saved",
      open: true
    });
  };

  function processLivePreview() {
    return `[msg ${boxType()}_${
      proj()?.files.find(
        (x: { id: number; name: string; text: string }) =>
          x.id === selectedFile()?.id
      )?.name
    }${characterCheckbox() ? ` [${characterName()}]` : ""}]
[s]${lipsync() ? "[f 4 10 65535 0 0]" : ""}${
      confidantPoint()
        ? confidantPointCalculator(
            confidantInfo()?.confidantId || 0,
            confidantInfo()?.pointsGained || 0,
            confidantInfo()?.modelId || 0
          )
        : ""
    }${string()}[f 1 3 65535][w][e]`;
  }

  createEffect(() => {
    const file = selectedFile();
    if (file?.attributes) {
      setLipsync(!!file.attributes.lipsync);
      setConfidantPoint(!!file.attributes.confidantPoint);
      setBoxType(file.attributes.boxType || "MSG");
      setCharacterName(file.attributes.characterName || "");
      setCharacterCheckbox(!!file.attributes.characterName);

      if (
        file.attributes.confidantId ||
        file.attributes.pointsGained ||
        file.attributes.modelId
      ) {
        setConfidantInfo({
          confidantId: file.attributes.confidantId || 0,
          pointsGained: file.attributes.pointsGained || 0,
          modelId: file.attributes.modelId || 0,
        });
      } else {
        setConfidantInfo(null);
      }
    } else {
      setLipsync(false);
      setConfidantPoint(false);
      setBoxType("MSG");
      setConfidantInfo(null);
      setCharacterName("");
    }
  });

  const handleExportProject = async () => {
    const currentProject = proj();
    if (!currentProject) return;
    const path = await save({
      filters: [
        {
          name: "MSG File",
          extensions: ["msg"],
        },
      ],
    });
    await invoke("export_project", {
      projectId: currentProject.id,
      outputPath: path,
    });
    setMenubar("");
    setCompileFilePath(path || "");
    setCompileModal(true);
  };

  const handleCompile = async () => {
    await invoke("compile_msg", {
      msgPath: compileFilePath(),
    }).then(() => {
      setNotification({
        message: "Project compiled",
        open: true
      });
      setCompileModal(false);
      setCompileFilePath("");
    });
  };

  return (
    <div class="flex flex-col font-outfit" onClick={() => setContextMenu(null)}>
      <KeybindListener
        actions={{
          s: () => handleSaveFile(false),
        }}
      />
      <div
        class="h-[30px] w-screen bg-secondary flex items-center select-none border-b border-zinc-800"
        data-tauri-drag-region
      >
        <div class="text-text text-md px-[0.45rem]">Anisto</div>

        <div class="h-full w-[1px] bg-zinc-800" />

        <div id="menu">
          <div class="relative">
            <button
              onClick={() => setMenubar("project")}
              class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
            >
              Project
            </button>
            <Show when={menubar() === "project"}>
              <div class="fixed z-50 bg-secondary border border-zinc-800 shadow-lg py-1">
                <button
                  onClick={() => {
                    handleCloseProject();
                  }}
                  disabled={!proj()}
                  class="w-full px-4 py-1.5 disabled:opacity-50 text-sm text-text disabled:hover:bg-secondary hover:bg-primary text-left"
                >
                  Close project
                </button>

                <button
                  disabled={!proj()}
                  onClick={async () => await handleExportProject()}
                  class="w-full px-4 py-1.5 disabled:opacity-50 text-sm text-text disabled:hover:bg-secondary hover:bg-primary text-left"
                >
                  Export project
                </button>
              </div>
            </Show>
          </div>
        </div>

        <div class="absolute right-0">
          <button
            onClick={() => appWindow?.minimize()}
            class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
          >
            —
          </button>
          <button
            onClick={() => appWindow?.close()}
            class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      <div class="flex flex-1" onClick={() => setMenubar("")}>
        <div class="w-[60px] h-[calc(100vh-30px)] bg-primary border-r border-zinc-800">
          <div class="text-text flex items-center justify-center">
            <KeyboardMusic size={32} class="mt-2" />
          </div>

          <div class="w-full h-[1px] bg-zinc-800 my-2" />

          <div>
            <button
              onClick={() => setShowSettings(false)}
              class="group relative w-full h-[60px] text-text hover:bg-secondary transition-colors flex items-center justify-center"
            >
              <FilePenLine size={28} />
              <div class="absolute hidden group-hover:block select-none border border-zinc-800 bg-secondary px-2 py-1 rounded-md left-[70px] whitespace-nowrap">
                Editor
              </div>
            </button>
          </div>

          <div class="absolute bottom-0 w-[60px] bg-text h-[60px] flex items-center justify-center">
            <button
              onClick={() => setShowSettings(true)}
              class="group relative w-full h-full text-background hover:bg-primary/10 transition-colors items-center justify-center flex"
            >
              <Cog size={32} />
              <div class="absolute hidden text-text group-hover:block select-none border border-zinc-800 bg-secondary px-2 py-1 rounded-md left-[70px] whitespace-nowrap">
                Settings
              </div>
            </button>
          </div>
        </div>

        <Show
          when={showSettings()}
          fallback={
            <Show when={proj()} fallback={<ProjectList />}>
              <div class="flex-1 h-[calc(100vh-30px)] bg-background text-text flex">
                <div class="bg-neutral-900 h-full w-[100px]">
                  <div id="listing" class="select-none">
                    <Show when={proj()?.files?.length > 0}>
                      {proj()?.files?.map(
                        (x: { id: number; name: string; text: string }) => (
                          <>
                            <div
                              class="hover:bg-primary hover:cursor-pointer p-1 flex items-center justify-center"
                              onClick={() => {
                                handleSaveFile(true);
                                setSelectedFile(x);
                                setString(x.text);
                              }}
                            >
                              <p>{x.name}</p>
                            </div>
                          </>
                        )
                      )}
                    </Show>
                    <button
                      onClick={() => setNewFileModal(true)}
                      class="w-full hover:bg-primary hover:cursor-pointer p-1 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Show
                  when={selectedFile()}
                  fallback={
                    <div class="flex-1 flex items-center justify-center flex-col gap-4">
                      <p class="text-zinc-400 text-lg font-medium">
                        No string selected
                      </p>
                      <p class="text-zinc-500 text-sm">
                        Select a string to start editing
                      </p>
                    </div>
                  }
                >
                  <div class="flex-1 flex relative">
                    <div class="m-2">
                      <div id="breadcrumb" class="mb-4">
                        <p class="text-zinc-400 text-sm font-medium select-none">
                          Strings /{" "}
                          <span class="text-text">{selectedFile()?.name}</span>
                        </p>
                      </div>
                      <input
                        class="w-[40rem] bg-primary select-none text-text p-2 resize-none border border-zinc-800 focus:outline-none
                      [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                        placeholder="Enter text here..."
                        onInput={(e) => {
                          setString(e.target.value);
                          if (selectedFile()) {
                            setSelectedFile((prev) =>
                              prev ? { ...prev, text: e.target.value } : null
                            );
                          }
                        }}
                        value={selectedFile()?.text}
                        onKeyPress={(e) => {
                          if (e.code === "Enter") {
                            setSelectedFile((prev) =>
                              prev ? { ...prev, text: string() + "[n]" } : null
                            );
                            setString(string() + "[n]");
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY });
                        }}
                      />
                      <button
                        onClick={() => setModalOpen(true)}
                        class="select-none bg-white text-background hover:bg-white/90 px-4 py-2 transition-colors"
                      >
                        +
                      </button>
                      <div class="mt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="lipsync"
                          class="w-4 h-4 bg-secondary"
                          checked={lipsync()}
                          onChange={(e) => setLipsync(e.currentTarget.checked)}
                        />
                        <label
                          for="lipsync"
                          class="text-sm text-text select-none"
                        >
                          Lip sync
                        </label>
                      </div>

                      <div class="mt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="character"
                          class="w-4 h-4 bg-secondary"
                          checked={characterCheckbox()}
                          onChange={(e) =>
                            setCharacterCheckbox(e.currentTarget.checked)
                          }
                        />
                        <label
                          for="character"
                          class="text-sm text-text select-none"
                        >
                          Character
                        </label>
                      </div>

                      <Show when={characterCheckbox()}>
                        <div class="mt-4 flex items-center gap-2">
                          <Input
                            type="text"
                            label="Character name"
                            value={characterName()}
                            onInput={(e) => setCharacterName(e.target.value)}
                          />
                        </div>
                      </Show>

                      <Show when={characterCheckbox()}>
                        <div class="mt-4 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="confidant_point"
                            class="w-4 h-4 bg-secondary"
                            checked={confidantPoint()}
                            onChange={(e) =>
                              setConfidantPoint(e.currentTarget.checked)
                            }
                          />
                          <label
                            for="confidant_point"
                            class="text-sm text-text select-none"
                          >
                            Confidant point
                          </label>

                          <Show when={confidantPoint()}>
                            <Button
                              onClick={() => setConfidantPointModal(true)}
                              size="sm"
                              variant="secondary"
                            >
                              +
                            </Button>
                          </Show>

                          <Modal
                            isOpen={confidantPointModal()}
                            onClose={() => setConfidantPointModal(false)}
                            title="Confidant point"
                          >
                            <div class="p-2 select-none">
                              <input
                                type="number"
                                placeholder="Confidant ID"
                                class="w-full bg-primary border border-zinc-800 focus:outline-none p-2 mb-2"
                                value={confidantInfo()?.confidantId || ""}
                                onInput={(e) =>
                                  setConfidantInfo((prev) => ({
                                    ...prev,
                                    confidantId: parseInt(e.target.value),
                                    pointsGained: prev?.pointsGained || 0,
                                    modelId: prev?.modelId || 0,
                                  }))
                                }
                              />

                              <input
                                type="number"
                                placeholder="Points Gained"
                                class="w-full bg-primary border border-zinc-800 focus:outline-none p-2 mb-2"
                                value={confidantInfo()?.pointsGained || ""}
                                onInput={(e) =>
                                  setConfidantInfo((prev) => ({
                                    ...prev,
                                    pointsGained: parseInt(e.target.value),
                                    confidantId: prev?.confidantId || 0,
                                    modelId: prev?.modelId || 0,
                                  }))
                                }
                              />

                              <input
                                type="number"
                                placeholder="Model ID"
                                class="w-full bg-primary border border-zinc-800 focus:outline-none p-2 mb-2"
                                value={confidantInfo()?.modelId || ""}
                                onInput={(e) =>
                                  setConfidantInfo((prev) => ({
                                    ...prev,
                                    modelId: parseInt(e.target.value),
                                    confidantId: prev?.confidantId || 0,
                                    pointsGained: prev?.pointsGained || 0,
                                  }))
                                }
                              />
                            </div>
                          </Modal>
                        </div>
                      </Show>

                      <div class="absolute select-none bottom-4 right-4 flex gap-2">
                        <Button
                          onClick={() => handleSaveFile(false)}
                          variant="secondary"
                        >
                          Save
                        </Button>
                      </div>

                      <div class="absolute top-4 right-4 w-96 select-none">
                        <Dropdown
                          options={BoxTypes}
                          value={boxType()}
                          onChange={(value) => setBoxType(value.toString())}
                          label="Select box type"
                        />
                      </div>

                      <Modal
                        isOpen={modalOpen()}
                        onClose={() => setModalOpen(false)}
                        title="Insert icon"
                      >
                        <div class="px-2 pt-1 select-none">
                          <Dropdown
                            options={DPadOptions}
                            value={val()}
                            onChange={(value) => setVal(value.toString())}
                            label="Select icon"
                          />
                        </div>
                        <div class="px-2 select-none">
                          <div class="absolute bottom-2 mt-2 w-fit">
                            <button
                              onClick={() => {
                                setString(string() + val());
                                setSelectedFile((prev) =>
                                  prev
                                    ? { ...prev, text: prev.text + val() }
                                    : null
                                );
                                setModalOpen(false);
                                setVal("");
                              }}
                              class="w-fit px-4 py-2 text-text bg-primary transition-colors"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      </Modal>

                      <div
                        class="absolute bottom-4 left-4 w-[50rem] max-h-[208px] overflow-y-auto bg-secondary text-text p-1
                      [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                      >
                        <p class="text-zinc-400 text-sm font-medium select-none">
                          Live preview
                        </p>
                        <Show
                          when={string()}
                          fallback={
                            <p class="text-zinc-400 text-sm">
                              No text to preview
                            </p>
                          }
                        >
                          <pre class="font-mono text-sm whitespace-pre-wrap break-words">
                            <code>
                              {/* {`[msg ${boxType()}_004_0_0 [Kasumi]]
[s][bup 0 10 201 0 0][f 4 10 65535 0 0][vp 8 2 0 57157 65535 0][f 5 13 33 5 10]${string()}[f 1 3 65535][w][e]`} */}
                              {processLivePreview()}
                            </code>
                          </pre>
                        </Show>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>
          }
        >
          <div class="flex-1">
            <SettingsPage />
          </div>
        </Show>
      </div>
      <Show when={contextMenu()}>
        <ContextMenu
          x={contextMenu()!.x}
          y={contextMenu()!.y}
          onClose={() => setContextMenu(null)}
          onCopy={() => {
            const selection = window.getSelection()?.toString();
            if (selection) {
              navigator.clipboard.writeText(selection);
            }
          }}
          onCut={() => {
            const selection = window.getSelection()?.toString();
            if (selection) {
              navigator.clipboard.writeText(selection);
              setString(string().replace(selection, ""));
            }
          }}
          onPaste={async () => {
            const text = await navigator.clipboard.readText();
            const cursorPos =
              (document.activeElement as HTMLInputElement)?.selectionStart ??
              string().length;
            const newValue =
              string().slice(0, cursorPos) + text + string().slice(cursorPos);
            setString(newValue);
          }}
          onHighlight={() => {
            setHighlightModal(true);
            setHighlightText(window.getSelection()?.toString() ?? "");
          }}
        />
      </Show>

      <Modal
        isOpen={highlightModal()}
        onClose={() => setHighlightModal(false)}
        title="Highlight"
      >
        <div class="px-2 select-none">
          <Dropdown
            options={HighlightColors}
            value={highlightColor() ?? ""}
            onChange={(value) => setHighlightColor(value.toString())}
            label="Select highlight color"
          />
        </div>
        <div class="absolute bottom-2 px-2 w-96 select-none">
          <button
            onClick={() => {
              setString(
                string().replace(
                  highlightText(),
                  `[clr ${highlightColor() ?? "0"}]${highlightText()}`
                )
              );
              setSelectedFile((prev) =>
                prev
                  ? {
                      ...prev,
                      text: prev.text.replace(
                        highlightText(),
                        `[clr ${highlightColor() ?? "0"}]${highlightText()}`
                      ),
                    }
                  : null
              );
              setHighlightModal(false);
              setHighlightColor(null);
            }}
            class="w-fit px-4 py-2 text-text bg-primary transition-colors"
          >
            Highlight
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={newFileModal()}
        onClose={() => setNewFileModal(false)}
        title="New string"
      >
        <div class="p-2 select-none">
          <input
            type="text"
            placeholder="String name"
            class="w-full bg-primary border border-zinc-800 focus:outline-none p-2"
            onInput={(e) => setNewFileName(e.target.value)}
            value={newFileName()}
          />

          <div class="absolute bottom-2 px-2 w-96 select-none">
            <button
              onClick={handleAddNewFile}
              class="w-fit px-4 py-2 text-text bg-primary transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Alert isOpen={compileModal()} onOk={handleCompile} onClose={() => setCompileModal(false)} title="Compile">
        <p class="text-text">
          Do you want to compile the output file?
        </p>
      </Alert>

      <NotificationV duration={3000} message={notification.message} isOpen={notification.open} onClose={() => setNotification({ open: false })} />
    </div>
  );
}

export default App;
