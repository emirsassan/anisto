import { For, Show, createSignal, type Component } from "solid-js";
import { cva } from "cva";

const tabStyles = cva({
  base: "px-4 py-2 transition-colors select-none",
  variants: {
    active: {
      true: "bg-primary text-text border-t border-x border-zinc-800",
      false: "text-zinc-400 hover:text-text hover:bg-primary/50"
    }
  }
});

export interface Tab {
  id: string;
  label: string;
  content: any;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  class?: string;
}

const Tabs: Component<TabsProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal(props.defaultTab || props.tabs[0]?.id);

  return (
    <div class={"flex flex-col " + props.class}>
      <div class="flex border-b border-zinc-800">
        <For each={props.tabs}>
          {(tab) => (
            <button
              onClick={() => setActiveTab(tab.id)}
              class={tabStyles({ active: activeTab() === tab.id })}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>

      <div class="flex-1">
        <For each={props.tabs}>
          {(tab) => (
            <Show when={activeTab() === tab.id}>
              <div class="p-4">{tab.content}</div>
            </Show>
          )}
        </For>
      </div>
    </div>
  );
};

export default Tabs;
