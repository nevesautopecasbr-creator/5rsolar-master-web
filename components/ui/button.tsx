import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
  };
  return (
    <button
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
