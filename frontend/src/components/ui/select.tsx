import * as React from "react"

export const Select = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const [value, setValue] = React.useState(props.value || "")
    const [open, setOpen] = React.useState(false)

    // Minimal mock implementation since we don't have Radix
    // We'll expose the Context to children
    return (
        <div ref={ref} {...props} data-value={value} onClick={() => setOpen(!open)}>
            {React.Children.map(props.children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { _context: { value, setValue, open, setOpen, onValueChange: props.onValueChange } } as any)
                }
                return child
            })}
        </div>
    )
})
Select.displayName = "Select"

export const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(({ className, children, ...props }, ref) => (
    <button ref={ref} className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
        {children}
    </button>
))
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = React.forwardRef<HTMLSpanElement, any>(({ className, ...props }, ref) => {
    // In a real implementation this would show the selected label
    // For this mock we just show "Select..." or the value if we don't have the label mapping easily available
    return <span ref={ref} className={className} {...props}>{props._context?.value || "Select..."}</span>
})
SelectValue.displayName = "SelectValue"

export const SelectContent = React.forwardRef<HTMLDivElement, any>(({ className, children, ...props }, ref) => {
    if (!props._context?.open) return null;
    return (
        <div ref={ref} className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 ${className}`} {...props}>
            <div className="p-1">
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, { _context: props._context } as any)
                    }
                    return child;
                })}
            </div>
        </div>
    )
})
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<HTMLDivElement, any>(({ className, children, value, ...props }, ref) => {
    const isSelected = props._context?.value === value;
    return (
        <div
            ref={ref}
            className={`cursor-default select-none relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${isSelected ? "bg-accent" : ""} ${className}`}
            {...props}
            onClick={(e) => {
                e.stopPropagation();
                props._context?.setValue(value);
                props._context?.onValueChange?.(value);
                props._context?.setOpen(false);
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <span>✓</span>}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"
