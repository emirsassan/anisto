import { Show, type Component, onMount, onCleanup } from "solid-js";

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
  title?: string;
  description?: string;
  showClose?: boolean;
  class?: string;
}

const FocusModal: Component<FocusModalProps> = (props) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && props.isOpen) {
      props.onClose();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 z-50 p-4">
        <div class="h-full w-full bg-background flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-zinc-800 bg-secondary">
            <div>
              <h2 class="text-text font-medium text-xl">{props.title || "Modal"}</h2>
              <Show when={props.description}>
                <p class="text-zinc-400 text-sm mt-1">{props.description}</p>
              </Show>
            </div>
            <Show when={props.showClose !== false}>
              <div class="flex items-center gap-2">
                <span class="text-zinc-400 text-sm select-none">ESC</span>
                <button
                  onClick={props.onClose}
                  class="text-text hover:text-zinc-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </Show>
          </div>

          <div
            class={`flex-1 overflow-y-auto text-text
              ${props.class || ""}`}
          >
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
};

export default FocusModal;
