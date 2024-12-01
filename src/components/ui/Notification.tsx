import { Show, type Component, onMount } from "solid-js";
import { Portal } from "solid-js/web";

interface NotificationProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const NotificationV: Component<NotificationProps> = (props) => {
  // this is broken needs fixing
  onMount(() => {
    if (props.isOpen) {
      const timeout = setTimeout(() => {
        props.onClose();
      }, props.duration || 3000);

      return () => clearTimeout(timeout);
    }
  });

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="fixed top-4 left-1/2 z-50 animate-fade-in">
          <div class={`bg-primary text-white px-4 py-2 border border-zinc-800 shadow-lg flex items-center justify-between gap-4`}>
            <span>{props.message}</span>
            <button
              onClick={props.onClose}
              class="hover:text-zinc-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default NotificationV;
