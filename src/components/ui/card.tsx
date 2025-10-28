import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}