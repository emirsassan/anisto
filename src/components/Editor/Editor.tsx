import { Component, createSignal, Show } from "solid-js";
import FileTree from "../FileTree";
import KeybindListener from "../KeybindListener";
import { A } from "@solidjs/router";
import Button from "../ui/Button";
import { MessageSquareMore, MessageSquarePlus } from "lucide-solid";

export const Editor: Component = () => {
  const fileTree = [
    {
      id: "1",
      name: "EVENT_DATA",
      type: "folder" as const,
      children: [
        {
          id: "2",
          name: "MESSAGE",
          type: "folder" as const,
          children: [
            {
              id: "3",
              name: "E400",
              type: "folder" as const,
              children: [
                { id: "4", name: "E484_120", type: "file" as const },
                { id: "4", name: "E484_120", type: "file" as const },
                { id: "4", name: "E484_120", type: "file" as const },
                {
                  id: "4",
                  name: "E484_121",
                  type: "folder" as const,
                  children: [
                    { id: "4", name: "E484_120", type: "file" as const },
                    {
                      id: "4",
                      name: "E484_121",
                      type: "folder" as const,
                      children: [
                        { id: "4", name: "E484_120", type: "file" as const },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "5",
              name: "E700",
              type: "folder" as const,
              children: [{ id: "6", name: "E790_001", type: "file" as const }],
            },
          ],
        },
      ],
    },
  ];

  const [hidden, setHidden] = createSignal(false);

  return (
    <div class="flex w-full">
      <KeybindListener
        actions={{
          b: () => setHidden(!hidden()),
        }}
      />
      {/* File Tree Panel */}
      <div class="bg-secondary" hidden={hidden()}>
        <div class="h-fit">
          <FileTree items={fileTree} />
        </div>
      </div>

      {/* Editor Panel */}
      <div class="flex-1 flex flex-col bg-background">
        <Show
          when={true}
          fallback={
            <div class="flex-1 flex items-center justify-center flex-col gap-4">
              <p class="text-zinc-400 text-lg font-medium">No file selected</p>
              <p class="text-zinc-500 text-sm">
                Select a file to start editing
              </p>
              <A href="/settings" class="text-zinc-500 text-sm">
                Or go to settings idk
              </A>
            </div>
          }
        >
          <div class="text-text font-outfit">
            <div class="relative flex bg-primary border-zinc-800 border m-2 p-3">
              <div class="flex gap-1">
              <MessageSquareMore />

              <p class="text-md">BTTL_0</p>
              </div>

              <div class="absolute self-center right-2">
<Button variant="secondary" size="sm">Edit</Button>
              </div>
            </div>

            <div class="relative flex bg-primary border-zinc-800 border m-2 p-3">
              <div class="flex gap-1">
              <MessageSquarePlus />
              
              <p class="text-md">BTTL_1</p>
              </div>

              <div class="absolute self-center right-2">
<Button variant="secondary" size="sm">Edit</Button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};
