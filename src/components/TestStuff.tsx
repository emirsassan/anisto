import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onHighlight: () => void;
}

const ContextMenu = (props: ContextMenuProps) => {
  const menuItems = [
    { label: "Highlight", action: props.onHighlight },
    { label: "Cut", action: props.onCut },
    { label: "Paste", action: props.onPaste },
  ];

  return (
    <Portal>
      <div
        class="fixed z-50 bg-secondary border border-zinc-800 shadow-lg py-1"
        style={{
          left: `${props.x}px`,
          top: `${props.y}px`,
        }}
      >
        {menuItems.map((item) => (
          <button
            class="w-full px-4 py-1.5 text-sm text-text hover:bg-primary text-left"
            onClick={() => {
              item.action();
              props.onClose();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </Portal>
  );
};

export default ContextMenu;
