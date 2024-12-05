import { ComponentProps, Show } from "solid-js";
import { cva, type VariantProps } from "cva";

const switchStyles = cva({
  base: "relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
  variants: {
    checked: {
      true: "bg-white",
      false: "bg-zinc-600"
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
      false: "cursor-pointer"
    },
    rounded: {
      true: "rounded-full",
      false: "rounded-none"
    }
  },
  defaultVariants: {
    checked: false,
    disabled: false,
    rounded: false
  }
});

const thumbStyles = cva({
  base: "pointer-events-none inline-block h-4 w-4 transform bg-background shadow-lg ring-0 transition-transform",
  variants: {
    checked: {
      true: "translate-x-6",
      false: "translate-x-1" 
    },
    rounded: {
      true: "rounded-full",
      false: "rounded-none"
    }
  },
  defaultVariants: {
    checked: false,
    rounded: false,
  }
});

interface SwitchProps extends VariantProps<typeof switchStyles> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  class?: string;
  rounded?: boolean;
}

const Switch = (props: SwitchProps & Omit<ComponentProps<"button">, keyof SwitchProps>) => {
  return (
    <div class="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={props.checked}
        disabled={props.disabled}
        onClick={() => props.onChange?.(!props.checked)}
        class={switchStyles({ checked: props.checked, disabled: props.disabled, rounded: props.rounded }) + " " + props.class}
        {...((): Omit<ComponentProps<"button">, keyof SwitchProps> => {
          const { checked, onChange, disabled, label, description, class: className, rounded, ...rest } = props;
          return rest;
        })()}
      >
        <span class="sr-only">{props.label}</span>
        <span class={thumbStyles({ checked: props.checked, rounded: props.rounded })} />
      </button>

      <Show when={props.label || props.description}>
        <div class="flex flex-col">
          <Show when={props.label}>
            <label class="text-sm font-medium text-text select-none">
              {props.label}
            </label>
          </Show>
          <Show when={props.description}>
            <span class="text-xs text-zinc-400 select-none">
              {props.description}
            </span>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default Switch;
