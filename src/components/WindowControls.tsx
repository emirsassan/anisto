import { Info } from "lucide-solid";

interface WindowControlsProps {
  appWindow: any;
}

export function WindowControls(props: WindowControlsProps) {
  return (
    <div class="flex absolute right-0">
      <button class="text-text hover:bg-primary transition-colors py-0.5 px-2" title="Settings">
        <Info class="size-4" />
      </button>
      <button
        onClick={() => props.appWindow?.minimize()}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        —
      </button>
      <button
        onClick={() => props.appWindow?.close()}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        ✕
      </button>
    </div>
  );
} 