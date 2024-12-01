import { Show, createSignal, type Component, For, onCleanup, createEffect } from "solid-js";
import { Portal } from "solid-js/web";

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: Component;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
  maxHeight?: string;
  error?: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

const Dropdown: Component<DropdownProps> = (props) => {
  // State
  const [isOpen, setIsOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [triggerRect, setTriggerRect] = createSignal<DOMRect | null>(null);
  
  // Refs
  let triggerRef: HTMLDivElement | undefined;
  let searchInputRef: HTMLInputElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  // Computed values
  const selectedOption = () => 
    props.options.find(opt => String(opt.value) === String(props.value));

  const filteredOptions = () => 
    !search() 
      ? props.options 
      : props.options.filter(opt => 
          opt.label.toLowerCase().includes(search().toLowerCase())
        );

  // Event handlers
  const updatePosition = () => {
    if (triggerRef) {
      const rect = triggerRef.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = dropdownRef?.offsetHeight || 0;

      setTriggerRect(rect);

      // Adjust dropdown position if it would overflow viewport
      if (dropdownRef) {
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          dropdownRef.style.top = `${rect.top - dropdownHeight}px`;
        } else {
          dropdownRef.style.top = `${rect.bottom}px`;
        }
      }
    }
  };

  const handleTriggerClick = () => {
    if (props.disabled) return;
    
    const newIsOpen = !isOpen();
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      updatePosition();
      queueMicrotask(() => {
        if (props.searchable) {
          searchInputRef?.focus();
        }
      });
    }
  };

  const handleOptionSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    props.onChange?.(option.value);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    props.onChange?.("");
    setSearch("");
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (!triggerRef?.contains(target) && !dropdownRef?.contains(target)) {
      setIsOpen(false);
      setSearch("");
    }
  };

  // Effects
  createEffect(() => {
    if (isOpen()) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  });

  // Render helpers
  const renderTrigger = () => (
    <div
      ref={triggerRef}
      onClick={handleTriggerClick}
      class={`
        bg-primary border border-zinc-800 px-3 py-2 text-text
        flex items-center justify-between gap-2 cursor-pointer
        ${props.disabled ? "opacity-50 cursor-not-allowed" : "hover:border-zinc-700"}
        ${props.error ? "border-red-500" : ""}
      `}
    >
      <div class="flex-1 flex items-center gap-2">
        <Show when={selectedOption()?.icon}>
          <div class="w-5 h-5">{selectedOption()?.icon?.({})}</div>
        </Show>
        <Show
          when={selectedOption()}
          fallback={<span class="text-zinc-400">{props.placeholder || "Select option"}</span>}
        >
          {selectedOption()?.label}
        </Show>
      </div>
      <div class="flex items-center gap-2">
        <Show when={props.clearable && props.value}>
          <button
            onClick={handleClear}
            class="text-zinc-400 hover:text-zinc-300"
          >
            ✕
          </button>
        </Show>
        <svg
          class={`w-4 h-4 transition-transform ${isOpen() ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </div>
    </div>
  );

  const renderDropdown = () => (
    <Show when={isOpen() && triggerRect()}>
      <Portal>
        <div
          ref={dropdownRef}
          class="fixed z-50 bg-secondary border border-zinc-800 mt-1 shadow-lg"
          style={{
            width: `${triggerRect()?.width}px`,
            left: `${triggerRect()?.left}px`,
            "max-height": props.maxHeight || "300px",
          }}
        >
          <Show when={props.searchable}>
            <div class="p-2 border-b border-zinc-800">
              <input
                ref={searchInputRef}
                type="text"
                value={search()}
                onInput={(e) => setSearch(e.currentTarget.value)}
                class="w-full bg-primary text-text px-2 py-1 focus:outline-none"
                placeholder="Search..."
              />
            </div>
          </Show>

          <div
            class="overflow-y-auto
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              dark:[&::-webkit-scrollbar-track]:bg-neutral-700
              dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            style={{ "max-height": "250px" }}
          >
            <For each={filteredOptions()}>
              {(option) => (
                <div
                  onClick={() => handleOptionSelect(option)}
                  class={`
                    px-3 py-2 flex items-center gap-2 cursor-pointer text-text
                    ${option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary"}
                    ${option.value === props.value ? "bg-primary" : ""}
                  `}
                >
                  <Show when={option.icon}>
                    <div class="w-5 h-5">{option.icon?.({})}</div>
                  </Show>
                  {option.label}
                </div>
              )}
            </For>
          </div>
        </div>
      </Portal>
    </Show>
  );

  return (
    <div class="relative" style={{ width: props.width }}>
      <Show when={props.label}>
        <label class="block text-text text-sm mb-1">
          {props.label}
          <Show when={props.required}>
            <span class="text-red-500 ml-1">*</span>
          </Show>
        </label>
      </Show>

      {renderTrigger()}

      <Show when={props.error}>
        <p class="text-red-500 text-sm mt-1">{props.error}</p>
      </Show>

      {renderDropdown()}
    </div>
  );
};

export default Dropdown;
