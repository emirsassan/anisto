import { Show } from "solid-js";

interface ProjectMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ProjectMenu(props: ProjectMenuProps) {
  return (
    <div class="relative">
      <button
        onClick={props.onToggle}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        Project
      </button>
    </div>
  );
} 