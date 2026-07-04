"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title: string;
  icon?: ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
  className,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        {icon}
        <span className="font-semibold text-sm text-foreground flex-1 text-left">
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-black/6 dark:border-white/6">
          {children}
        </div>
      )}
    </div>
  );
}
