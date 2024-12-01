import { Show, type Component } from "solid-js";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
  title?: string;
}

const Modal: Component<ModalProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-secondary border border-zinc-800 w-[500px] relative">
          {/* Header */}
          <div class="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 class="text-text font-medium">{props.title || "Modal"}</h2>
            <button
              onClick={props.onClose}
              class="text-text hover:text-zinc-400 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            class="text-text min-h-[150px] max-h-[calc(100vh-150px)] overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Modal;
