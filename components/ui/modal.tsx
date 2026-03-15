"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Largura máxima do conteúdo: sm (28rem), md (32rem), lg (42rem), xl (48rem), max (56rem) */
  size?: "sm" | "md" | "lg" | "xl" | "max";
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  max: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "lg",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          "w-full rounded-xl border border-brand-navy-200 bg-white shadow-xl",
          sizeClasses[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="border-b border-brand-navy-100 px-6 py-4">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-brand-navy-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-brand-navy-600">{description}</p>
            )}
          </div>
        )}
        <div className="max-h-[calc(85vh-8rem)] overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
