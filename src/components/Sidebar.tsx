import { Component } from "solid-js";
import { Cog, FilePenLine } from "lucide-solid";

export const Sidebar: Component = () => {
  return (
    <div class="w-[4rem] bg-primary border-r border-zinc-800 flex flex-col items-center">
      {/* Navigation Icons */}
      <div class="flex flex-col">
        <button
          class="p-[0.9rem] transition-colors group relative text-text hover:bg-secondary hover:border hover:border-r hover:border-zinc-800"
        >
          <FilePenLine size={32} />
          <div class="absolute hidden rounded-md text-text group-hover:block select-none border border-zinc-800 bg-secondary px-2 py-1 left-[70px] whitespace-nowrap">
            Editor
          </div>
        </button>

        <div class="absolute bottom-0">
        <button
          class="p-[0.96rem] transition-colors group relative bg-text"
        >
          <Cog size={32} />
          <div class="absolute hidden text-text group-hover:block select-none border border-zinc-800 bg-secondary px-2 py-1 rounded-md left-[70px] whitespace-nowrap">
            Settings
          </div>
        </button>
        </div>
      </div>
    </div>
  );
}; 