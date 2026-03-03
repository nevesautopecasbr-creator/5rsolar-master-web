import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default:
      "bg-brand-orange text-white shadow-brand-orange hover:bg-brand-orange-dark focus:ring-brand-orange active:scale-[0.98]",
    outline:
      "border-2 border-brand-navy-300 bg-white text-brand-navy-800 hover:bg-brand-navy-50 hover:border-brand-navy-400 focus:ring-brand-navy-400",
    ghost:
      "bg-transparent text-brand-navy-700 hover:bg-brand-navy-100 focus:ring-brand-navy-300",
  };
  return (
    <button
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
