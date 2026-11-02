import * as React from "react"
import { cn } from "@/lib/utils"

export function Divider({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative flex items-center justify-center py-2 w-full", className)}
      {...props}
    >
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      {children && (
        <span className="relative z-10 bg-card px-2 text-xs uppercase text-muted-foreground">
          {children}
        </span>
      )}
    </div>
  )
}

