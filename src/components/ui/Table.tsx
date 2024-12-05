import { cva, type VariantProps } from "cva";
import { ComponentProps, createContext } from "solid-js";

const tableStyles = cva({
  base: "w-full border border-zinc-800 bg-primary",
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg"
    },
    striped: {
      true: "[&_tr:nth-child(even)]:bg-secondary"
    }
  },
  defaultVariants: {
    size: "md",
    striped: false
  }
});

// Context to share table props with child components
const TableContext = createContext<VariantProps<typeof tableStyles>>();

interface TableProps extends VariantProps<typeof tableStyles> {
  children: any;
  class?: string;
}

export const Table = (props: TableProps) => {
  return (
    <TableContext.Provider value={props}>
      <div class="relative overflow-x-auto">
        <table class={tableStyles({ size: props.size, striped: props.striped }) + " " + props.class}>
          {props.children}
        </table>
      </div>
    </TableContext.Provider>
  );
};

export const TableHead = (props: ComponentProps<"thead">) => {
  return (
    <thead class={"bg-secondary text-text " + props.class} {...props}>
      {props.children}
    </thead>
  );
};

export const TableBody = (props: ComponentProps<"tbody">) => {
  return (
    <tbody class={"text-text " + props.class} {...props}>
      {props.children}
    </tbody>
  );
};

export const TableRow = (props: ComponentProps<"tr"> & { clickable?: boolean }) => {
  return (
    <tr
      class={
        "border-t border-zinc-800 transition-colors " +
        (props.clickable ? "hover:bg-primary/50 cursor-pointer " : "") +
        props.class
      }
      {...props}
    >
      {props.children}
    </tr>
  );
};

export const TableCell = (props: ComponentProps<"td">) => {
  return (
    <td class={"px-4 py-2 " + props.class} {...props}>
      {props.children}
    </td>
  );
};

export const TableHeaderCell = (props: ComponentProps<"th">) => {
  return (
    <th class={"px-4 py-2 text-left font-medium " + props.class} {...props}>
      {props.children}
    </th>
  );
};

// Optional empty state component
interface TableEmptyProps {
  colspan: number;
  message?: string;
  isLoading?: boolean;
}

export const TableEmpty = (props: TableEmptyProps) => {
  return (
    <tr>
      <td colspan={props.colspan} class="px-4 py-8 text-center text-zinc-400">
        {props.isLoading ? "Loading..." : props.message || "No data available"}
      </td>
    </tr>
  );
};
