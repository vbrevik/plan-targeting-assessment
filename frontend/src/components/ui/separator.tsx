import * as React from "react"

export const Separator = React.forwardRef<HTMLDivElement, any>(
    ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
        <div
            ref={ref}
            className={`shrink-0 bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className}`}
            {...props}
        />
    )
)
Separator.displayName = "Separator"
