import { Show, type Component } from "solid-js";
import Button from "./Button";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
  title?: string;
  onOk?: () => void;
}

const Alert: Component<AlertProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-secondary border border-zinc-800 w-[500px] relative">
          <div class="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 class="text-text font-medium select-none">{props.title || "Alert"}</h2>
            <button
              onClick={props.onClose}
              class="text-text hover:text-zinc-400 transition-colors select-none"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            class="text-text max-h-[calc(100vh-100px)] p-2 overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {props.children}
          </div>

          <div class="flex items-center justify-end p-4 gap-2 select-none">
            <Button onClick={props.onClose}>Cancel</Button>
            <Button onClick={props.onOk} variant="secondary">OK</Button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Alert;
