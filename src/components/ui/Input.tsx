import { ComponentProps } from "solid-js";
import { cva, type VariantProps } from "cva";

const styles = cva({
  base: "bg-primary p-2 border text-text border-zinc-800 focus:outline-none",
  variants: {
    size: {
      full: "w-full"
    },
  }
})

const Input = (
  props: VariantProps<typeof styles> & ComponentProps<"input"> & { label?: string }
) => {
  return <>
    <label class="block text-sm text-text mb-1">{props.label}</label>
    <input {...props} class={styles({ size: props.size }) + " " + props.class} />
  </>
}

export default Input;