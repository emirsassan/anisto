import { Portal } from "solid-js/web";

interface ContextMenuProps {
  x: number;
  y: number;
  actions: { label: string; action: () => void }[];
}

const ContextMenuV2 = (props: ContextMenuProps) => {

  return (
    <Portal>
      <div
        class="fixed z-50 bg-secondary border border-zinc-800 shadow-lg py-1"
        style={{
          left: `${props.x}px`,
          top: `${props.y}px`,
        }}
      >
        {props.actions.map((item) => (
          <button
            class="w-full px-4 py-1.5 text-sm text-text hover:bg-primary text-left"
            onClick={() => {
              item.action();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </Portal>
  );
};

export default ContextMenuV2;
