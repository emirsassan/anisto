import { Component, createSignal, For, Show, onMount, onCleanup, createEffect } from "solid-js";
import { Portal } from "solid-js/web";
import { cva } from "cva";

const commandStyles = cva({
  base: "fixed inset-0 z-50 bg-black/50 p-4 flex items-start justify-center",
  variants: {
    open: {
      true: "opacity-100",
      false: "opacity-0 pointer-events-none"
    }
  }
});

export interface CommandItem {
  id: string;
  label: string;
  icon?: Component;
  action: () => void;
  shortcut?: string[];
}

interface CommandProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}

const Command: Component<CommandProps> = (props) => {
  const [search, setSearch] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.isOpen) {
      setTimeout(() => inputRef?.focus(), 0);
    }
  });

  onMount(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && props.isOpen) {
        props.onClose();
        setSearch("")
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleGlobalKeyDown));
  });

  const filteredItems = () => {
    const searchTerm = search().toLowerCase();
    return props.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm)
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      props.onClose();
      setSearch("")
    }
  };

  const handleSelect = (item: CommandItem) => {
    item.action();
    props.onClose();
    setSearch("")
  };

  return (
    <Portal>
      <div 
        class={commandStyles({ open: props.isOpen })}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            props.onClose();
          }
        }}
      >
        <div class="w-[640px] mt-[20vh] bg-secondary border border-zinc-800 overflow-hidden">
          <div class="border-b border-zinc-800">
            <input
              ref={inputRef}
              type="text"
              class="w-full bg-transparent px-4 py-3 text-text outline-none"
              placeholder={props.placeholder || "Type a command..."}
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div class="max-h-[300px] overflow-y-auto">
            <Show 
              when={filteredItems().length > 0}
              fallback={
                <div class="py-6 text-center text-zinc-400">
                  No results found.
                </div>
              }
            >
              <For each={filteredItems()}>
                {(item) => (
                  <button
                    class="w-full px-4 py-2 flex items-center justify-between hover:bg-primary text-left"
                    onClick={() => handleSelect(item)}
                  >
                    <div class="flex items-center gap-3 text-text">
                      <Show when={item.icon}>
                        <div class="w-4 h-4">
                          {item.icon?.({class: "w-4 h-4"})}
                        </div>
                      </Show>
                      {item.label}
                    </div>

                    <Show when={item.shortcut}>
                      <div class="flex items-center gap-1">
                        <For each={item.shortcut}>
                          {(key) => (
                            <kbd class="px-2 py-1 text-xs text-text bg-primary rounded">
                              {key}
                            </kbd>
                          )}
                        </For>
                      </div>
                    </Show>
                  </button>
                )}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Command;
