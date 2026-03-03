import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-brand-navy-300 bg-white px-4 text-sm text-brand-navy-900",
        "placeholder:text-brand-navy-400",
        "focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange",
        "transition-colors duration-200",
        className,
      )}
      {...props}
    />
  );
}
