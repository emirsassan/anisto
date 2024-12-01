import { cva, type VariantProps } from "cva";
import { ComponentProps } from "solid-js";

const styles = cva({
  base: "transition-colors",
  variants: {
    variant: {
      primary: "bg-primary text-text hover:bg-primary/90",

      secondary: "bg-white text-background hover:bg-white/90"
    },
    size: {
      md: "px-4 py-2",
      sm: "px-3 py-1"
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md"
  }
})

const Button = (
  props: VariantProps<typeof styles> & ComponentProps<"button">
) => {
  return <button {...props} class={styles({ variant: props.variant, size: props.size }) + " " + props.class} />;
}

export default Button;